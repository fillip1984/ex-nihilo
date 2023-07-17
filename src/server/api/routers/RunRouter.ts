import { runningLog } from "~/types";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { z } from "zod";
import { endOfWeek, startOfWeek } from "date-fns";

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
  readAll: protectedProcedure
    .input(z.object({ filter: z.string() }))
    .query(async ({ ctx, input }) => {
      if (input.filter === "This week") {
        console.warn("Probably going to have timezone issues with this");
        const now = new Date();
        const start = startOfWeek(now);
        const end = endOfWeek(now);

        const result = await ctx.prisma.run.findMany({
          where: {
            userId: ctx.session.user.id,
            date: {
              gte: start,
              lte: end,
            },
          },
          orderBy: {
            date: "asc",
          },
        });
        return result;
      }

      if (input.filter === "Last 10") {
        const result = await ctx.prisma.run.findMany({
          where: {
            userId: ctx.session.user.id,
          },
          take: 10,
          orderBy: {
            date: "asc",
          },
        });
        return result;
      }

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
