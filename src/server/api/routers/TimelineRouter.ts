import { type TimelineEvent } from "@prisma/client";
import { addMinutes } from "date-fns";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { fetchSunInfo } from "./SunInfoRouter";

// export type TimelineEvent = {
//   id: string;
//   topic: string;
//   icon: JSX.Element;
//   description: string;
//   color: string;
//   start: Date;
//   end?: Date;
//   complete: boolean;
// };

export type TimelinePoint = {
  date: Date;
  events: TimelineEvent[];
};

export const TimelineRouter = createTRPCRouter({
  readAll: protectedProcedure.query(async ({ ctx }) => {
    const routines = await ctx.prisma.routine.findMany({
      // orderBy: {
      //   startDate: "desc",
      //   fromTime: "desc",
      // },
      where: {
        startDate: {
          equals: new Date(),
        },
      },
    });

    routines.forEach((routine) => console.log("routine", routine));

    // const events = await ctx.prisma.timelineEvent.findMany({
    //   orderBy: {
    //     start: "desc",
    //   },
    // });

    const events: TimelineEvent[] = [
      {
        id: "1",
        topic: "Routine",
        icon: "<FaBed />",
        description: "Wake up",
        color: "bg-orange-300/60 text-orange-200",
        start: new Date(),
        end: addMinutes(new Date(), 30),
        complete: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "2",
        topic: "Health & Fitness",
        icon: "<FaRunning />",
        description: "Go for a run",
        color: "bg-green-300/60 text-green-200",
        start: new Date(),
        end: addMinutes(new Date(), 30),
        complete: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "3",
        topic: "Home chore",
        icon: "<MdOutlineCleaningServices />",
        description: "Unload dishwasher",
        color: "bg-red-400/60 text-red-300",
        start: new Date(),
        end: addMinutes(new Date(), 30),
        complete: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    let sunrise: TimelineEvent;
    let sunset: TimelineEvent;
    const sunInfo = await fetchSunInfo(new Date());
    if (sunInfo) {
      sunrise = {
        topic: "Nature",
        description: "Sunrise",
        start: sunInfo.sunrise,
        color: "bg-yellow-300/60 text-yellow-200",
        icon: "<BsSunrise />",
        createdAt: new Date(),
        updatedAt: new Date(),
        id: (Math.random() * new Date().getTime()).toString(),
        complete: false,
        end: null,
      };
    }
    if (sunInfo) {
      sunset = {
        topic: "Nature",
        description: "Sunset",
        start: sunInfo.sunset,
        color: "bg-blue-300/60 text-blue-200",
        icon: "<BsSunset />",
        createdAt: new Date(),
        updatedAt: new Date(),
        id: (Math.random() * new Date().getTime()).toString(),
        complete: false,
        end: null,
      };
    }

    // fold in the cheese
    const timeline: TimelinePoint[] = [];
    const uniqueDatesAsNumbers = new Set<number>();
    if (events) {
      events
        .map((event) => event.start)
        .forEach((date) => uniqueDatesAsNumbers.add(date.getTime()));
    }

    const uniqueDates: Date[] = [];
    uniqueDatesAsNumbers.forEach((value) => {
      uniqueDates.push(new Date(value));
    });

    const sortedUniqueDates = uniqueDates.sort(function (a: Date, b: Date) {
      return b.getTime() - a.getTime();
    });

    sortedUniqueDates.forEach((uniqueDate) => {
      const timelinePoint: TimelinePoint = {
        date: uniqueDate,
        events: [],
      };

      events
        .filter(
          (event) => event.start.getTime() === timelinePoint.date.getTime()
        )
        .forEach((event) => {
          timelinePoint.events.push(event);
        });

      timelinePoint.events.push(sunrise);
      timelinePoint.events.push(sunset);
      timeline.push(timelinePoint);
    });

    return timeline;
  }),
});
