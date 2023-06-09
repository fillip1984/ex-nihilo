import { parse } from "date-fns";
import { z } from "zod";

import { routineFormSchema } from "~/types";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { createActivitiesFromRoutine } from "./ActivityRouter";

export const RoutineRouter = createTRPCRouter({
  create: protectedProcedure
    .input(routineFormSchema)
    .mutation(async ({ ctx, input }) => {
      const result = await ctx.prisma.routine.create({
        data: {
          name: input.routine.name,
          description: input.routine.description,
          occurrenceType: input.routine.occurrenceType,
          startDate: parse(input.routine.startDate, "yyyy-MM-dd", new Date()),
          fromTime: parse(input.routine.fromTime, "HH:mm", new Date()),
          toTime: parse(input.routine.toTime, "HH:mm", new Date()),
          endDate: input.routine.endDate
            ? parse(input.routine.endDate, "yyyy-MM-dd", new Date())
            : null,
          neverEnds: input.routine.neverEnds,
          dailyEveryValue: input.routine.dailyEveryValue,
          yearlyMonthValue: input.routine.yearlyMonthValue,
          yearlyDayValue: input.routine.yearlyDayValue,
          topicId: input.routine.topicId,
        },
      });

      if (input.routine.occurrenceType === "WEEKLY") {
        const weeklyDays = input.weeklyDaySelectorOptions.map((day) => {
          return {
            label: day.label,
            abbreviatedLabel: day.abbreviatedLabel,
            selected: day.selected,
            weeklyDaysSelectedId: result.id,
          };
        });
        await ctx.prisma.daySelector.createMany({
          data: weeklyDays,
        });
      } else if (input.routine.occurrenceType === "MONTHLY") {
        const monthlyDays = input.monthlyDaySelectorOptions.map((day) => {
          return {
            label: day.label.toString(),
            abbreviatedLabel: day.abbreviatedLabel.toString(),
            selected: day.selected,
            monthlyDaysSelectedId: result.id,
          };
        });
        await ctx.prisma.daySelector.createMany({
          data: monthlyDays,
        });
      }

      //refetch since I can't figure out how to retrieve the results from a createMany
      const freshRoutine = await ctx.prisma.routine.findUnique({
        where: {
          id: result.id,
        },
        include: {
          weeklyDaysSelected: true,
          monthlyDaysSelected: true,
        },
      });
      if (freshRoutine) {
        await createActivitiesFromRoutine(freshRoutine);
      }

      return result;
    }),
  readAll: protectedProcedure.query(async ({ ctx }) => {
    const result = await ctx.prisma.routine.findMany({
      include: {
        _count: {
          select: { activities: true },
        },
      },
    });
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
