import { drizzle as drizzleSqlite } from "drizzle-orm/better-sqlite3";
import { drizzle as drizzlePostgres } from "drizzle-orm/postgres-js";
import Database from "better-sqlite3";
import postgres from "postgres";

// общий интерфейс для совместимости методов
import type { DrizzleD1Database } from "drizzle-orm/d1";

const isProd = process.env.NODE_ENV === "production";

const globalForDb = global as unknown as {
  db: DrizzleD1Database | undefined;
};

let dbInstance: any;

if (isProd) {
  const url = process.env.POSTGRES_URL;
  if (!url) throw new Error("POSTGRES_URL is not set");

  const client = postgres(url, { max: 1 });
  dbInstance = drizzlePostgres(client);
} else {
  const sqliteFile = process.env.DATABASE_URL?.replace("file:", "") || "dev.db";
  const sqlite = new Database(sqliteFile);
  dbInstance = drizzleSqlite(sqlite);
}

export const db = (globalForDb.db ?? dbInstance) as unknown as DrizzleD1Database;

if (!isProd) globalForDb.db = db;
