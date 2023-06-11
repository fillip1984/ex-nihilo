export const yyyyMMddHyphenated = "yyyy-MM-dd";
export const HH_mm_aka24hr = "HH:mm";

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
