import { parse } from "date-fns";
import { z } from "zod";
import { routineFormSchema } from "~/pages/routines/new";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const RoutineRouter = createTRPCRouter({
  create: protectedProcedure
    .input(routineFormSchema)
    .mutation(async ({ ctx, input }) => {
      const result = await ctx.prisma.routine.create({
        data: {
          summary: input.routine.summary,
          details: input.routine.details,
          occurrenceType: input.routine.occurrenceType,
          startDate: new Date(input.routine.startDate),
          fromTime: parse(input.routine.fromTime, "HH:mm", new Date()),
          toTime: parse(input.routine.toTime, "HH:mm", new Date()),
          endDate: input.routine.endDate
            ? new Date(input.routine.endDate)
            : null,
          neverEnds: input.routine.neverEnds,
          dailyEveryValue: input.routine.dailyEveryValue,
          yearlyMonthValue: input.routine.yearlyMonthValue,
          yearlyDayValue: input.routine.yearlyDayValue,
        },
      });

      if (input.routine.occurrenceType === "WEEKLY") {
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        input.weeklyDaySelectorOptions.forEach(async (day) => {
          const dayResult = await ctx.prisma.daySelector.create({
            data: {
              label: day.label,
              abbreviatedLabel: day.abbreviatedLabel,
              selected: day.selected,
              weeklyDaysSelectedId: result.id,
            },
          });
          return dayResult;
        });
      } else if (input.routine.occurrenceType === "MONTHLY") {
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        input.monthlyDaySelectorOptions.forEach(async (day) => {
          const dayResult = await ctx.prisma.daySelector.create({
            data: {
              label: day.label.toString(),
              abbreviatedLabel: day.abbreviatedLabel.toString(),
              selected: day.selected,
              monthlyDaysSelectedId: result.id,
            },
          });
          return dayResult;
        });
      }

      return result;
    }),
  readAll: protectedProcedure.query(async ({ ctx }) => {
    const result = await ctx.prisma.routine.findMany();
    return result;
  }),
  readOne: protectedProcedure
    .input(z.object({ id: z.string().cuid() }))
    .query(async ({ ctx, input }) => {
      const routine = await ctx.prisma.routine.findUnique({
        where: { id: input.id },
      });

      return routine;
    }),
  delete: protectedProcedure
    .input(z.object({ id: z.string().cuid() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.routine.delete({
        where: {
          id: input.id,
        },
      });
    }),
});
