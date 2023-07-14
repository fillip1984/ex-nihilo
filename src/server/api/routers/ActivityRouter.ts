import { type DaySelector, type Routine } from "@prisma/client";
import {
  addDays,
  addHours,
  eachDayOfInterval,
  eachMonthOfInterval,
  endOfMonth,
  endOfYear,
  isAfter,
  isBefore,
  isSunday,
  isWithinInterval,
  nextSunday,
  previousSunday,
  setDate,
  startOfMonth,
} from "date-fns";
import { z } from "zod";
import { prisma } from "~/server/db";
import { type RoutineAndAll } from "~/types";
import { combineDateAndTime, isDaylightSavingsTime } from "~/utils/date";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { getUserTimezone } from "./PreferencesRouter";

export const createActivitiesFromRoutine = async (
  routine: RoutineAndAll,
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
    case "MONTHLY":
      return await createMonthlyActivities(routine, userId);
    case "YEARLY":
      return await createYearlyActivities(routine, userId);
  }
};

const createOneTimeActivity = async (
  routine: RoutineAndAll,
  userId: string
) => {
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

  const userTimezone = await getUserTimezone(userId);

  const start = combineDateAndTime(routine.startDate, routine.fromTime);
  const end = combineDateAndTime(routine.endDate, routine.toTime);

  const activityStart = adjustForDaylightSavings(start, userTimezone, start);
  const activityEnd = adjustForDaylightSavings(start, userTimezone, end);

  return await prisma.activity.create({
    data: {
      routineId: routine.id,
      start: activityStart,
      end: activityEnd,
      userId,
    },
  });
};

const createDailyActivities = async (
  routine: RoutineAndAll,
  userId: string
) => {
  console.log("creating daily activities for routine", routine.name);

  if (!routine.dailyEveryValue) {
    throw new Error(
      "Routine.dailyEveryValue (a.k.a. Every x days value) is not set"
    );
  }

  const start = combineDateAndTime(routine.startDate, routine.fromTime);

  // if "Never end" is selected we build out activities for the given year.
  // An activity will ask on New Years if we should build out the new year or
  // if user wants to make adjustments
  const end = routine.neverEnds
    ? endOfYear(start)
    : combineDateAndTime(routine.endDate as Date, routine.toTime);

  const days = eachDayOfInterval({ start, end });
  console.log({ start, end });

  const userTimezone = await getUserTimezone(userId);

  const activities = days.map((day) => {
    console.log(day);
    const activityStart = adjustForDaylightSavings(
      start,
      userTimezone,
      combineDateAndTime(day, routine.fromTime)
    );
    const activityEnd = adjustForDaylightSavings(
      start,
      userTimezone,
      combineDateAndTime(day, routine.toTime)
    );

    const activity = {
      routineId: routine.id,
      start: activityStart,
      end: activityEnd,
      userId,
    };
    return activity;
  });

  const result = await prisma.activity.createMany({
    data: activities,
  });
  return result;
};

const createWeeklyActivities = async (
  routine: RoutineAndAll,
  userId: string
) => {
  let datesToAdd: Date[] = [];

  const userTimezone = await getUserTimezone(userId);

  let start = combineDateAndTime(routine.startDate, routine.fromTime);
  const initialDate = start;
  // if "Never end" is selected we build out activities for the given year.
  // An activity will ask on New Years if we should build out the new year or
  // if user wants to make adjustments
  const end = routine.neverEnds
    ? endOfYear(start)
    : combineDateAndTime(routine.endDate as Date, routine.toTime);
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
      start: adjustForDaylightSavings(initialDate, userTimezone, date),
      end: adjustForDaylightSavings(
        initialDate,
        userTimezone,
        combineDateAndTime(date, routine.toTime)
      ),
      userId,
    });
  });

  const result = await prisma.activity.createMany({
    data: activitiesToAdd,
  });
  return result;
};

const createMonthlyActivities = async (
  routine: RoutineAndAll,
  userId: string
) => {
  const datesToAdd: Date[] = [];

  const userTimezone = await getUserTimezone(userId);

  //figure out how many months we're building for
  const start = combineDateAndTime(routine.startDate, routine.fromTime);
  const end = routine.neverEnds
    ? endOfYear(start)
    : combineDateAndTime(routine.endDate as Date, routine.toTime);

  const months = eachMonthOfInterval({ start, end });
  months.forEach((month) => {
    const monthStart = startOfMonth(month);
    const monthEnd = endOfMonth(month);
    const monthInterval = { start: monthStart, end: monthEnd };
    routine.monthlyDaysSelected
      .filter((day) => day.selected)
      .map((day) => parseInt(day.label))
      .map((day) => {
        // if month doesn't include selected day, put at end of month
        let date = setDate(month, day);
        if (!isWithinInterval(date, monthInterval)) {
          date = endOfMonth(month);
        }
        return date;
      })
      .filter((day) => isAfter(day, start) && isBefore(day, end))
      .forEach((day) => datesToAdd.push(day));
  });

  const activitiesToAdd = new Array(datesToAdd.length);
  datesToAdd.forEach((date) => {
    activitiesToAdd.push({
      routineId: routine.id,
      start: adjustForDaylightSavings(
        start,
        userTimezone,
        combineDateAndTime(date, routine.fromTime)
      ),
      end: adjustForDaylightSavings(
        start,
        userTimezone,
        combineDateAndTime(date, routine.toTime)
      ),
      userId,
    });
  });

  const result = await prisma.activity.createMany({
    data: activitiesToAdd,
  });
  return result;
};

const createYearlyActivities = async (
  routine: Routine & {
    weeklyDaysSelected: DaySelector[];
  },
  userId: string
) => {
  throw new Error("Not built yet");
  // let datesToAdd: Date[] = [];

  // const userTimezone = await getUserTimezone(userId);

  // let start = combineDateAndTime(routine.startDate, routine.fromTime);
  // const initialDate = start;
  // // if "Never end" is selected we build out activities for the given year.
  // // An activity will ask on New Years if we should build out the new year or
  // // if user wants to make adjustments
  // const end = routine.neverEnds
  //   ? endOfYear(start)
  //   : combineDateAndTime(routine.endDate as Date, routine.toTime);
  // const startEndInterval = { start, end };

  // // set start to current week's sunday, will remove if out of range later
  // if (!isSunday(start)) {
  //   start = previousSunday(start);
  // }
  // const selectedDays = routine.weeklyDaysSelected.filter((day) => day.selected);
  // while (!isAfter(start, end)) {
  //   selectedDays.forEach((day) => {
  //     if (day.label === "Sunday") {
  //       datesToAdd.push(start);
  //     } else if (day.label === "Monday") {
  //       datesToAdd.push(addDays(start, 1));
  //     } else if (day.label === "Tuesday") {
  //       datesToAdd.push(addDays(start, 2));
  //     } else if (day.label === "Wednesday") {
  //       datesToAdd.push(addDays(start, 3));
  //     } else if (day.label === "Thursday") {
  //       datesToAdd.push(addDays(start, 4));
  //     } else if (day.label === "Friday") {
  //       datesToAdd.push(addDays(start, 5));
  //     } else if (day.label === "Saturday") {
  //       datesToAdd.push(addDays(start, 6));
  //     }
  //   });

  //   start = nextSunday(start);
  // }

  // // chop off out of range ranges
  // datesToAdd = datesToAdd.filter((date) =>
  //   isWithinInterval(date, startEndInterval)
  // );

  // const activitiesToAdd = new Array(datesToAdd.length);
  // datesToAdd.forEach((date) => {
  //   activitiesToAdd.push({
  //     routineId: routine.id,
  //     start: adjustForDaylightSavings(initialDate, userTimezone, date),
  //     end: adjustForDaylightSavings(
  //       initialDate,
  //       userTimezone,
  //       combineDateAndTime(date, routine.toTime)
  //     ),
  //     userId,
  //   });
  // });

  // const result = await prisma.activity.createMany({
  //   data: activitiesToAdd,
  // });
  // return result;
};

const deleteActivitiesForRoutine = async (routine: Routine) => {
  const result = await prisma.activity.deleteMany({
    where: {
      routineId: routine.id,
    },
  });
  return result;
};

const adjustForDaylightSavings = (
  start: Date,
  userTimezone: string,
  activityTime: Date
) => {
  const isCreatedDuringDaylightSavings = isDaylightSavingsTime(
    start,
    userTimezone
  );

  if (
    !isCreatedDuringDaylightSavings &&
    isDaylightSavingsTime(activityTime, userTimezone)
  ) {
    return addHours(activityTime, -1);
  }

  if (
    isCreatedDuringDaylightSavings &&
    !isDaylightSavingsTime(activityTime, userTimezone)
  ) {
    return addHours(activityTime, 1);
  }

  return activityTime;
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
        monthlyDaysSelected: true,
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
