import { Router } from 'express';
import User from '../models/User.js';
import { protect, signToken } from '../middleware/auth.js';
import { wrap, httpError } from '../middleware/error.js';

const router = Router();
const EMAIL = /^\S+@\S+\.\S+$/;

const publicUser = (u) => ({ id: u._id, name: u.name, email: u.email, phone: u.phone, role: u.role });

router.post(
  '/register',
  wrap(async (req, res) => {
    const { name, email, password, phone } = req.body;
    if (!name?.trim()) throw httpError(400, 'Name is required');
    if (!EMAIL.test(email || '')) throw httpError(400, 'A valid email is required');
    if (!password || password.length < 6) throw httpError(400, 'Password must be at least 6 characters');

    // Role is never accepted from the client; everyone registers as a guest.
    const user = await User.create({ name, email, password, phone });
    res.status(201).json({ token: signToken(user._id), user: publicUser(user) });
  })
);

router.post(
  '/login',
  wrap(async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) throw httpError(400, 'Email and password are required');

    const user = await User.findOne({ email: String(email).toLowerCase() }).select('+password');
    if (!user || !(await user.matchPassword(password))) throw httpError(401, 'Invalid email or password');

    res.json({ token: signToken(user._id), user: publicUser(user) });
  })
);

router.get('/me', protect, (req, res) => res.json({ user: publicUser(req.user) }));

export default router;
