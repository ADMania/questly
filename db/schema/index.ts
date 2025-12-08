import { sql } from "drizzle-orm";
import {
  sqliteTable,
  integer as sqliteInteger,
  text as sqliteText,
} from "drizzle-orm/sqlite-core";
import {
  boolean,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

const sqliteUsers = sqliteTable("user", {
  id: sqliteInteger("id").primaryKey(),
  username: sqliteText("username").notNull().unique(),
  email: sqliteText("email").notNull().unique(),
  password: sqliteText("password").notNull(),
  avatarUrl: sqliteText("avatar_url"),
  isAdmin: sqliteInteger("is_admin", { mode: "boolean" }).notNull().default(false),
  createdAt: sqliteInteger("created_at", { mode: "timestamp" }).default(sql`CURRENT_TIMESTAMP`),
  updatedAt: sqliteInteger("updated_at", { mode: "timestamp" }).default(sql`CURRENT_TIMESTAMP`),
});

const sqliteCards = sqliteTable("card", {
  id: sqliteInteger("id").primaryKey(),
  slug: sqliteText("slug").notNull().unique(),
  questText: sqliteText("quest_text").notNull(),
  difficulty: sqliteText("difficulty").notNull().default("medium"),
  symbolSeed: sqliteText("symbol_seed"),
  category: sqliteText("category"),
  ownerId: sqliteInteger("owner_id").references(() => sqliteUsers.id),
});

const sqlitePosts = sqliteTable("post", {
  id: sqliteInteger("id").primaryKey(),
  title: sqliteText("title").notNull(),
  content: sqliteText("content").notNull(),
  isPublic: sqliteInteger("is_public", { mode: "boolean" }).notNull().default(true),
  createdAt: sqliteInteger("created_at", { mode: "timestamp" }).default(sql`CURRENT_TIMESTAMP`),
  updatedAt: sqliteInteger("updated_at", { mode: "timestamp" }).default(sql`CURRENT_TIMESTAMP`),
  authorId: sqliteInteger("author_id").references(() => sqliteUsers.id).notNull(),
  attachedCardId: sqliteInteger("attached_card_id").references(() => sqliteCards.id),
});

const sqliteQuestTemplates = sqliteTable("quest_template", {
  id: sqliteInteger("id").primaryKey(),
  text: sqliteText("text").notNull(),
  weight: sqliteInteger("weight").notNull().default(1),
  difficulty: sqliteText("difficulty").notNull().default("medium"),
  category: sqliteText("category"),
});

const sqliteComments = sqliteTable("comment", {
  id: sqliteInteger("id").primaryKey(),
  content: sqliteText("content").notNull(),
  createdAt: sqliteInteger("created_at", { mode: "timestamp" }).default(sql`CURRENT_TIMESTAMP`),
  updatedAt: sqliteInteger("updated_at", { mode: "timestamp" }).default(sql`CURRENT_TIMESTAMP`),
  authorId: sqliteInteger("author_id").references(() => sqliteUsers.id).notNull(),
  postId: sqliteInteger("post_id").references(() => sqlitePosts.id).notNull(),
});

const sqliteVotes = sqliteTable("vote", {
  id: sqliteInteger("id").primaryKey(),
  userId: sqliteInteger("user_id").references(() => sqliteUsers.id).notNull(),
  postId: sqliteInteger("post_id").references(() => sqlitePosts.id).notNull(),
  value: sqliteInteger("value").notNull().default(1),
});

const sqliteFeedbacks = sqliteTable("feedback", {
  id: sqliteInteger("id").primaryKey(),
  message: sqliteText("message").notNull(),
  type: sqliteText("type").default("bug"),
  pageContext: sqliteText("page_context"),
  status: sqliteText("status").notNull().default("new"),
  userId: sqliteInteger("user_id").references(() => sqliteUsers.id),
  userEmail: sqliteText("user_email"),
  userName: sqliteText("user_name"),
  createdAt: sqliteInteger("created_at", { mode: "timestamp" }).default(sql`CURRENT_TIMESTAMP`),
});

export const sqliteSchema = {
  users: sqliteUsers,
  cards: sqliteCards,
  posts: sqlitePosts,
  questTemplates: sqliteQuestTemplates,
  comments: sqliteComments,
  votes: sqliteVotes,
  feedbacks: sqliteFeedbacks,
};

const pgUsers = pgTable(
  "users",
  {
    id: serial("id").primaryKey(),
    username: text("username").notNull(),
    email: text("email").notNull(),
    password: text("password").notNull(),
    avatarUrl: text("avatar_url"),
    isAdmin: boolean("is_admin").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (table) => ({
    usernameUnique: uniqueIndex("users_username_unique").on(table.username),
    emailUnique: uniqueIndex("users_email_unique").on(table.email),
  }),
);

const pgCards = pgTable(
  "cards",
  {
    id: serial("id").primaryKey(),
    slug: text("slug").notNull(),
    questText: text("quest_text").notNull(),
    difficulty: text("difficulty").notNull().default("medium"),
    symbolSeed: text("symbol_seed"),
    category: text("category"),
    ownerId: integer("owner_id").references(() => pgUsers.id, {
      onDelete: "set null",
    }),
  },
  (table) => ({
    slugUnique: uniqueIndex("cards_slug_unique").on(table.slug),
  }),
);

const pgPosts = pgTable("posts", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  isPublic: boolean("is_public").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  authorId: integer("author_id")
    .references(() => pgUsers.id, { onDelete: "cascade" })
    .notNull(),
  attachedCardId: integer("attached_card_id").references(() => pgCards.id, {
    onDelete: "set null",
  }),
});

const pgQuestTemplates = pgTable("quest_templates", {
  id: serial("id").primaryKey(),
  text: text("text").notNull(),
  weight: integer("weight").notNull().default(1),
  difficulty: text("difficulty").notNull().default("medium"),
  category: text("category"),
});

const pgComments = pgTable("comments", {
  id: serial("id").primaryKey(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  authorId: integer("author_id")
    .references(() => pgUsers.id, { onDelete: "cascade" })
    .notNull(),
  postId: integer("post_id")
    .references(() => pgPosts.id, { onDelete: "cascade" })
    .notNull(),
});

const pgVotes = pgTable(
  "votes",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .references(() => pgUsers.id, { onDelete: "cascade" })
      .notNull(),
    postId: integer("post_id")
      .references(() => pgPosts.id, { onDelete: "cascade" })
      .notNull(),
    value: integer("value").notNull().default(1),
  },
  (table) => ({
    userPostUnique: uniqueIndex("votes_user_post_unique").on(
      table.userId,
      table.postId,
    ),
  }),
);

const pgFeedbacks = pgTable("feedbacks", {
  id: serial("id").primaryKey(),
  message: text("message").notNull(),
  type: text("type").default("bug"),
  pageContext: text("page_context"),
  status: text("status").notNull().default("new"),
  userId: integer("user_id").references(() => pgUsers.id, {
    onDelete: "set null",
  }),
  userEmail: text("user_email"),
  userName: text("user_name"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const pgSchema = {
  users: pgUsers,
  cards: pgCards,
  posts: pgPosts,
  questTemplates: pgQuestTemplates,
  comments: pgComments,
  votes: pgVotes,
  feedbacks: pgFeedbacks,
};

const envDialect = (process.env.DATABASE_DIALECT ?? process.env.DB_CLIENT ?? "").toLowerCase();
const usePostgres =
  envDialect === "postgres" ||
  envDialect === "postgresql" ||
  process.env.DATABASE_URL?.startsWith("postgres") ||
  (process.env.NODE_ENV === "production" && Boolean(process.env.POSTGRES_URL));

export const users = (usePostgres ? pgUsers : sqliteUsers) as typeof sqliteUsers;
export const cards = (usePostgres ? pgCards : sqliteCards) as typeof sqliteCards;
export const posts = (usePostgres ? pgPosts : sqlitePosts) as typeof sqlitePosts;
export const questTemplates = (usePostgres
  ? pgQuestTemplates
  : sqliteQuestTemplates) as typeof sqliteQuestTemplates;
export const comments = (usePostgres ? pgComments : sqliteComments) as typeof sqliteComments;
export const votes = (usePostgres ? pgVotes : sqliteVotes) as typeof sqliteVotes;
export const feedbacks = (usePostgres ? pgFeedbacks : sqliteFeedbacks) as typeof sqliteFeedbacks;

export const schemaDialect = usePostgres ? "postgres" : "sqlite";
