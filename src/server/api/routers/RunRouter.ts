import { runningLog } from "~/types";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const RunRouter = createTRPCRouter({
  create: protectedProcedure
    .input(runningLog)
    .mutation(async ({ ctx, input }) => {
      const result = await ctx.prisma.run.create({
        data: {
          userId: ctx.session.user.id,
          activityId: input.activityId,
          date: input.date,
          distance: input.distance,
          duration: input.duration,
          pace: input.pace,
          heartRateAverage: input.heartRateAverage
            ? parseInt(input.heartRateAverage)
            : null,
          weather: input.weather,
          mood: input.mood,
        },
      });
      return result;
    }),
  readAll: protectedProcedure.query(async ({ ctx }) => {
    const result = await ctx.prisma.run.findMany({
      where: {
        userId: ctx.session.user.id,
      },
      orderBy: {
        date: "asc",
      },
    });
    return result;
  }),
});
