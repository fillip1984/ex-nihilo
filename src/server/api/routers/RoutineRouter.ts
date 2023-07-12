import { parse } from "date-fns";
import { z } from "zod";

import { routineFormSchema } from "~/types";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { createActivitiesFromRoutine } from "./ActivityRouter";
import { HH_mm_aka24hr, yyyyMMddHyphenated } from "~/utils/date";

export const RoutineRouter = createTRPCRouter({
  create: protectedProcedure
    .input(routineFormSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      const result = await ctx.prisma.routine.create({
        data: {
          name: input.routine.name,
          description: input.routine.description,
          occurrenceType: input.routine.occurrenceType,
          startDate: parse(
            input.routine.startDate,
            yyyyMMddHyphenated,
            new Date()
          ),
          fromTime: parse(input.routine.fromTime, HH_mm_aka24hr, new Date()),
          toTime: parse(input.routine.toTime, HH_mm_aka24hr, new Date()),
          endDate: input.routine.endDate
            ? parse(input.routine.endDate, yyyyMMddHyphenated, new Date())
            : null,
          neverEnds: input.routine.neverEnds,
          dailyEveryValue: input.routine.dailyEveryValue,
          yearlyMonthValue: input.routine.yearlyMonthValue,
          yearlyDayValue: input.routine.yearlyDayValue,
          topicId: input.routine.topicId,
          userId,
        },
      });

      if (input.routine.occurrenceType === "WEEKLY") {
        const weeklyDays = input.weeklyDaySelectorOptions.map((day) => {
          return {
            label: day.label,
            abbreviatedLabel: day.abbreviatedLabel,
            selected: day.selected,
            weeklyDaysSelectedId: result.id,
            userId,
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
            userId,
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
        await createActivitiesFromRoutine(freshRoutine, userId);
      }

      return freshRoutine;
    }),
  readAll: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;
    const result = await ctx.prisma.routine.findMany({
      where: {
        userId,
      },
      include: {
        weeklyDaysSelected: true,
        monthlyDaysSelected: true,
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
        where: {
          id: input.id,
        },
        include: {
          weeklyDaysSelected: true,
          monthlyDaysSelected: true,
        },
      });

      return routine;
    }),
  update: protectedProcedure
    .input(routineFormSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      if (!input.routine.id) {
        throw new Error(
          "Unable to update routine without id. Routine name: " +
            input.routine.name
        );
      }

      const result = await ctx.prisma.routine.update({
        where: {
          id: input.routine.id,
        },
        data: {
          name: input.routine.name,
          description: input.routine.description,
          occurrenceType: input.routine.occurrenceType,
          startDate: parse(
            input.routine.startDate,
            yyyyMMddHyphenated,
            new Date()
          ),
          fromTime: parse(input.routine.fromTime, HH_mm_aka24hr, new Date()),
          toTime: parse(input.routine.toTime, HH_mm_aka24hr, new Date()),
          endDate: input.routine.endDate
            ? parse(input.routine.endDate, yyyyMMddHyphenated, new Date())
            : null,
          neverEnds: input.routine.neverEnds,
          dailyEveryValue: input.routine.dailyEveryValue,
          yearlyMonthValue: input.routine.yearlyMonthValue,
          yearlyDayValue: input.routine.yearlyDayValue,
          topicId: input.routine.topicId,
        },
      });

      await ctx.prisma.daySelector.deleteMany({
        where: {
          weeklyDaysSelectedId: input.routine.id,
        },
      });
      await ctx.prisma.daySelector.deleteMany({
        where: {
          monthlyDaysSelectedId: input.routine.id,
        },
      });

      if (input.routine.occurrenceType === "WEEKLY") {
        const weeklyDays = input.weeklyDaySelectorOptions.map((day) => {
          return {
            label: day.label,
            abbreviatedLabel: day.abbreviatedLabel,
            selected: day.selected,
            weeklyDaysSelectedId: result.id,
            userId,
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
            userId,
          };
        });
        await ctx.prisma.daySelector.createMany({
          data: monthlyDays,
        });
      }

      await ctx.prisma.activity.deleteMany({
        where: { routineId: input.routine.id },
      });

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
        await createActivitiesFromRoutine(freshRoutine, userId);
      }

      return freshRoutine;
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
