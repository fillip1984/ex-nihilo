import { type DaySelector, type Routine } from "@prisma/client";
import {
  addDays,
  endOfDay,
  isAfter,
  isSameDay,
  isSunday,
  isWithinInterval,
  nextSunday,
  previousSunday,
  startOfDay,
} from "date-fns";
import { z } from "zod";
import { prisma } from "~/server/db";
import { combineDateAndTime, nextNewYears } from "~/utils/date";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const createActivitiesFromRoutine = async (
  routine: Routine & {
    weeklyDaysSelected: DaySelector[];
  }
) => {
  console.log("creating activities from routine", routine.name);

  switch (routine.occurrenceType) {
    case "NEVER":
      return await createOneTimeActivity(routine);
    case "DAILY":
      return await createDailyActivities(routine);
    case "WEEKLY":
      return await createWeeklyActivities(routine);
  }
};

const createOneTimeActivity = async (routine: Routine) => {
  console.log(
    `creating one time activity for routine: ${
      routine.name
    } on: ${routine.startDate.toLocaleString()}`
  );
  return await prisma.activity.create({
    data: {
      routineId: routine.id,
      start: routine.startDate,
      end: routine.endDate as Date,
    },
  });
};

const createDailyActivities = async (routine: Routine) => {
  console.log("creating daily activities for routine", routine.name);
  const activitiesToAdd = [];
  if (!routine.dailyEveryValue) {
    throw new Error(
      "Routine.dailyEveryValue (a.k.a. Every x days value) is not set"
    );
  }

  let start = routine.startDate;
  const end = routine.endDate ?? nextNewYears(new Date());
  while (!isSameDay(start, end) && !isAfter(start, end)) {
    if (true) {
      console.log(
        `adding daily activity for routine: ${
          routine.name
        } on: ${start.toLocaleString()}`
      );
      activitiesToAdd.push({
        routineId: routine.id,
        start,
        end: start,
      });
    }
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
  }
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
  create: protectedProcedure
    .input(
      z.object({
        routineIds: z.array(z.string()),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const routines = await ctx.prisma.routine.findMany({
        where: {
          id: {
            in: input.routineIds,
          },
        },
        include: {
          weeklyDaysSelected: true,
        },
      });

      //clean out previous, build new
      for (const routine of routines) {
        await deleteActivitiesForRoutine(routine);
        await createActivitiesFromRoutine(routine);
      }
    }),
  readAll: protectedProcedure
    .input(z.object({ date: z.date(), filter: z.string().nullish() }))
    .query(async ({ ctx, input }) => {
      const start = startOfDay(input.date);
      const end = endOfDay(input.date);

      const result = ctx.prisma.activity.findMany({
        where: {
          start: {
            gte: start,
            lte: end,
          },
          ...(input.filter === "Available"
            ? { skip: false, complete: false }
            : {}),
          ...(input.filter === "Complete" ? { complete: true } : {}),
          ...(input.filter === "Skipped" ? { skip: true } : {}),
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

      // TODO: need to finish this
      // let sunrise;
      // let sunset;
      // const sunInfo = await fetchSunInfo(new Date());
      // if (sunInfo) {
      //   sunrise = {
      //     id: createId(),
      //     name: "Sunrise",
      //     description: "Nature stuf",
      //     occurrenceType: "DAILY",
      //     fromTime: sunInfo.sunrise,
      //     // color: "bg-yellow-300/60 text-yellow-200",
      //     // icon: "<BsSunrise />",
      //   };
      // }
      // if (sunInfo) {
      //   sunset = {
      //     id: createId(),
      //     name: "Sunset",
      //     description: "Nature stuf",
      //     occurrenceType: "DAILY",
      //     fromTime: sunInfo.sunset,
      //     // color: "bg-blue-300/60 text-blue-200",
      //     // icon: "<BsSunset />",
      //   };
      // }

      return result;
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
