import { defineConfig } from "drizzle-kit";

const envDialect = (process.env.DRIZZLE_DIALECT ?? process.env.DATABASE_DIALECT ?? process.env.DB_CLIENT)?.toLowerCase();
const isPostgres =
  envDialect === "postgres" ||
  envDialect === "postgresql" ||
  process.env.NODE_ENV === "production";

const dialect = isPostgres ? "postgresql" : "sqlite";

const databaseUrl = isPostgres
  ? process.env.POSTGRES_URL ?? process.env.DATABASE_URL ?? "postgres://postgres:postgres@localhost:5432/questly"
  : process.env.DATABASE_URL ?? "file:./dev.db";

export default defineConfig({
  schema: "./db/schema/index.ts",
  out: "./drizzle",
  dialect,
  dbCredentials: {
    url: databaseUrl,
  },
});
