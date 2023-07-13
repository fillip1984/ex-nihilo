import { type DaySelector, type Routine } from "@prisma/client";
import {
  addDays,
  addHours,
  endOfYear,
  isAfter,
  isSunday,
  isWithinInterval,
  nextSunday,
  previousSunday,
} from "date-fns";
import { z } from "zod";
import { prisma } from "~/server/db";
import {
  combineDateAndTime,
  isDaylightSavingsTime,
  nextNewYears,
} from "~/utils/date";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const createActivitiesFromRoutine = async (
  routine: Routine & {
    weeklyDaysSelected: DaySelector[];
  },
  userId: string
) => {
  // console.log("creating activities from routine", routine.name);

  switch (routine.occurrenceType) {
    case "NEVER":
      return await createOneTimeActivity(routine, userId);
    case "DAILY":
      return await createDailyActivities(routine, userId);
    case "WEEKLY":
      return await createWeeklyActivities(routine, userId);
  }
};

const createOneTimeActivity = async (routine: Routine, userId: string) => {
  // console.log(
  //   `creating one time activity for routine: ${
  //     routine.name
  //   } on: ${routine.startDate.toLocaleString()}`
  // );

  if (!routine.endDate) {
    throw new Error(
      "Unable to create one time activity from routine, missing end date. Routine: " +
        routine.name
    );
  }

  if (!routine.toTime) {
    throw new Error(
      "Unable to create one time activity from routine, missing to time. Routine: " +
        routine.name
    );
  }

  const userPreferences = await prisma.preferences.findUnique({
    where: { userId },
  });
  if (!userPreferences) {
    throw new Error("Unable to determine user timezone, userId: " + userId);
  }
  const timezone = userPreferences.timezone;

  const start = combineDateAndTime(routine.startDate, routine.fromTime);
  const end = combineDateAndTime(routine.endDate, routine.toTime);

  let activityStart = start;
  let activityEnd = end;

  const isCreatedDuringDaylistSavings = isDaylightSavingsTime(
    combineDateAndTime(start, routine.fromTime),
    timezone
  );

  if (
    !isCreatedDuringDaylistSavings &&
    isDaylightSavingsTime(activityStart, timezone)
  ) {
    activityStart = addHours(activityStart, -1);
    activityEnd = addHours(activityEnd, -1);
  } else if (
    isCreatedDuringDaylistSavings &&
    !isDaylightSavingsTime(activityStart, timezone)
  ) {
    activityStart = addHours(activityStart, 1);
    activityEnd = addHours(activityEnd, 1);
  }

  return await prisma.activity.create({
    data: {
      routineId: routine.id,
      start: activityStart,
      end: activityEnd,
      userId,
    },
  });
};

const createDailyActivities = async (routine: Routine, userId: string) => {
  console.log("creating daily activities for routine", routine.name);
  const activitiesToAdd = [];
  if (!routine.dailyEveryValue) {
    throw new Error(
      "Routine.dailyEveryValue (a.k.a. Every x days value) is not set"
    );
  }

  let start = routine.startDate;
  // if "Never end" is selected we build out activities for the given year.
  // An activity will ask on New Years if we should build out the new year or
  // if user wants to make adjustments
  const end = routine.neverEnds ? endOfYear(start) : routine.endDate;

  if (!end) {
    throw new Error(
      "Unable to determine end date for routine: " + routine.name
    );
  }

  const userPreferences = await prisma.preferences.findUnique({
    where: { userId },
  });
  if (!userPreferences) {
    throw new Error("Unable to determine user timezone, userId: " + userId);
  }
  const timezone = userPreferences.timezone;

  const isCreatedDuringDaylistSavings = isDaylightSavingsTime(
    combineDateAndTime(start, routine.fromTime),
    timezone
  );

  while (start <= end) {
    let activityStart = combineDateAndTime(start, routine.fromTime);
    let activityEnd = combineDateAndTime(start, routine.toTime);

    if (
      !isCreatedDuringDaylistSavings &&
      isDaylightSavingsTime(activityStart, timezone)
    ) {
      activityStart = addHours(activityStart, -1);
      activityEnd = addHours(activityEnd, -1);
    } else if (
      isCreatedDuringDaylistSavings &&
      !isDaylightSavingsTime(activityStart, timezone)
    ) {
      activityStart = addHours(activityStart, 1);
      activityEnd = addHours(activityEnd, 1);
    }

    const activity = {
      routineId: routine.id,
      start: activityStart,
      end: activityEnd,
      userId,
    };
    activitiesToAdd.push(activity);

    start = addDays(start, routine.dailyEveryValue);
  }

  const result = await prisma.activity.createMany({
    data: activitiesToAdd,
  });
  return result;
};

const createWeeklyActivities = async (
  routine: Routine & {
    weeklyDaysSelected: DaySelector[];
  },
  userId: string
) => {
  let datesToAdd: Date[] = [];
  let start = routine.startDate;
  const end = routine.endDate ?? nextNewYears(new Date());
  const startEndInterval = { start, end };

  // set start to current week's sunday, will remove if out of range later
  if (!isSunday(start)) {
    start = previousSunday(start);
  }
  const selectedDays = routine.weeklyDaysSelected.filter((day) => day.selected);
  while (!isAfter(start, end)) {
    selectedDays.forEach((day) => {
      if (day.label === "Sunday") {
        datesToAdd.push(start);
      } else if (day.label === "Monday") {
        datesToAdd.push(addDays(start, 1));
      } else if (day.label === "Tuesday") {
        datesToAdd.push(addDays(start, 2));
      } else if (day.label === "Wednesday") {
        datesToAdd.push(addDays(start, 3));
      } else if (day.label === "Thursday") {
        datesToAdd.push(addDays(start, 4));
      } else if (day.label === "Friday") {
        datesToAdd.push(addDays(start, 5));
      } else if (day.label === "Saturday") {
        datesToAdd.push(addDays(start, 6));
      }
    });

    start = nextSunday(start);
  }

  // chop off out of range ranges
  datesToAdd = datesToAdd.filter((date) =>
    isWithinInterval(date, startEndInterval)
  );

  const activitiesToAdd = new Array(datesToAdd.length);
  datesToAdd.forEach((date) => {
    activitiesToAdd.push({
      routineId: routine.id,
      start: combineDateAndTime(date, routine.fromTime),
      end: combineDateAndTime(date, routine.toTime),
      userId,
    });
  });

  const result = await prisma.activity.createMany({
    data: activitiesToAdd,
  });
  return result;
};

const deleteActivitiesForRoutine = async (routine: Routine) => {
  const result = await prisma.activity.deleteMany({
    where: {
      routineId: routine.id,
    },
  });
  return result;
};

export const ActivityRouter = createTRPCRouter({
  rebuild: protectedProcedure.mutation(async ({ ctx }) => {
    const userId = ctx.session.user.id;
    const routines = await ctx.prisma.routine.findMany({
      where: {
        userId,
      },
      include: {
        weeklyDaysSelected: true,
      },
    });

    //clean out previous, build new
    for (const routine of routines) {
      await deleteActivitiesForRoutine(routine);
      await createActivitiesFromRoutine(routine, ctx.session.user.id);
    }
  }),
  // readAll: protectedProcedure
  //   .input(z.object({ date: z.date(), filter: z.string().nullish() }))
  //   .query(async ({ ctx, input }) => {
  //     const start = startOfDay(input.date);
  //     const end = endOfDay(input.date);

  //     const userId = ctx.session.user.id;

  //     const result = ctx.prisma.activity.findMany({
  //       where: {
  //         userId,
  //         start: {
  //           gte: start,
  //           lte: end,
  //         },
  //         ...(input.filter === "Available"
  //           ? { skip: false, complete: false }
  //           : {}),
  //         ...(input.filter === "Complete" ? { complete: true } : {}),
  //         ...(input.filter === "Skipped" ? { skip: true } : {}),
  //         // wide open so not necessary ...(input.filter === "All" ? {} : {}),
  //       },
  //       include: {
  //         routine: {
  //           include: {
  //             topic: true,
  //           },
  //         },
  //       },
  //     });

  //     return result;
  //   }),
  complete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const result = await ctx.prisma.activity.update({
        data: {
          complete: true,
          completedAt: new Date(),
        },
        where: {
          id: input.id,
        },
      });
      return result;
    }),
  skip: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const result = await ctx.prisma.activity.update({
        data: {
          skip: true,
        },
        where: {
          id: input.id,
        },
      });
      return result;
    }),
});
