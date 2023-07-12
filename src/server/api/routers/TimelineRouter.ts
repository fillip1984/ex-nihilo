import { endOfDay, startOfDay } from "date-fns";
import { z } from "zod";
import { prisma } from "~/server/db";
import { type TimelineEvent } from "~/types";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { fetchSunInfo } from "./SunInfoRouter";

export const TimelineRouter = createTRPCRouter({
  buildAgenda: protectedProcedure
    .input(z.object({ date: z.date(), filter: z.string().nullish() }))
    .query(async ({ ctx, input }) => {
      // fold in the cheese
      let events: TimelineEvent[] = [];

      const userId = ctx.session.user.id;
      const activities = await buildActivityInfo(
        userId,
        input.date,
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
            input.date,
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
        return eventA.fromTime.getTime() - eventB.fromTime.getTime();
      });

      return events;
    }),
});

const buildActivityInfo = async (
  userId: string,
  date: Date,
  filter: string | null | undefined
) => {
  const start = startOfDay(date);
  const end = endOfDay(date);

  const result = await prisma.activity.findMany({
    where: {
      userId,
      start: {
        gte: start,
        lte: end,
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
    },
  });

  const activitiesAsTLEvents = result.map((activity) => {
    const event: TimelineEvent = {
      type: "Activity",
      id: activity.id,
      name: activity.routine.name,
      description: activity.routine.description,
      start: activity.start,
      end: activity.end,
      fromTime: activity.routine.fromTime,
      toTime: activity.routine.toTime,
      complete: activity.complete,
      completedAt: activity.completedAt,
      skip: activity.skip,
      color: activity.routine.topic.color,
      icon: activity.routine.topic.icon,
      activity: activity,
      topicName: activity.routine.topic.name,
      lengthOfDate: null,
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
      fromTime: sunInfo.sunrise,
      toTime: sunInfo.sunrise,
      complete: null,
      completedAt: null,
      skip: null,
      color: "bg-yellow-300/60 text-yellow-200",
      icon: "BsSunrise",
      activity: null,
      topicName: "Nature",
      lengthOfDate: sunInfo.dayLength,
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
      fromTime: sunInfo.sunset,
      toTime: sunInfo.sunset,
      complete: null,
      completedAt: null,
      skip: null,
      // occurrenceType: "DAILY",
      color: "bg-blue-300/60 text-blue-200",
      icon: "BsSunset",
      activity: null,
      topicName: "Nature",
      lengthOfDate: sunInfo.dayLength,
    };
  }

  return { sunrise, sunset };
};
