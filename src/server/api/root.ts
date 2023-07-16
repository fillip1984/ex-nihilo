import { createTRPCRouter } from "~/server/api/trpc";
import { ActivityRouter } from "./routers/ActivityRouter";
import { BloodPressureReadingRouter } from "./routers/BloodPressureReadingRouter";
import { NoteRouter } from "./routers/NoteRouter";
import { PreferencesRouter } from "./routers/PreferencesRouter";
import { RoutineRouter } from "./routers/RoutineRouter";
import { RunRouter } from "./routers/RunRouter";
import { SunInfoRouter } from "./routers/SunInfoRouter";
import { TimelineRouter } from "./routers/TimelineRouter";
import { TopicRouter } from "./routers/TopicRouter";
import { WeighInRouter } from "./routers/WeighInRouter";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  activities: ActivityRouter,
  bloodPressureReadings: BloodPressureReadingRouter,
  notes: NoteRouter,
  preferences: PreferencesRouter,
  routines: RoutineRouter,
  runs: RunRouter,
  sunInfo: SunInfoRouter,
  timeline: TimelineRouter,
  topics: TopicRouter,
  weighIns: WeighInRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
