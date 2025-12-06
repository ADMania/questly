import { defineConfig } from 'drizzle-kit';

export default defineConfig({
    schema: './db/schema/index.ts',
    out: './drizzle',
    dialect: 'sqlite',
    dbCredentials: {
        url: 'file:dev.db',
    },
});
