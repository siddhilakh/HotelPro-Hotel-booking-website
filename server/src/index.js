import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';

import { connectDB } from './db.js';
import { seedIfEmpty } from './seed.js';
import { notFound, errorHandler } from './middleware/error.js';
import authRoutes from './routes/auth.js';
import roomRoutes from './routes/rooms.js';
import bookingRoutes from './routes/bookings.js';
import adminRoutes from './routes/admin.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'dev-only-secret-change-me';
  if (!process.env.VERCEL) {
    console.warn('[auth] JWT_SECRET not set, using an insecure development secret');
  }
}

const app = express();
app.use(helmet({ contentSecurityPolicy: false, crossOriginResourcePolicy: false }));

// Flexible CORS support: allow configured CLIENT_URL or reflect requesting origin (vital for cloud deployments)
const clientUrl = process.env.CLIENT_URL;
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (!clientUrl || clientUrl === '*' || clientUrl.split(',').map((s) => s.trim()).includes(origin)) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    credentials: true,
  })
);

app.use(express.json({ limit: '100kb' }));

// Throttle credential endpoints to slow brute-force attempts.
app.use('/api/auth', rateLimit({ windowMs: 15 * 60 * 1000, limit: 100, standardHeaders: true, legacyHeaders: false }));

// Cached database initialization for serverless and traditional runtimes
let dbInitPromise = null;
async function ensureDB() {
  if (mongoose.connection.readyState === 1) return;
  if (!dbInitPromise) {
    dbInitPromise = (async () => {
      await connectDB();
      await seedIfEmpty();
    })().catch((err) => {
      dbInitPromise = null;
      throw err;
    });
  }
  return dbInitPromise;
}

// Root endpoint for API diagnosis
app.get('/', (req, res) => {
  res.json({
    status: 'HotelPro API is live',
    health: '/api/health',
    endpoints: ['/api/rooms', '/api/bookings', '/api/auth'],
  });
});

// Diagnostic health check: always returns 200 with DB status to keep cloud health-checks alive
app.get('/api/health', async (req, res) => {
  let dbStatus = 'disconnected';
  try {
    if (mongoose.connection.readyState === 1) {
      dbStatus = 'connected';
    } else if (process.env.MONGO_URI || !process.env.VERCEL) {
      await ensureDB();
      dbStatus = 'connected';
    }
  } catch (err) {
    dbStatus = `error: ${err.message}`;
  }

  res.json({
    ok: true,
    db: dbStatus,
    mongoConfigured: Boolean(process.env.MONGO_URI),
    platform: process.env.VERCEL ? 'vercel' : 'node',
    timestamp: new Date().toISOString(),
  });
});

// Middleware to ensure DB connection before handling business API routes
app.use('/api', async (req, res, next) => {
  if (req.path === '/health') return next();
  try {
    await ensureDB();
    next();
  } catch (err) {
    console.error('[db] DB connection error:', err.message);
    res.status(503).json({
      message: 'Database connection unavailable',
      error: err.message,
      hint: !process.env.MONGO_URI
        ? 'MONGO_URI environment variable is missing. In Vercel Project Settings > Environment Variables, add MONGO_URI with your MongoDB Atlas connection string.'
        : 'Could not connect to MongoDB with current MONGO_URI. Check MongoDB Atlas: 1) Network Access whitelist (add 0.0.0.0/0), 2) Database user credentials and password.',
    });
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/admin', adminRoutes);

// Serve the built React app when it exists (for fullstack node deployments).
const dist = path.join(__dirname, '..', '..', 'client', 'dist');
if (fs.existsSync(dist)) {
  app.use(express.static(dist));
  app.get(/^(?!\/api).*/, (req, res) => res.sendFile(path.join(dist, 'index.html')));
}

app.use('/api', notFound);
app.use(errorHandler);

// Only start the HTTP listener when executed directly as a script (e.g. npm start / dev).
// When imported by serverless handlers (Vercel) or other modules, export app without binding a port.
const isDirectRun = Boolean(process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1]));

if (isDirectRun && !process.env.VERCEL) {
  const PORT = process.env.PORT || 5000;
  ensureDB()
    .then(() => {
      app.listen(PORT, () => console.log(`[api] HotelPro running on http://localhost:${PORT}`));
    })
    .catch((err) => {
      console.error('[db] Initial DB connection failed:', err.message);
      app.listen(PORT, () => console.log(`[api] HotelPro running on http://localhost:${PORT} (waiting for DB)`));
    });
}

export default app;


