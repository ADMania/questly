import Database from "better-sqlite3";
import postgres from "postgres";
import { drizzle as drizzleSqlite } from "drizzle-orm/better-sqlite3";
import { drizzle as drizzlePostgres } from "drizzle-orm/postgres-js";
import type { DrizzleD1Database } from "drizzle-orm/d1";
import { pgSchema, schemaDialect, sqliteSchema } from "@/db/schema";

const globalForDb = globalThis as { db?: DrizzleD1Database };

function createDatabase(): DrizzleD1Database {
  const usePostgres = schemaDialect === "postgres";

  if (usePostgres) {
    const connection =
      process.env.POSTGRES_URL ??
      (process.env.DATABASE_URL?.startsWith("postgres")
        ? process.env.DATABASE_URL
        : undefined);

    if (!connection) {
      throw new Error("POSTGRES_URL (или DATABASE_URL с postgresql) не задан");
    }

    const client = postgres(connection, {
      max: process.env.NODE_ENV === "production" ? 3 : 1,
      idle_timeout: 20,
    });
    return drizzlePostgres(client, { schema: pgSchema }) as unknown as DrizzleD1Database;
  }

  const sqliteFile = process.env.DATABASE_URL?.replace("file:", "") || "dev.db";
  const sqlite = new Database(sqliteFile);
  return drizzleSqlite(sqlite, { schema: sqliteSchema }) as unknown as DrizzleD1Database;
}

export const db = globalForDb.db ?? createDatabase();

if (!globalForDb.db) {
  globalForDb.db = db;
}
