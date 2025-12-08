import { integer, text, sqliteTable } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const users = sqliteTable("user", {
    id: integer("id").primaryKey(),
    username: text("username").notNull().unique(),
    email: text("email").notNull().unique(),
    password: text("password").notNull(),
    avatarUrl: text("avatar_url"),
    createdAt: integer("created_at", { mode: "timestamp" }).default(sql`CURRENT_TIMESTAMP`),
    updatedAt: integer("updated_at", { mode: "timestamp" }).default(sql`CURRENT_TIMESTAMP`),
});

export const posts = sqliteTable("post", {
    id: integer("id").primaryKey(),
    title: text("title").notNull(),
    content: text("content").notNull(),
    isPublic: integer("is_public", { mode: "boolean" }).default(true),
    createdAt: integer("created_at", { mode: "timestamp" }).default(sql`CURRENT_TIMESTAMP`),
    updatedAt: integer("updated_at", { mode: "timestamp" }).default(sql`CURRENT_TIMESTAMP`),
    authorId: integer("author_id").references(() => users.id).notNull(),
    attachedCardId: integer("attached_card_id").references(() => cards.id),
});

export const cards = sqliteTable("card", {
    id: integer("id").primaryKey(),
    slug: text("slug").notNull().unique(),
    questText: text("quest_text").notNull(),
    difficulty: text("difficulty").default("medium"),
    symbolSeed: text("symbol_seed"),
    category: text("category"),
    ownerId: integer("owner_id").references(() => users.id),
});

export const questTemplates = sqliteTable("quest_template", {
    id: integer("id").primaryKey(),
    text: text("text").notNull(),
    weight: integer("weight").default(1),
    difficulty: text("difficulty").default("medium"),
    category: text("category"),
});

export const comments = sqliteTable("comment", {
    id: integer("id").primaryKey(),
    content: text("content").notNull(),
    createdAt: integer("created_at", { mode: "timestamp" }).default(sql`CURRENT_TIMESTAMP`),
    updatedAt: integer("updated_at", { mode: "timestamp" }).default(sql`CURRENT_TIMESTAMP`),
    authorId: integer("author_id").references(() => users.id).notNull(),
    postId: integer("post_id").references(() => posts.id).notNull(),
});

export const votes = sqliteTable("vote", {
    id: integer("id").primaryKey(),
    userId: integer("user_id").references(() => users.id).notNull(),
    postId: integer("post_id").references(() => posts.id).notNull(),
    value: integer("value").default(1),
});
