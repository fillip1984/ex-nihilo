import { type TimelineEvent } from "@prisma/client";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { api } from "~/utils/api";
import { addMinutes } from "date-fns";

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
  readAll: protectedProcedure.query(({ ctx }) => {
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

    // let sunrise: Partial<TimelineEvent>;
    // let sunset: Partial<TimelineEvent>;
    // const { data: sunInfo } = api.sunInfoRouter.read.useQuery({
    //   date: new Date(),
    // });
    // if (sunInfo) {
    //   sunrise = {
    //     topic: "Sunrise",
    //     description: "Length of day123: ",
    //     start: sunInfo.sunrise,
    //     color: "bg-yellow-300/60 text-yellow-200",
    //     icon: "<BsSunrise />",
    //   };
    // }
    // if (sunInfo) {
    //   sunset = {
    //     topic: "Sunset",
    //     description: "Length of day456: ",
    //     start: sunInfo.sunset,
    //     color: "bg-yellow-300/60 text-yellow-200",
    //     icon: "<BsSunset />",
    //   };
    // }

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

      timeline.push(timelinePoint);
    });

    return timeline;
  }),
});
