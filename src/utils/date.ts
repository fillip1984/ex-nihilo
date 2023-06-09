import { format, getYear } from "date-fns";

export const nextNewYears = (date: Date) => {
  const nextNewYears = new Date(getYear(date) + 1, 0, 1);
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

  console.log(
    `DatePart: ${format(datePart, "yyyy-MM-dd")}, TimePart: ${format(
      timePart,
      "HH:mm:ss"
    )}, returned: ${format(date, "yyyy-MM-dd HH:mm:ss")}`
  );

  return date;
};
