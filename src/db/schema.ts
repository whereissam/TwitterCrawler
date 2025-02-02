import { pgTable, uuid, serial, varchar, timestamp, integer, decimal, jsonb } from 'drizzle-orm/pg-core';

// User type enum for type safety
export const userTypes = ['product', 'influencer'] as const;
export type UserType = typeof userTypes[number];

// Base users table
export const users = pgTable('users', {
  id: varchar('id').primaryKey(),
  username: varchar('username').notNull().unique(),
  type: varchar('type', { enum: userTypes }).notNull(),
  followersScore: decimal('followers_score').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

export const products = pgTable('products', {
  id: uuid('id').defaultRandom().primaryKey(), // Let Drizzle handle UUID generation
  savedAt: timestamp('saved_at').defaultNow().notNull(),
  username: varchar('username').notNull(),
  user_id: varchar('user_id').notNull(), // Twitter author_id
  followersScore: decimal('followers_score').notNull(),
  followersCount: integer('followers_count').notNull(),
  mentionsCount: integer('mentions_count').notNull()
});

export const influencers = pgTable('influencers', {
  id: uuid('id').defaultRandom().primaryKey(), // Let Drizzle handle UUID generation
  savedAt: timestamp('saved_at').defaultNow().notNull(),
  username: varchar('username').notNull(),
  user_id: varchar('user_id').notNull(), // Twitter author_id
  followersScore: decimal('followers_score').notNull()
});

export const tweetSnapshots = pgTable('tweet_snapshots', {
  id: uuid('id').defaultRandom().primaryKey(),
  post_id: varchar('post_id').notNull(),
  author_id: varchar('author_id').notNull(),
  mentioned_username: varchar('mentioned_username').notNull(),
  created_at: timestamp('created_at').notNull(),
  saved_at: timestamp('saved_at').defaultNow().notNull(),
  public_metrics: jsonb('public_metrics').notNull()
});

// Type definitions to match schema
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;
export type Influencer = typeof influencers.$inferSelect;
export type NewInfluencer = typeof influencers.$inferInsert;
export type TweetSnapshot = typeof tweetSnapshots.$inferInsert;