import { z } from "zod";
import { routineFormSchema } from "~/pages/routines/new";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";
import { parse, parseISO } from "date-fns";

export const RoutineRouter = createTRPCRouter({
  create: publicProcedure
    .input(
      routineFormSchema
      // z.object({
      //   summary: z.string(),
      //   details: z.string(),
      //   occurrenceType: z.nativeEnum(OccurrenceType),
      //   startDateTime: z.date(),
      //   endDateTime: z.date().nullish(),
      //   // dayOfMonth: z.nativeEnum(DayOfMonthType).optional(),
      //   daysOfWeek: z
      //     .array(
      //       z.object({
      //         label: z.string(),
      //         selected: z.boolean(),
      //       })
      //     )
      //     .nullish(),
      // })
    )
    //TODO: figure this out
    // .mutation(async ({ ctx, input }) => {
    //   const result = await ctx.prisma.routine.create({
    //     data: {
    //       summary: input.summary,
    //       details: input.details,
    //       occurrenceType: input.occurrenceType,
    //       startDateTime: input.startDateTime,
    //       endDateTime: input.endDateTime,
    //       dayOfMonth: input.dayOfMonth,
    //     },
    //   });

    //   if (input.daysOfWeek) {
    //     {
    //       input.daysOfWeek.forEach((dayOfWeek) => {
    //         void ctx.prisma.daySelector.create({
    //           data: {
    //             label: dayOfWeek.label,
    //             abbreviatedLabel: "xxx",
    //             selected: dayOfWeek.selected,
    //             routine: {
    //               connect: {
    //                 id: result.id,
    //               },
    //             },
    //           },
    //         });
    //       });
    //     }
    //   }

    //   return result;
    // }),
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

          // startDateTime: input.startDateTime,
          // endDateTime: input.endDateTime,
          // dayOfMonth: input.dayOfMonth,
          // daysOfWeek: {
          //   ...(input.daysOfWeek
          //     ? {
          //         createMany: {
          //           data: input.daysOfWeek?.map((dayOfWeek) => {
          //             return {
          //               label: dayOfWeek.label,
          //               abbreviatedLabel: "xxx",
          //               selected: dayOfWeek.selected,
          //             };
          //           }),
          //         },
          //       }
          //     : {}),
          // },
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
              weeklyDaysSelected: {
                connect: {
                  id: result.id,
                },
              },
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
  readOne: publicProcedure
    .input(z.object({ id: z.string().cuid() }))
    .query(({ ctx, input }) => {
      return ctx.prisma.routine.findUnique({
        where: { id: input.id },
      });
    }),
  delete: publicProcedure
    .input(z.object({ id: z.string().cuid() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.routine.delete({
        where: {
          id: input.id,
        },
      });
    }),

  // readAll: publicProcedure.query(({ ctx }) => {
  //   return ctx.prisma.routine.findMany();
  // }),
  // readForToday: publicProcedure.query(({ ctx }) => {
  //   const today = startOfDay(new Date());

  //   return ctx.prisma.routine.findMany({
  //     where: {
  //       OR: [
  //         {
  //           startDateTime: {
  //             lte: today,
  //           },
  //           AND: {
  //             endDateTime: {
  //               gte: today,
  //             },
  //           },
  //         },
  //         {
  //           startDateTime: {
  //             lte: today,
  //           },
  //           AND: {
  //             endDateTime: {
  //               equals: today,
  //             },
  //           },
  //         },
  //       ],
  //     },
  //   });
  // }),
});
