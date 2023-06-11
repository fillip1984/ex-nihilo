import { createTRPCRouter } from "~/server/api/trpc";
import { ActivityRouter } from "./routers/ActivityRouter";
import { RoutineRouter } from "./routers/RoutineRouter";
import { SunInfoRouter } from "./routers/SunInfoRouter";
import { TimelineRouter } from "./routers/TimelineRouter";
import { TopicRouter } from "./routers/TopicRouter";
import { PreferencesRouter } from "./routers/PreferencesRouter";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  activities: ActivityRouter,
  preferences: PreferencesRouter,
  routines: RoutineRouter,
  sunInfo: SunInfoRouter,
  timeline: TimelineRouter,
  topics: TopicRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
