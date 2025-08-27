import { initTRPC } from '@trpc/server';
import { createHTTPServer } from '@trpc/server/adapters/standalone';
import 'dotenv/config';
import cors from 'cors';
import superjson from 'superjson';

// Import schemas
import { 
  incrementLikeInputSchema,
  createFeedbackMessageInputSchema,
  createProjectInputSchema,
  updateProjectInputSchema,
  createContactMessageInputSchema,
  updatePortfolioSettingsInputSchema
} from './schema';

// Import handlers
import { getLikes } from './handlers/get_likes';
import { incrementLikes } from './handlers/increment_likes';
import { createFeedbackMessage } from './handlers/create_feedback_message';
import { getFeedbackMessages } from './handlers/get_feedback_messages';
import { getProjects } from './handlers/get_projects';
import { createProject } from './handlers/create_project';
import { updateProject } from './handlers/update_project';
import { createContactMessage } from './handlers/create_contact_message';
import { getContactMessages } from './handlers/get_contact_messages';
import { getPortfolioSettings } from './handlers/get_portfolio_settings';
import { updatePortfolioSettings } from './handlers/update_portfolio_settings';
import { getPortfolioStats } from './handlers/get_portfolio_stats';
import { incrementVisitorCount } from './handlers/increment_visitor_count';

const t = initTRPC.create({
  transformer: superjson,
});

const publicProcedure = t.procedure;
const router = t.router;

const appRouter = router({
  // Health check
  healthcheck: publicProcedure.query(() => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }),

  // Like functionality for About Me section
  getLikes: publicProcedure
    .query(() => getLikes()),
  
  incrementLikes: publicProcedure
    .input(incrementLikeInputSchema)
    .mutation(({ input }) => incrementLikes(input)),

  // Feedback messages for About Me section
  createFeedbackMessage: publicProcedure
    .input(createFeedbackMessageInputSchema)
    .mutation(({ input }) => createFeedbackMessage(input)),
  
  getFeedbackMessages: publicProcedure
    .query(() => getFeedbackMessages()),

  // Projects section
  getProjects: publicProcedure
    .query(() => getProjects()),
  
  createProject: publicProcedure
    .input(createProjectInputSchema)
    .mutation(({ input }) => createProject(input)),
  
  updateProject: publicProcedure
    .input(updateProjectInputSchema)
    .mutation(({ input }) => updateProject(input)),

  // Contact messages
  createContactMessage: publicProcedure
    .input(createContactMessageInputSchema)
    .mutation(({ input }) => createContactMessage(input)),
  
  getContactMessages: publicProcedure
    .query(() => getContactMessages()),

  // Portfolio settings
  getPortfolioSettings: publicProcedure
    .query(() => getPortfolioSettings()),
  
  updatePortfolioSettings: publicProcedure
    .input(updatePortfolioSettingsInputSchema)
    .mutation(({ input }) => updatePortfolioSettings(input)),

  // Portfolio stats for About Me section
  getPortfolioStats: publicProcedure
    .query(() => getPortfolioStats()),
  
  incrementVisitorCount: publicProcedure
    .mutation(() => incrementVisitorCount()),
});

export type AppRouter = typeof appRouter;

async function start() {
  const port = process.env['SERVER_PORT'] || 2022;
  const server = createHTTPServer({
    middleware: (req, res, next) => {
      cors()(req, res, next);
    },
    router: appRouter,
    createContext() {
      return {};
    },
  });
  server.listen(port);
  console.log(`TRPC server listening at port: ${port}`);
}

start();