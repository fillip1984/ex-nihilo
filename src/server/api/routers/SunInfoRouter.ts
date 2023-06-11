import { format, intervalToDuration, parseISO } from "date-fns";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { prisma } from "~/server/db";
import { yyyyMMddHyphenated } from "~/utils/date";

export type SunInfoResponse = {
  results: {
    sunrise: string;
    sunset: string;
    solar_noon: string;
    day_length: number;
    civil_twilight_begin: string;
    civil_twilight_end: string;
    nautical_twilight_begin: string;
    nautical_twilight_end: string;
    astronomical_twilight_begin: string;
    astronomical_twilight_end: string;
  };
  status: string;
};

export type SunInfo = {
  sunrise: Date;
  sunset: Date;
  dayLength: Duration;
};

// TODO: externalized this so that we could call it from TimelineRouter as well...not sure if there's a way to call a router from another router?
export const fetchSunInfo = async (
  date: Date,
  latitude: number,
  longitude: number
) => {
  prisma.preferences;
  console.log("fetching sun info");

  const formattedDate = format(date, yyyyMMddHyphenated);
  const formatted = 0;

  // provided by: https://sunrise-sunset.org/api
  // changing formatted to 1 changes response values!
  const sunInfoResponse = await fetch(
    `https://api.sunrise-sunset.org/json?lat=${latitude}&lng=${longitude}&date=${formattedDate}&formatted=${formatted}`
  );

  if (!sunInfoResponse.ok) {
    console.warn(
      "Error occurred while fetching sunrise/sunset info, info is nice to have so not throwing an error"
    );
    return null;
  }

  const sunInfoResponseData = (await sunInfoResponse.json()) as SunInfoResponse;

  const sunrise = parseISO(sunInfoResponseData.results.sunrise);
  const sunset = parseISO(sunInfoResponseData.results.sunset);
  // See: https://stackoverflow.com/questions/48776140/format-a-duration-from-seconds-using-date-fns
  const dayLength = intervalToDuration({
    start: 0,
    end: sunInfoResponseData.results.day_length * 1000,
  });

  const sunInfo: SunInfo = {
    sunrise,
    sunset,
    dayLength,
  };

  return sunInfo;
};

export const SunInfoRouter = createTRPCRouter({
  read: protectedProcedure
    .input(z.object({ date: z.date() }))
    .query(async ({ ctx, input }) => {
      const preferences = await ctx.prisma.preferences.findUnique({
        where: { userId: ctx.session.user.id },
      });
      if (preferences) {
        const sunInfo = await fetchSunInfo(
          input.date,
          preferences.latitude,
          preferences.longitude
        );
        return sunInfo;
      }

      return null;
    }),
});
