import { 
  serial, 
  text, 
  pgTable, 
  timestamp, 
  integer, 
  boolean,
  jsonb,
  pgEnum
} from 'drizzle-orm/pg-core';

// Enums
export const themeEnum = pgEnum('theme', ['classic', 'dark', 'retro']);
export const animationSpeedEnum = pgEnum('animation_speed', ['slow', 'normal', 'fast']);

// Likes table for the "About Me" section like functionality
export const likesTable = pgTable('likes', {
  id: serial('id').primaryKey(),
  count: integer('count').notNull().default(0),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

// Feedback messages table for the "About Me" section
export const feedbackMessagesTable = pgTable('feedback_messages', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email'), // Nullable by default
  message: text('message').notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
});

// Projects table for the "Projects" section
export const projectsTable = pgTable('projects', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  tags: jsonb('tags').notNull().default([]), // Array of technology tags stored as JSON
  demo_link: text('demo_link'), // Nullable by default
  image_url: text('image_url'), // Nullable by default
  display_order: integer('display_order').notNull().default(0),
  is_active: boolean('is_active').notNull().default(true),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

// Contact messages table for the "Contact" section
export const contactMessagesTable = pgTable('contact_messages', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email'), // Nullable by default
  subject: text('subject').notNull(),
  message: text('message').notNull(),
  is_read: boolean('is_read').notNull().default(false),
  created_at: timestamp('created_at').defaultNow().notNull(),
});

// Portfolio settings table for the "Settings" section
export const portfolioSettingsTable = pgTable('portfolio_settings', {
  id: serial('id').primaryKey(),
  sound_enabled: boolean('sound_enabled').notNull().default(true),
  theme: themeEnum('theme').notNull().default('classic'),
  animation_speed: animationSpeedEnum('animation_speed').notNull().default('normal'),
  show_visitor_count: boolean('show_visitor_count').notNull().default(true),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

// Portfolio stats table for the "About Me" section
export const portfolioStatsTable = pgTable('portfolio_stats', {
  id: serial('id').primaryKey(),
  total_projects: integer('total_projects').notNull().default(0),
  years_experience: integer('years_experience').notNull().default(0),
  total_likes: integer('total_likes').notNull().default(0),
  visitor_count: integer('visitor_count').notNull().default(0),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

// TypeScript types for the table schemas
export type Like = typeof likesTable.$inferSelect;
export type NewLike = typeof likesTable.$inferInsert;

export type FeedbackMessage = typeof feedbackMessagesTable.$inferSelect;
export type NewFeedbackMessage = typeof feedbackMessagesTable.$inferInsert;

export type Project = typeof projectsTable.$inferSelect;
export type NewProject = typeof projectsTable.$inferInsert;

export type ContactMessage = typeof contactMessagesTable.$inferSelect;
export type NewContactMessage = typeof contactMessagesTable.$inferInsert;

export type PortfolioSettings = typeof portfolioSettingsTable.$inferSelect;
export type NewPortfolioSettings = typeof portfolioSettingsTable.$inferInsert;

export type PortfolioStats = typeof portfolioStatsTable.$inferSelect;
export type NewPortfolioStats = typeof portfolioStatsTable.$inferInsert;

// Export all tables for relation queries
export const tables = {
  likes: likesTable,
  feedbackMessages: feedbackMessagesTable,
  projects: projectsTable,
  contactMessages: contactMessagesTable,
  portfolioSettings: portfolioSettingsTable,
  portfolioStats: portfolioStatsTable
};