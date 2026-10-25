import { Router } from 'express';
import Booking from '../models/Booking.js';
import Room from '../models/Room.js';
import User from '../models/User.js';
import { protect, adminOnly } from '../middleware/auth.js';
import { wrap } from '../middleware/error.js';

const router = Router();
router.use(protect, adminOnly);

router.get(
  '/stats',
  wrap(async (req, res) => {
    const now = new Date();
    const live = { status: { $ne: 'cancelled' } };

    const [totalRooms, guests, bookings, occupied, arrivals, revenueAgg, monthly, byStatus] = await Promise.all([
      Room.countDocuments({ isActive: true }),
      User.countDocuments({ role: 'guest' }),
      Booking.countDocuments(),
      Booking.countDocuments({ status: { $in: ['confirmed', 'checked-in'] }, checkIn: { $lte: now }, checkOut: { $gt: now } }),
      Booking.countDocuments({ status: 'confirmed', checkIn: { $gte: new Date(now.toDateString()), $lt: new Date(+new Date(now.toDateString()) + 86400000) } }),
      Booking.aggregate([{ $match: live }, { $group: { _id: null, total: { $sum: '$total' } } }]),
      Booking.aggregate([
        { $match: { ...live, createdAt: { $gte: new Date(now.getFullYear(), now.getMonth() - 5, 1) } } },
        { $group: { _id: { y: { $year: '$createdAt' }, m: { $month: '$createdAt' } }, revenue: { $sum: '$total' }, count: { $sum: 1 } } },
      ]),
      Booking.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    ]);

    // Build a continuous 6-month series, including months with no bookings.
    const series = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const hit = monthly.find((x) => x._id.y === d.getFullYear() && x._id.m === d.getMonth() + 1);
      series.push({
        label: d.toLocaleString('en', { month: 'short' }),
        revenue: hit?.revenue || 0,
        count: hit?.count || 0,
      });
    }

    res.json({
      totalRooms,
      guests,
      bookings,
      occupied,
      arrivals,
      occupancyRate: totalRooms ? Math.round((occupied / totalRooms) * 100) : 0,
      revenue: revenueAgg[0]?.total || 0,
      monthly: series,
      byStatus: Object.fromEntries(byStatus.map((s) => [s._id, s.count])),
    });
  })
);

export default router;
