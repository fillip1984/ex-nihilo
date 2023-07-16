import {
  type BloodPressureReadingFormSchemaType,
  bloodPressureReadingFormSchema,
} from "~/types";
import { createTRPCRouter, protectedProcedure } from "../trpc";

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
