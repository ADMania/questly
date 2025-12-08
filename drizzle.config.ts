import { defineConfig } from "drizzle-kit";

const isProd = process.env.NODE_ENV === "production";

export default defineConfig({
  schema: "./db/schema/index.ts",
  out: "./drizzle",
  dialect: isProd ? "postgresql" : "sqlite",
  dbCredentials: isProd
    ? {
        url: process.env.POSTGRES_URL!,
      }
    : {
        url: process.env.DATABASE_URL || "file:./dev.db",
      },
});
