import {
  type BloodPressureReadingFormSchemaType,
  bloodPressureReadingFormSchema,
} from "~/types";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { z } from "zod";
import { endOfWeek, startOfWeek } from "date-fns";

export const BloodPressureReadingRouter = createTRPCRouter({
  create: protectedProcedure
    .input(bloodPressureReadingFormSchema)
    .mutation(async ({ ctx, input }) => {
      const category = determineCategory(input);

      const result = await ctx.prisma.bloodPressureReading.create({
        data: {
          userId: ctx.session.user.id,
          activityId: input.activityId,
          date: input.date,
          systolic: input.systolic,
          diastolic: input.diastolic,
          pulse: input.pulse ? parseInt(input.pulse) : null,
          category,
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

        const result = await ctx.prisma.bloodPressureReading.findMany({
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
        const result = await ctx.prisma.bloodPressureReading.findMany({
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

      const result = await ctx.prisma.bloodPressureReading.findMany({
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

const determineCategory = (bpr: BloodPressureReadingFormSchemaType) => {
  if (bpr.systolic > 180 || bpr.diastolic > 120) {
    return "HYPERTENSION_CRISIS";
  } else if (bpr.systolic >= 140 || bpr.diastolic >= 90) {
    return "HYPERTENSION_STAGE_2";
  } else if (bpr.systolic >= 130) {
    return "HYPERTENSION_STAGE_1";
  } else if (bpr.diastolic >= 80) {
    return "HYPERTENSION_STAGE_1";
  } else if (bpr.systolic >= 120) {
    return "ELEVATED";
  } else if (bpr.systolic >= 90) {
    return "NORMAL";
  } else {
    return "LOW";
  }
};
