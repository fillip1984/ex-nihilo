import { type DaySelector, type Routine } from "@prisma/client";
import {
  addDays,
  eachMonthOfInterval,
  endOfMonth,
  endOfYear,
  getYear,
  isAfter,
  isBefore,
  isSunday,
  isWithinInterval,
  nextSunday,
  parse,
  previousSunday,
  setDate,
  startOfMonth,
} from "date-fns";
import { z } from "zod";
import { prisma } from "~/server/db";
import {
  type ActivitySummaryType,
  type RoutineAndAll,
  type RoutineOutcomeType,
  type RoutineSummaryType,
} from "~/types";
import { combineDateAndTime, yyyyMMddHyphenated } from "~/utils/date";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { getUserTimezone } from "./PreferencesRouter";

export const createActivitiesFromRoutine = async (
  routine: RoutineAndAll,
  userId: string
) => {
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
  console.log("creating one time activity for routine", routine.name);

  const userTimezone = await getUserTimezone(userId);

  if (!routine.endDate) {
    throw new Error(
      "Unable to create one time activity from routine, missing end date. Routine: " +
        routine.id
    );
  }

  const startDate = parse(routine.startDate, yyyyMMddHyphenated, new Date());
  const endDate = parse(routine.endDate, yyyyMMddHyphenated, new Date());

  const activityStart = combineDateAndTime(
    startDate,
    routine.fromTime,
    userTimezone
  );
  const activityEnd = combineDateAndTime(endDate, routine.toTime, userTimezone);

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

  const activitiesToAdd = [];

  const userTimezone = await getUserTimezone(userId);

  if (!routine.dailyEveryValue) {
    throw new Error(
      "Routine.dailyEveryValue (a.k.a. Every x days value) is not set"
    );
  }

  let startDate = parse(routine.startDate, yyyyMMddHyphenated, new Date());

  let endDate: Date;
  // if "Never end" is selected we build out activities for the given year.
  // An activity will ask on New Years if we should build out the new year or
  // if user wants to make adjustments
  if (routine.neverEnds) {
    endDate = endOfYear(startDate);
  } else if (routine.endDate) {
    endDate = parse(routine.endDate, yyyyMMddHyphenated, new Date());
  } else {
    throw new Error(
      "Unable to create weekly activities from routine, missing end date (wasn't marked as never ending). Routine: " +
        routine.id
    );
  }

  while (!isAfter(startDate, endDate)) {
    const activityStart = combineDateAndTime(
      startDate,
      routine.fromTime,
      userTimezone
    );
    const activityEnd = combineDateAndTime(
      startDate,
      routine.toTime,
      userTimezone
    );

    activitiesToAdd.push({
      routineId: routine.id,
      start: activityStart,
      end: activityEnd,
      userId,
    });

    startDate = addDays(startDate, routine.dailyEveryValue);
  }

  const result = await prisma.activity.createMany({
    data: activitiesToAdd,
  });
  return result;
};

const createWeeklyActivities = async (
  routine: RoutineAndAll,
  userId: string
) => {
  console.log("creating weekly activities for routine", routine.name);
  let datesToAdd: Date[] = [];

  const userTimezone = await getUserTimezone(userId);

  let startDate = parse(routine.startDate, yyyyMMddHyphenated, new Date());
  let endDate: Date;
  // if "Never end" is selected we build out activities for the given year.
  // An activity will ask on New Years if we should build out the new year or
  // if user wants to make adjustments
  if (routine.neverEnds) {
    endDate = endOfYear(startDate);
  } else if (routine.endDate) {
    endDate = parse(routine.endDate, yyyyMMddHyphenated, new Date());
  } else {
    throw new Error(
      "Unable to create weekly activities from routine, missing end date (wasn't marked as never ending). Routine: " +
        routine.id
    );
  }
  const startEndInterval = { start: startDate, end: endDate };

  // set start to current week's sunday, will remove if out of range later
  if (!isSunday(startDate)) {
    startDate = previousSunday(startDate);
  }
  const selectedDays = routine.weeklyDaysSelected.filter((day) => day.selected);
  while (!isAfter(startDate, endDate)) {
    selectedDays.forEach((day) => {
      if (day.label === "Sunday") {
        datesToAdd.push(startDate);
      } else if (day.label === "Monday") {
        datesToAdd.push(addDays(startDate, 1));
      } else if (day.label === "Tuesday") {
        datesToAdd.push(addDays(startDate, 2));
      } else if (day.label === "Wednesday") {
        datesToAdd.push(addDays(startDate, 3));
      } else if (day.label === "Thursday") {
        datesToAdd.push(addDays(startDate, 4));
      } else if (day.label === "Friday") {
        datesToAdd.push(addDays(startDate, 5));
      } else if (day.label === "Saturday") {
        datesToAdd.push(addDays(startDate, 6));
      }
    });

    startDate = nextSunday(startDate);
  }

  // chop off out of range ranges
  datesToAdd = datesToAdd.filter((date) =>
    isWithinInterval(date, startEndInterval)
  );

  const activitiesToAdd = new Array(datesToAdd.length);
  datesToAdd.forEach((day) => {
    activitiesToAdd.push({
      routineId: routine.id,
      start: combineDateAndTime(day, routine.fromTime, userTimezone),
      end: combineDateAndTime(day, routine.toTime, userTimezone),
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
  console.log("creating monthly activities for routine", routine.name);

  const datesToAdd: Date[] = [];

  const userTimezone = await getUserTimezone(userId);

  const startDate = parse(routine.startDate, yyyyMMddHyphenated, new Date());
  let endDate: Date;
  // if "Never end" is selected we build out activities for the given year.
  // An activity will ask on New Years if we should build out the new year or
  // if user wants to make adjustments
  if (routine.neverEnds) {
    endDate = endOfYear(startDate);
  } else if (routine.endDate) {
    endDate = parse(routine.endDate, yyyyMMddHyphenated, new Date());
  } else {
    throw new Error(
      "Unable to create weekly activities from routine, missing end date (wasn't marked as never ending). Routine: " +
        routine.id
    );
  }
  const months = eachMonthOfInterval({ start: startDate, end: endDate });
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
      .filter((day) => isAfter(day, startDate) && isBefore(day, endDate))
      .forEach((day) => datesToAdd.push(day));
  });

  const activitiesToAdd = new Array(datesToAdd.length);
  datesToAdd.forEach((date) => {
    activitiesToAdd.push({
      routineId: routine.id,
      start: combineDateAndTime(date, routine.fromTime, userTimezone),
      end: combineDateAndTime(date, routine.toTime, userTimezone),
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
  console.log("creating yearly activities for routine", routine.name);

  const userTimezone = await getUserTimezone(userId);

  if (!routine.yearlyMonthValue) {
    throw new Error(
      "Unable to create yearly activities without yearly month value, routine: " +
        routine.name
    );
  }

  if (!routine.yearlyDayValue) {
    throw new Error(
      "Unable to create yearly activities without yearly day value, routine: " +
        routine.name
    );
  }

  const startDate = parse(routine.startDate, yyyyMMddHyphenated, new Date());

  let endDate: Date;
  // if "Never end" is selected we build out activities for the given year.
  // An activity will ask on New Years if we should build out the new year or
  // if user wants to make adjustments
  if (routine.neverEnds) {
    endDate = endOfYear(startDate);
  } else if (routine.endDate) {
    endDate = parse(routine.endDate, yyyyMMddHyphenated, new Date());
  } else {
    throw new Error(
      "Unable to create weekly activities from routine, missing end date (wasn't marked as never ending). Routine: " +
        routine.id
    );
  }

  const thisYear = { start: startDate, end: endDate };

  const activity = {
    routineId: routine.id,
    start: combineDateAndTime(
      new Date(
        getYear(startDate),
        routine.yearlyMonthValue - 1,
        routine.yearlyDayValue
      ),
      routine.fromTime,
      userTimezone
    ),
    end: combineDateAndTime(
      new Date(
        getYear(startDate),
        routine.yearlyMonthValue - 1,
        routine.yearlyDayValue
      ),
      routine.toTime,
      userTimezone
    ),
    userId,
  };

  if (isWithinInterval(activity.start, thisYear)) {
    const result = await prisma.activity.create({
      data: activity,
    });
    return result;
  }

  return null;
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
    console.log("Rebuilding activities for user: ", userId);
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
    console.log("Rebuilt activities for user: ", userId);
  }),
  readAll: protectedProcedure
    .input(z.object({ start: z.date(), end: z.date() }))
    .query(async ({ ctx, input }) => {
      // const userPreferences = await ctx.prisma.preferences.findUnique({
      //   where: {
      //     userId: ctx.session.user.id,
      //   },
      // });
      // if (!userPreferences) {
      //   throw new Error("Unable to read all for user, timezone not found");
      // }

      const userId = ctx.session.user.id;

      console.log(
        "Finding all activities between start:",
        input.start,
        "and end:",
        input.end
      );

      const activities = await ctx.prisma.activity.findMany({
        where: {
          userId,
          start: {
            gte: input.start,
            lte: input.end,
          },
          // ...(input.filter === "Available"
          //   ? { skip: false, complete: false }
          //   : {}),
          // ...(input.filter === "Complete" ? { complete: true } : {}),
          // ...(input.filter === "Skipped" ? { skip: true } : {}),
          // wide open so not necessary ...(input.filter === "All" ? {} : {}),
        },
        include: {
          routine: {
            include: {
              topic: true,
            },
          },
        },
      });

      const routineActivityOutcomes: RoutineOutcomeType[] = [];
      const routines = activities.map((activity) => {
        return {
          id: activity.routine.id,
          name: activity.routine.name,
          description: activity.routine.description,
        };
      });
      const uniqueRoutines = Array.from(new Set(routines.map((r) => r.id))).map(
        (id) => {
          return routines.find((r) => r.id === id);
        }
      ) as RoutineSummaryType[];

      // console.log("routines", routines.length);
      // console.log("unique routines", uniqueRoutines.length);

      uniqueRoutines.forEach((routine) => {
        const actsForRoutine = activities.filter(
          (activity) => activity.routine.id === routine.id
        );
        const routineOutcome: RoutineOutcomeType = {
          id: routine.id,
          name: routine.name,
          description: routine.description,
          activities: actsForRoutine.map((act) => {
            return {
              id: act.id,
              complete: act.complete,
              skip: act.skip,
            } as ActivitySummaryType;
          }),
        };
        routineActivityOutcomes.push(routineOutcome);
      });

      // console.log(routineActivityOutcomes);

      return routineActivityOutcomes;
    }),
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
