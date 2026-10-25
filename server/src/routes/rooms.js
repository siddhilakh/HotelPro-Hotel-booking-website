import { Router } from 'express';
import Room from '../models/Room.js';
import Booking from '../models/Booking.js';
import { protect, adminOnly } from '../middleware/auth.js';
import { wrap, httpError } from '../middleware/error.js';

const router = Router();

const ROOM_FIELDS = [
  'name', 'type', 'description', 'price', 'capacity', 'size', 'bed',
  'view', 'amenities', 'images', 'rating', 'featured', 'isActive',
];
const pick = (body) => Object.fromEntries(ROOM_FIELDS.filter((k) => k in body).map((k) => [k, body[k]]));

export const parseDate = (value) => {
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
};

// Returns the set of room ids that have an active booking overlapping [checkIn, checkOut).
export async function bookedRoomIds(checkIn, checkOut) {
  const ids = await Booking.find({
    status: { $ne: 'cancelled' },
    checkIn: { $lt: checkOut },
    checkOut: { $gt: checkIn },
  }).distinct('room');
  return new Set(ids.map(String));
}

// Listing inactive rooms (?all=true) is an admin-only view.
const adminIfAll = (req, res, next) =>
  req.query.all === 'true' ? protect(req, res, (e) => (e ? next(e) : adminOnly(req, res, next))) : next();

router.get(
  '/',
  adminIfAll,
  wrap(async (req, res) => {
    const { type, minPrice, maxPrice, guests, checkIn, checkOut, sort, featured, all } = req.query;
    const filter = {};
    if (all !== 'true') filter.isActive = true;
    if (type && type !== 'All') filter.type = type;
    if (featured === 'true') filter.featured = true;
    if (guests) filter.capacity = { $gte: Number(guests) };
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    const sorts = { 'price-asc': { price: 1 }, 'price-desc': { price: -1 }, rating: { rating: -1 } };
    let rooms = await Room.find(filter).sort(sorts[sort] || { price: 1 }).lean();

    const from = parseDate(checkIn);
    const to = parseDate(checkOut);
    if (from && to && to > from) {
      const taken = await bookedRoomIds(from, to);
      rooms = rooms.map((r) => ({ ...r, available: !taken.has(String(r._id)) }));
    }
    res.json(rooms);
  })
);

router.get(
  '/:id',
  wrap(async (req, res) => {
    const room = await Room.findById(req.params.id).lean();
    if (!room) throw httpError(404, 'Room not found');
    res.json(room);
  })
);

// Booked date ranges so the booking form can warn about conflicts early.
router.get(
  '/:id/availability',
  wrap(async (req, res) => {
    const ranges = await Booking.find({
      room: req.params.id,
      status: { $ne: 'cancelled' },
      checkOut: { $gt: new Date() },
    })
      .select('checkIn checkOut -_id')
      .sort({ checkIn: 1 })
      .lean();
    res.json(ranges);
  })
);

router.post(
  '/',
  protect,
  adminOnly,
  wrap(async (req, res) => {
    res.status(201).json(await Room.create(pick(req.body)));
  })
);

router.put(
  '/:id',
  protect,
  adminOnly,
  wrap(async (req, res) => {
    const room = await Room.findByIdAndUpdate(req.params.id, pick(req.body), {
      new: true,
      runValidators: true,
    });
    if (!room) throw httpError(404, 'Room not found');
    res.json(room);
  })
);

router.delete(
  '/:id',
  protect,
  adminOnly,
  wrap(async (req, res) => {
    const upcoming = await Booking.exists({
      room: req.params.id,
      status: { $in: ['confirmed', 'checked-in'] },
      checkOut: { $gt: new Date() },
    });
    if (upcoming) throw httpError(409, 'This room has upcoming bookings. Deactivate it instead.');
    const room = await Room.findByIdAndDelete(req.params.id);
    if (!room) throw httpError(404, 'Room not found');
    res.json({ message: 'Room deleted' });
  })
);

export default router;
