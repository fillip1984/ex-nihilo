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
