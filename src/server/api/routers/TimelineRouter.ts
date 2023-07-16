import { endOfDay, intervalToDuration, startOfDay } from "date-fns";
import { zonedTimeToUtc } from "date-fns-tz";
import { z } from "zod";
import { prisma } from "~/server/db";
import { type RunningLogType, type TimelineEvent } from "~/types";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { getUserTimezone } from "./PreferencesRouter";
import { fetchSunInfo } from "./SunInfoRouter";

export const TimelineRouter = createTRPCRouter({
  buildAgenda: protectedProcedure
    .input(z.object({ date: z.date(), filter: z.string().nullish() }))
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const userTimeZone = await getUserTimezone(userId);
      const searchIntervalUTC = {
        start: zonedTimeToUtc(startOfDay(input.date), userTimeZone),
        end: zonedTimeToUtc(endOfDay(input.date), userTimeZone),
      };
      console.log(
        "building agenda for interval:",
        searchIntervalUTC,
        " and filter:",
        input.filter
      );

      // fold in the cheese
      let events: TimelineEvent[] = [];

      const activities = await buildActivityInfo(
        userId,
        searchIntervalUTC,
        input.filter
      );

      if (activities) {
        events = events.concat(activities);
      }

      const preferences = await ctx.prisma.preferences.findUnique({
        where: { userId: ctx.session.user.id },
      });

      if (input.filter === "Available" || input.filter === "All") {
        if (preferences?.latitude && preferences?.longitude) {
          const { sunrise, sunset } = await buildSunInfo(
            searchIntervalUTC.start,
            preferences.latitude,
            preferences.longitude
          );
          if (sunrise && sunset) {
            events.unshift(sunrise);
            events.push(sunset);
          }
        }
      }

      events = events.sort((eventA, eventB) => {
        return eventA.start.getTime() - eventB.start.getTime();
      });

      return events;
    }),
});

const buildActivityInfo = async (
  userId: string,
  searchIntervalUTC: { start: Date; end: Date },
  filter: string | null | undefined
) => {
  const result = await prisma.activity.findMany({
    where: {
      userId,
      start: {
        gte: searchIntervalUTC.start,
        lte: searchIntervalUTC.end,
      },
      ...(filter === "Available" ? { skip: false, complete: false } : {}),
      ...(filter === "Complete" ? { complete: true } : {}),
      ...(filter === "Skipped" ? { skip: true } : {}),
      // wide open so not necessary ...(input.filter === "All" ? {} : {}),
    },
    include: {
      routine: {
        include: {
          topic: true,
        },
      },
      run: {
        select: {
          activityId: true,
          date: true,
          distance: true,
          duration: true,
          pace: true,
          heartRageAverage: true,
          weather: true,
          mood: true,
        },
      },
    },
  });

  const activitiesAsTLEvents = result.map((activity) => {
    let run: RunningLogType | undefined = undefined;
    if (activity.run) {
      run = {
        activityId: activity.id,
        date: activity.run.date,
        distance: activity.run.distance.toNumber(),
        duration: activity.run.duration,
        pace: activity.run.pace,
        heartRateAverage: activity.run.heartRageAverage?.toString(),
        weather: activity.run.weather ?? undefined,
        mood: activity.run.mood ?? undefined,
      };
    }
    const event: TimelineEvent = {
      type: "Activity",
      id: activity.id,
      name: activity.routine.name,
      description: activity.routine.description,
      start: activity.start,
      end: activity.end,
      // fromTime: activity.routine.fromTime,
      // toTime: activity.routine.toTime,
      complete: activity.complete,
      completedAt: activity.completedAt,
      skip: activity.skip,
      color: activity.routine.topic.color,
      icon: activity.routine.topic.icon,
      activity: activity,
      topicName: activity.routine.topic.name,
      duration: intervalToDuration({
        start: activity.start,
        end: activity.end,
      }),
      onComplete: activity.routine.onComplete,
      run,
    };
    return event;
  });

  return activitiesAsTLEvents;
};

const buildSunInfo = async (
  date: Date,
  latitude: number,
  longitude: number
) => {
  let sunrise: TimelineEvent | null = null;
  let sunset: TimelineEvent | null = null;
  const sunInfo = await fetchSunInfo(date, latitude, longitude);
  if (sunInfo) {
    sunrise = {
      type: "Suninfo",
      id: date.toISOString() + "sunrise",
      name: "Sunrise",
      description: "Nature stuff",
      start: sunInfo.sunrise,
      end: sunInfo.sunrise,
      complete: null,
      completedAt: null,
      skip: null,
      color: "Yellow",
      icon: "BsSunrise",
      activity: null,
      topicName: "Nature",
      duration: sunInfo.dayLength,
      onComplete: "SIMPLE",
    };
  }
  if (sunInfo) {
    sunset = {
      type: "Suninfo",
      id: date.toISOString() + "sunset",
      name: "Sunset",
      description: "Nature stuff",
      start: sunInfo.sunset,
      end: sunInfo.sunset,
      complete: null,
      completedAt: null,
      skip: null,
      color: "Yellow",
      icon: "BsSunset",
      activity: null,
      topicName: "Nature",
      duration: sunInfo.dayLength,
      onComplete: "SIMPLE",
    };
  }

  return { sunrise, sunset };
};
