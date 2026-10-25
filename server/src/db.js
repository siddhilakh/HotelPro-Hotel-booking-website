import mongoose from 'mongoose';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

let cachedPromise = null;

export async function connectDB() {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (cachedPromise) {
    return cachedPromise;
  }

  let uri = process.env.MONGO_URI;

  if (!uri) {
    if (process.env.VERCEL || process.env.NODE_ENV === 'production') {
      throw new Error(
        'MONGO_URI is required in production / Vercel. Please configure your MongoDB Atlas connection string in your environment variables.'
      );
    }

    // No external database configured: run an embedded MongoDB for local dev.
    const { MongoMemoryServer } = await import('mongodb-memory-server');
    const dbPath = path.join(__dirname, '..', '.data');
    fs.mkdirSync(dbPath, { recursive: true });
    const mongod = await MongoMemoryServer.create({
      instance: { dbPath, storageEngine: 'wiredTiger', port: 27518 },
    });
    uri = mongod.getUri('hotelpro');
    console.log('[db] Using embedded MongoDB (set MONGO_URI to use your own)');
  }

  cachedPromise = mongoose.connect(uri, {
    serverSelectionTimeoutMS: 8000,
  }).catch((err) => {
    cachedPromise = null;
    throw err;
  });

  await cachedPromise;
  console.log('[db] Connected');
  return mongoose.connection;
}

