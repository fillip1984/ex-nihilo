import { createTRPCRouter } from "~/server/api/trpc";
import { SunInfoRouter } from "./routers/SunInfoRouter";
import { TimelineRouter } from "./routers/TimelineRouter";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  sunInfoRouter: SunInfoRouter,
  timelineRouter: TimelineRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
