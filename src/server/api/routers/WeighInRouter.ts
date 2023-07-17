import { endOfWeek, startOfWeek } from "date-fns";
import { z } from "zod";
import { weighInFormSchema } from "~/types";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const WeighInRouter = createTRPCRouter({
  create: protectedProcedure
    .input(weighInFormSchema)
    .mutation(async ({ ctx, input }) => {
      const result = await ctx.prisma.weighIn.create({
        data: {
          userId: ctx.session.user.id,
          activityId: input.activityId,
          date: input.date,
          weight: input.weight,
          bodyFatPercentage: input.bodyFatPercentage
            ? parseFloat(input.bodyFatPercentage)
            : null,
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

        const result = await ctx.prisma.weighIn.findMany({
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
        const result = await ctx.prisma.weighIn.findMany({
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

      const result = await ctx.prisma.weighIn.findMany({
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
