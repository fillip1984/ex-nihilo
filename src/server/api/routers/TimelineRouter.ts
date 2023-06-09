import { createId } from "@paralleldrive/cuid2";

import { createTRPCRouter, protectedProcedure } from "../trpc";
import { fetchSunInfo } from "./SunInfoRouter";
import { type Routine } from "@prisma/client";
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

// export type TimelinePoint = {
//   date: Date;
//   events: TimelineEvent[];
// };

export const TimelineRouter = createTRPCRouter({
  readAll: protectedProcedure.query(async ({ ctx }) => {
    let routines = await ctx.prisma.routine.findMany({
      orderBy: [
        {
          startDate: "asc",
        },
        {
          fromTime: "asc",
        },
      ],
      where: {
        startDate: {
          equals: new Date(),
        },
      },
    });

    let sunrise;
    let sunset;
    const sunInfo = await fetchSunInfo(new Date());
    if (sunInfo) {
      sunrise = {
        id: createId(),
        name: "Sunrise",
        description: "Nature stuf",
        occurrenceType: "DAILY",
        fromTime: sunInfo.sunrise,
        // color: "bg-yellow-300/60 text-yellow-200",
        // icon: "<BsSunrise />",
      };
    }
    if (sunInfo) {
      sunset = {
        id: createId(),
        name: "Sunset",
        description: "Nature stuf",
        occurrenceType: "DAILY",
        fromTime: sunInfo.sunset,
        // color: "bg-blue-300/60 text-blue-200",
        // icon: "<BsSunset />",
      };
    }

    // fold in the cheese
    routines.unshift(sunrise as Routine);
    routines.push(sunset as Routine);

    routines = routines.sort((routineA, routineB) => {
      return routineA.fromTime.getTime() - routineB.fromTime.getTime();
    });

    return routines;
  }),
});
