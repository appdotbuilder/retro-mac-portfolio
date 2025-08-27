import { z } from 'zod';

// Like schema for the "About Me" section like button
export const likeSchema = z.object({
  id: z.number(),
  count: z.number().int().nonnegative(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type Like = z.infer<typeof likeSchema>;

// Input schema for incrementing likes
export const incrementLikeInputSchema = z.object({
  increment: z.number().int().positive().default(1)
});

export type IncrementLikeInput = z.infer<typeof incrementLikeInputSchema>;

// Feedback message schema for the "About Me" section
export const feedbackMessageSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string().email().nullable(),
  message: z.string(),
  created_at: z.coerce.date()
});

export type FeedbackMessage = z.infer<typeof feedbackMessageSchema>;

// Input schema for creating feedback messages
export const createFeedbackMessageInputSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email().nullable(),
  message: z.string().min(1, 'Message is required')
});

export type CreateFeedbackMessageInput = z.infer<typeof createFeedbackMessageInputSchema>;

// Project schema for the "Projects" section
export const projectSchema = z.object({
  id: z.number(),
  title: z.string(),
  description: z.string(),
  tags: z.array(z.string()), // Technologies used
  demo_link: z.string().url().nullable(),
  image_url: z.string().url().nullable(),
  display_order: z.number().int().nonnegative(),
  is_active: z.boolean(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type Project = z.infer<typeof projectSchema>;

// Input schema for creating projects
export const createProjectInputSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  tags: z.array(z.string()).default([]),
  demo_link: z.string().url().nullable(),
  image_url: z.string().url().nullable(),
  display_order: z.number().int().nonnegative().default(0),
  is_active: z.boolean().default(true)
});

export type CreateProjectInput = z.infer<typeof createProjectInputSchema>;

// Input schema for updating projects
export const updateProjectInputSchema = z.object({
  id: z.number(),
  title: z.string().min(1, 'Title is required').optional(),
  description: z.string().min(1, 'Description is required').optional(),
  tags: z.array(z.string()).optional(),
  demo_link: z.string().url().nullable().optional(),
  image_url: z.string().url().nullable().optional(),
  display_order: z.number().int().nonnegative().optional(),
  is_active: z.boolean().optional()
});

export type UpdateProjectInput = z.infer<typeof updateProjectInputSchema>;

// Contact message schema for the "Contact" section
export const contactMessageSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string().email().nullable(),
  subject: z.string(),
  message: z.string(),
  is_read: z.boolean(),
  created_at: z.coerce.date()
});

export type ContactMessage = z.infer<typeof contactMessageSchema>;

// Input schema for creating contact messages
export const createContactMessageInputSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email().nullable(),
  subject: z.string().min(1, 'Subject is required'),
  message: z.string().min(1, 'Message is required')
});

export type CreateContactMessageInput = z.infer<typeof createContactMessageInputSchema>;

// Portfolio settings schema for the "Settings" section
export const portfolioSettingsSchema = z.object({
  id: z.number(),
  sound_enabled: z.boolean(),
  theme: z.enum(['classic', 'dark', 'retro']),
  animation_speed: z.enum(['slow', 'normal', 'fast']),
  show_visitor_count: z.boolean(),
  updated_at: z.coerce.date()
});

export type PortfolioSettings = z.infer<typeof portfolioSettingsSchema>;

// Input schema for updating portfolio settings
export const updatePortfolioSettingsInputSchema = z.object({
  sound_enabled: z.boolean().optional(),
  theme: z.enum(['classic', 'dark', 'retro']).optional(),
  animation_speed: z.enum(['slow', 'normal', 'fast']).optional(),
  show_visitor_count: z.boolean().optional()
});

export type UpdatePortfolioSettingsInput = z.infer<typeof updatePortfolioSettingsInputSchema>;

// Portfolio stats schema for the "About Me" section
export const portfolioStatsSchema = z.object({
  id: z.number(),
  total_projects: z.number().int().nonnegative(),
  years_experience: z.number().int().nonnegative(),
  total_likes: z.number().int().nonnegative(),
  visitor_count: z.number().int().nonnegative(),
  updated_at: z.coerce.date()
});

export type PortfolioStats = z.infer<typeof portfolioStatsSchema>;