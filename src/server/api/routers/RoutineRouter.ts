import { DayOfMonthType, OccurrenceType } from "@prisma/client";
import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";

export const RoutineRouter = createTRPCRouter({
  create: publicProcedure
    .input(
      z.object({
        summary: z.string(),
        details: z.string(),
        occurrenceType: z.nativeEnum(OccurrenceType),
        startDateTime: z.date(),
        endDateTime: z.date().nullish(),
        dayOfMonth: z.nativeEnum(DayOfMonthType).optional(),
        daysOfWeek: z
          .array(
            z.object({
              label: z.string(),
              selected: z.boolean(),
            })
          )
          .nullish(),
      })
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
          summary: input.summary,
          details: input.details,
          occurrenceType: input.occurrenceType,
          startDateTime: input.startDateTime,
          endDateTime: input.endDateTime,
          dayOfMonth: input.dayOfMonth,
          daysOfWeek: {
            ...(input.daysOfWeek
              ? {
                  createMany: {
                    data: input.daysOfWeek?.map((dayOfWeek) => {
                      return {
                        label: dayOfWeek.label,
                        abbreviatedLabel: "xxx",
                        selected: dayOfWeek.selected,
                      };
                    }),
                  },
                }
              : {}),
          },
        },
      });
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
