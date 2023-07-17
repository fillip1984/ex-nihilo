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
  readAll: protectedProcedure.query(async ({ ctx }) => {
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
