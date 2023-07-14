import {
  eachMonthOfInterval,
  endOfYear,
  format,
  parse,
  startOfYear,
} from "date-fns";
import { zonedTimeToUtc } from "date-fns-tz";

export const yyyyMMddHyphenated = "yyyy-MM-dd";
export const HH_mm_aka24hr = "HH:mm";

export const getMonths = () => {
  const jan = startOfYear(new Date());
  const dec = endOfYear(new Date());
  const months = eachMonthOfInterval({ start: jan, end: dec }).map((month) => {
    return {
      name: format(month, "MMMM"),
      shortName: format(month, "MMM"),
      number: parseInt(format(month, "M")),
    };
  });

  return months;
};

export const nextNewYears = (date: Date) => {
  const nextNewYears = new Date(date.getFullYear() + 1, 0, 1);
  return nextNewYears;
};

/**
 * Combines a Date (yyyy-MM-dd) with time (HH:mm 24hr format) returning a new date (UTC timezone)
 */
export const combineDateAndTime = (
  datePart: Date,
  time: string,
  timezone: string
) => {
  const timePart = parse(time, HH_mm_aka24hr, new Date());

  const date = new Date(
    datePart.getFullYear(),
    datePart.getMonth(),
    datePart.getDate(),
    timePart.getHours(),
    timePart.getMinutes(),
    timePart.getSeconds()
  );

  return zonedTimeToUtc(date, timezone);
};
