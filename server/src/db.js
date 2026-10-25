import mongoose from 'mongoose';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export async function connectDB() {
  let uri = process.env.MONGO_URI;

  if (!uri) {
    // No external database configured: run an embedded MongoDB so the app works out of the box.
    const { MongoMemoryServer } = await import('mongodb-memory-server');
    const dbPath = path.join(__dirname, '..', '.data');
    fs.mkdirSync(dbPath, { recursive: true });
    const mongod = await MongoMemoryServer.create({
      instance: { dbPath, storageEngine: 'wiredTiger', port: 27518 },
    });
    uri = mongod.getUri('hotelpro');
    console.log('[db] Using embedded MongoDB (set MONGO_URI to use your own)');
  }

  await mongoose.connect(uri);
  console.log('[db] Connected');
}
