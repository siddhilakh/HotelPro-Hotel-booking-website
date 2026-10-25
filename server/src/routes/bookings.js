import { Router } from 'express';
import Booking from '../models/Booking.js';
import Room from '../models/Room.js';
import { protect, adminOnly } from '../middleware/auth.js';
import { wrap, httpError } from '../middleware/error.js';
import { parseDate, bookedRoomIds } from './rooms.js';

const router = Router();
const DAY = 86400000;
const STATUSES = ['confirmed', 'checked-in', 'checked-out', 'cancelled'];
const POPULATE = [
  { path: 'room', select: 'name type images price' },
  { path: 'user', select: 'name email phone' },
];

router.use(protect);

router.post(
  '/',
  wrap(async (req, res) => {
    const { roomId, guests, specialRequests, paymentMethod } = req.body;
    const checkIn = parseDate(req.body.checkIn);
    const checkOut = parseDate(req.body.checkOut);

    if (!checkIn || !checkOut) throw httpError(400, 'Please choose valid dates');
    if (checkOut <= checkIn) throw httpError(400, 'Check-out must be after check-in');
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    if (checkIn < today) throw httpError(400, 'Check-in cannot be in the past');

    const room = await Room.findById(roomId);
    if (!room || !room.isActive) throw httpError(404, 'Room not found');
    const guestCount = Number(guests) || 1;
    if (guestCount < 1 || guestCount > room.capacity)
      throw httpError(400, `This room sleeps up to ${room.capacity} guests`);

    if ((await bookedRoomIds(checkIn, checkOut)).has(String(room._id)))
      throw httpError(409, 'Sorry, this room is already booked for those dates');

    const nights = Math.round((checkOut - checkIn) / DAY);
    const method = ['card', 'upi', 'pay-at-hotel'].includes(paymentMethod) ? paymentMethod : 'card';

    // Price is always computed server-side; the client total is never trusted.
    const booking = await Booking.create({
      user: req.user._id,
      room: room._id,
      checkIn,
      checkOut,
      guests: guestCount,
      nights,
      total: Math.round(room.price * nights * 1.12), // includes 12% tax
      specialRequests,
      payment: { method, status: method === 'pay-at-hotel' ? 'pending' : 'paid' },
    });
    res.status(201).json(await booking.populate(POPULATE));
  })
);

router.get(
  '/mine',
  wrap(async (req, res) => {
    res.json(await Booking.find({ user: req.user._id }).populate(POPULATE).sort({ checkIn: -1 }));
  })
);

router.patch(
  '/:id/cancel',
  wrap(async (req, res) => {
    const booking = await Booking.findById(req.params.id);
    if (!booking) throw httpError(404, 'Booking not found');
    const isOwner = String(booking.user) === String(req.user._id);
    if (!isOwner && req.user.role !== 'admin') throw httpError(403, 'Not your booking');
    if (booking.status !== 'confirmed') throw httpError(400, 'Only upcoming bookings can be cancelled');

    booking.status = 'cancelled';
    if (booking.payment.status === 'paid') booking.payment.status = 'refunded';
    await booking.save();
    res.json(await booking.populate(POPULATE));
  })
);

// ---------- Admin ----------
router.get(
  '/',
  adminOnly,
  wrap(async (req, res) => {
    const filter = req.query.status && STATUSES.includes(req.query.status) ? { status: req.query.status } : {};
    res.json(await Booking.find(filter).populate(POPULATE).sort({ createdAt: -1 }));
  })
);

router.patch(
  '/:id/status',
  adminOnly,
  wrap(async (req, res) => {
    const { status } = req.body;
    if (!STATUSES.includes(status)) throw httpError(400, 'Invalid status');
    const booking = await Booking.findById(req.params.id);
    if (!booking) throw httpError(404, 'Booking not found');

    booking.status = status;
    if (status === 'cancelled' && booking.payment.status === 'paid') booking.payment.status = 'refunded';
    if (status === 'checked-out' && booking.payment.status === 'pending') booking.payment.status = 'paid';
    await booking.save();
    res.json(await booking.populate(POPULATE));
  })
);

export default router;
