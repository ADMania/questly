import { drizzle as drizzleSqlite } from "drizzle-orm/better-sqlite3";
import { drizzle as drizzlePostgres } from "drizzle-orm/postgres-js";
import type { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import Database from "better-sqlite3";
import postgres from "postgres";
import { schemaDialect } from "@/db/schema";

type DatabaseInstance = BetterSQLite3Database | PostgresJsDatabase;

const globalForDb = globalThis as { db?: DatabaseInstance };

if (!globalForDb.db) {
  if (schemaDialect === "postgres") {
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
    globalForDb.db = drizzlePostgres(client);
  } else {
    const sqliteFile = process.env.DATABASE_URL?.replace("file:", "") || "dev.db";
    const sqlite = new Database(sqliteFile);
    globalForDb.db = drizzleSqlite(sqlite);
  }
}

export const db = globalForDb.db;
