import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';

// Singleton for dev HMR
const globalForDb = global as unknown as { db: ReturnType<typeof drizzle> };

const sqlite = new Database('dev.db');
export const db = globalForDb.db || drizzle(sqlite);

if (process.env.NODE_ENV !== 'production') globalForDb.db = db;
