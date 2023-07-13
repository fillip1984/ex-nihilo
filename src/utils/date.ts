import { getTimezoneOffset } from "date-fns-tz";

export const yyyyMMddHyphenated = "yyyy-MM-dd";
export const HH_mm_aka24hr = "HH:mm";

export const months = [
  { name: "January", shortName: "Jan", number: 1 },
  { name: "February", shortName: "Feb", number: 2 },
  { name: "March", shortName: "Mar", number: 3 },
  { name: "April", shortName: "Apr", number: 4 },
  { name: "May", shortName: "May", number: 5 },
  { name: "June", shortName: "June", number: 6 },
  { name: "July", shortName: "July", number: 7 },
  { name: "August", shortName: "Aug", number: 8 },
  { name: "September", shortName: "Sept", number: 9 },
  { name: "October", shortName: "Oct", number: 10 },
  { name: "November", shortName: "Nov", number: 11 },
  { name: "December", shortName: "Dec", number: 12 },
];

export const nextNewYears = (date: Date) => {
  const nextNewYears = new Date(date.getFullYear() + 1, 0, 1);
  return nextNewYears;
};

export const combineDateAndTime = (datePart: Date, timePart: Date) => {
  const date = new Date(
    datePart.getFullYear(),
    datePart.getMonth(),
    datePart.getDate(),
    timePart.getHours(),
    timePart.getMinutes(),
    timePart.getSeconds()
  );

  return date;
};

// Determines if given date is during daylight savings time
// See: https://stackoverflow.com/questions/11887934/how-to-check-if-dst-daylight-saving-time-is-in-effect-and-if-so-the-offset
// Gist is, daylight savings happens before july so we grab out a known month that we don't observe DST (Jan) and a month we know we
// do observe DST (July) and check which month has the highest DST offset and if it doesn't match the current offset then we're observing DST
// The reason I couldn't take the example verbatim is my code is running server side and everything gets created as UTC so no offset. Had to
// rely on date-fns-tz to determine the timezones
export const isDaylightSavingsTime = (date: Date, timezone: string) => {
  const jan =
    -1 * getTimezoneOffset(timezone, new Date(date.getFullYear(), 0, 1));
  const jul =
    -1 * getTimezoneOffset(timezone, new Date(date.getFullYear(), 6, 1));
  const dateOffset = -1 * getTimezoneOffset(timezone, date);
  return Math.max(jan, jul) !== dateOffset;
};
