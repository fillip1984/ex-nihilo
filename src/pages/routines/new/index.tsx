import { useAutoAnimate } from "@formkit/auto-animate/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { OccurrenceType } from "@prisma/client";
import { getDaysInMonth } from "date-fns";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useForm, useWatch, type SubmitHandler } from "react-hook-form";
import {
  BsBodyText,
  BsChevronDown,
  BsClock,
  BsGeoAlt,
  BsRepeat,
} from "react-icons/bs";
import { z } from "zod";
import { api } from "~/utils/api";

export const routineFormSchema = z.object({
  routine: z
    .object({
      summary: z.string().min(1),
      details: z.string().min(1),
      occurrenceType: z.nativeEnum(OccurrenceType),
      dailyEveryValue: z.number().nullish(),
      yearlyMonthValue: z.number().nullish(),
      yearlyDayValue: z.number().nullish(),
      startDate: z.string().min(1),
      fromTime: z.string().min(1),
      toTime: z.string().min(1),
      endDate: z.string().nullish(),
      neverEnds: z.boolean(),
    })
    .refine(
      (data) => data.neverEnds || (data.endDate && data.endDate?.length > 0),
      {
        message: "Either select an end date or select the never ends option",
        path: ["endDate"],
      }
    ),
  weeklyDaySelectorOptions: z.array(
    z.object({
      label: z.string(),
      abbreviatedLabel: z.string(),
      selected: z.boolean(),
    })
  ),
  monthlyDaySelectorOptions: z.array(
    z.object({
      label: z.number(),
      abbreviatedLabel: z.number(),
      selected: z.boolean(),
    })
  ),
});

type RoutineFormSchemaType = z.infer<typeof routineFormSchema>;

const NewRoutine = () => {
  const [occurrenceAnimation] = useAutoAnimate();
  const [whenAnimation] = useAutoAnimate();
  const [specificLocationAnimation] = useAutoAnimate();
  const [specificLocation, setSpecificLocation] = useState(false);

  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    getValues,
    reset,
  } = useForm<RoutineFormSchemaType>({
    resolver: zodResolver(routineFormSchema),
  });

  useEffect(() => {
    const monthlyDaySelectorOptions = Array.from(Array(31).keys()).map(
      (counter) => ({
        label: counter + 1,
        abbreviatedLabel: counter + 1,
        selected: false,
      })
    );

    const weeklyDaySelectorOptions = [
      { label: "Sunday", abbreviatedLabel: "Sun", selected: false },
      { label: "Monday", abbreviatedLabel: "Mon", selected: false },
      { label: "Tuesday", abbreviatedLabel: "Tue", selected: false },
      { label: "Wednesday", abbreviatedLabel: "Wed", selected: false },
      { label: "Thursday", abbreviatedLabel: "Thurs", selected: false },
      { label: "Friday", abbreviatedLabel: "Fri", selected: false },
      { label: "Saturday", abbreviatedLabel: "Sat", selected: false },
    ];

    const newRoutine = {
      routine: {
        summary: "test",
        details: "test",
        startDate: "2023-06-07",
        fromTime: "17:00",
        toTime: "18:00",
        neverEnds: true,
        occurrenceType: OccurrenceType.NEVER,
      },
      weeklyDaySelectorOptions: weeklyDaySelectorOptions,
      monthlyDaySelectorOptions: monthlyDaySelectorOptions,
    };
    reset(newRoutine);
  }, [reset]);

  const months = [
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

  const occurrenceTypeWatch = useWatch({
    control,
    name: "routine.occurrenceType",
  });
  const neverEndsWatch = useWatch({ control, name: "routine.neverEnds" });
  const yearlyMonthValueWatch = useWatch({
    control,
    name: "routine.yearlyMonthValue",
  });

  const utils = api.useContext();
  const createRoutine = api.routines.create.useMutation({
    onSuccess: async () => {
      await utils.routines.invalidate();
      void router.push("/");
    },
  });

  const onSubmit: SubmitHandler<RoutineFormSchemaType> = (formData) => {
    console.log("formData", formData);
    createRoutine.mutate({ ...formData });
  };

  useEffect(() => {
    console.log("Errors", errors);
  }, [errors]);
  return (
    <form
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      onSubmit={handleSubmit(onSubmit)}
      className="mx-4 flex flex-col gap-2 pt-8">
      <div className="form-card rounded-lg bg-slate-300 p-2 text-slate-700">
        <div className="form-card-title flex items-center gap-2 py-2 text-2xl">
          <BsBodyText />
          <span className="uppercase">INFO</span>
        </div>
        <div className="form-card-field-set space-y-1 px-2">
          <input
            type="text"
            placeholder="Summary"
            {...register("routine.summary")}
          />
          <textarea placeholder="Details" {...register("routine.details")} />
        </div>
      </div>

      <div className="form-card rounded-lg bg-slate-300 p-2 text-slate-700">
        <div className="form-card-title flex cursor-pointer items-center gap-2 py-2 text-2xl">
          <BsRepeat />
          <span className="uppercase">REPEAT</span>
        </div>

        <div
          ref={occurrenceAnimation}
          className="form-card-field-set space-y-1 px-2">
          <div className="grid grid-cols-5 items-center gap-2">
            <label>Frequency</label>
            <select
              className="col-span-2 col-start-4"
              {...register("routine.occurrenceType")}>
              <option value="NEVER">Never</option>
              <option value="DAILY">Daily</option>
              <option value="WEEKLY">Weekly</option>
              <option value="MONTHLY">Monthly</option>
              <option value="YEARLY">Yearly</option>
            </select>
          </div>
          {occurrenceTypeWatch === "DAILY" && (
            <div className="grid grid-cols-3 items-center gap-2">
              <label>Every</label>
              {occurrenceTypeWatch === "DAILY" && (
                <select
                  className="col-start-3"
                  {...register("routine.dailyEveryValue", {
                    valueAsNumber: true,
                  })}>
                  <option value={1}>Day</option>
                  {Array.from(Array(30).keys()).map((counter) => (
                    <option key={counter + 2} value={counter + 2}>
                      {counter + 2} days
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}
          {occurrenceTypeWatch === "WEEKLY" && (
            <div className="flex flex-col items-center">
              <span className="my-2">On (please select one or more)</span>
              <div className="flex gap-2">
                {getValues("weeklyDaySelectorOptions")?.map((day, index) => (
                  <div key={day.label}>
                    <input
                      type="checkbox"
                      className="peer hidden"
                      id={`daysOfWeek.${index}.selected`}
                      {...register(
                        `weeklyDaySelectorOptions.${index}.selected`
                        // {
                        //   validate: {
                        //     isAtLeastOneDaySelected: () => {
                        //       return (
                        //         occurrenceTypeWatch === "WEEKLY" &&
                        //         getValues("weeklyDaySelectorOptions")?.some(
                        //           (day) => day.selected
                        //         )
                        //       );
                        //     },
                        //   },
                        // }
                      )}
                    />
                    <label
                      htmlFor={`daysOfWeek.${index}.selected`}
                      className="flex h-12 w-12 cursor-pointer select-none items-center justify-center rounded-full bg-white text-slate-700 transition-colors duration-300 ease-in-out peer-checked:bg-slate-500 peer-checked:text-white">
                      {day.abbreviatedLabel}
                    </label>
                  </div>
                  // this didn't work because react-hook-form focuses on the first button when there's a validation error. This caused the first item to be selected whenever you selected another item. You also had to rely on a useEffect/trigger combo to trigger revalidation on changes
                  // <button
                  //   key={day.label}
                  //   type="button"
                  //   {...register(`daysOfWeek.${index}.selected`, {
                  //     validate: validateDayOfWeekSelection,
                  //   })}
                  //   onClick={() => {
                  //     updateDaysOfWeek(index, {
                  //       ...day,
                  //       selected: !day.selected,
                  //     });
                  //   }}
                  //   className={`flex h-12 w-12 flex-col items-center justify-center rounded-full p-2 transition-colors duration-200 ${
                  //     day.selected ? "bg-black text-white" : "bg-white"
                  //   }`}>
                  //   <span>{day.label}</span>
                  // </button>
                ))}
              </div>
              {errors.weeklyDaySelectorOptions && (
                <span className="text-red-400">
                  Please select at least one day
                </span>
              )}
            </div>
          )}
          {occurrenceTypeWatch === "MONTHLY" && (
            <div className="flex flex-col items-center">
              <label className="my-2">On (please select one or more)</label>
              <div className="grid w-full grid-cols-7">
                {getValues("monthlyDaySelectorOptions")?.map((day, index) => (
                  <div
                    key={day.label}
                    className="flex h-8 border border-slate-400 text-center">
                    <input
                      type="checkbox"
                      className="peer hidden"
                      id={`daysOfMonth.${index}.selected`}
                      {...register(
                        `monthlyDaySelectorOptions.${index}.selected`
                      )}
                    />
                    <label
                      htmlFor={`daysOfMonth.${index}.selected`}
                      className="flex h-full w-full cursor-pointer select-none items-center justify-center bg-white text-slate-700 transition-colors duration-300 ease-in-out peer-checked:bg-slate-500 peer-checked:text-white">
                      {day.abbreviatedLabel} {day.abbreviatedLabel > 28 && "*"}
                    </label>
                  </div>
                ))}
              </div>
              <div className="my-2 flex gap-1 text-sm text-slate-500">
                <span className="font-bold">*</span>
                <span>
                  Days selected that don&apos;t exist in a month will fall on
                  the last day of shorter months
                </span>
              </div>
            </div>
          )}

          {occurrenceTypeWatch === "YEARLY" && (
            <div className="flex flex-col gap-1">
              <div className="grid grid-cols-5 items-center gap-2">
                <label>Month</label>
                <select
                  className="col-span-2 col-start-4"
                  {...register("routine.yearlyMonthValue", {
                    valueAsNumber: true,
                  })}>
                  {months.map((month) => (
                    <option key={month.number} value={month.number}>
                      {month.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-6 items-center gap-2">
                <label>Day</label>
                <select
                  className="col-span-2 col-start-5"
                  {...register("routine.yearlyDayValue", {
                    valueAsNumber: true,
                  })}>
                  {Array.from(
                    Array(
                      getDaysInMonth(
                        new Date(2023, (yearlyMonthValueWatch ?? 1) - 1)
                      )
                    ).keys()
                  ).map((dayCounter) => (
                    <option key={dayCounter + 1} value={dayCounter + 1}>
                      {dayCounter + 1}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="form-card rounded-lg bg-slate-300 p-2 text-slate-700">
        <div className="form-card-title flex items-center gap-2 py-2 text-2xl">
          <BsClock />
          <span className="uppercase">WHEN</span>
        </div>
        <div ref={whenAnimation} className="form-card-field-set space-y-1 px-2">
          <div className="grid grid-cols-5 items-center gap-2">
            <label>Starts</label>
            <input
              type="date"
              className="col-span-2 col-start-4"
              {...register("routine.startDate")}
            />
          </div>
          <div className="grid grid-cols-6 items-center gap-2">
            <label>From</label>
            <input
              type="time"
              {...register("routine.fromTime")}
              className="col-span-2"
            />
            <label>To</label>
            <input
              type="time"
              {...register("routine.toTime")}
              className="col-span-2"
            />
          </div>
          {occurrenceTypeWatch !== "NEVER" && (
            <div className="grid grid-cols-5 items-center gap-2">
              <label>Ends</label>
              <div className="flex items-center gap-1">
                <input
                  type="checkbox"
                  id="neverEnds"
                  {...register("routine.neverEnds")}
                />
                <label htmlFor="neverEnds" className="font-mono text-sm">
                  Never
                </label>
              </div>
              <input
                type="date"
                className="col-span-2 col-start-4"
                {...register("routine.endDate")}
                disabled={neverEndsWatch}
              />
              {errors.routine?.endDate && (
                <span className="col-span-5 text-red-400">
                  {errors.routine.endDate.message}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      <div
        ref={specificLocationAnimation}
        className="form-card rounded-lg bg-slate-300 p-2 text-slate-700">
        <div
          onClick={() => setSpecificLocation((prev) => !prev)}
          className="form-card-title flex cursor-pointer items-center gap-2 py-2 text-2xl">
          <BsGeoAlt />
          <span className="uppercase">WHERE</span>
          <div className="ml-auto flex h-8 w-8 items-center justify-center rounded-full border border-slate-900">
            <BsChevronDown
              className={`transition-transform duration-300 ${
                specificLocation ? "rotate-180" : ""
              }`}
            />
          </div>
        </div>

        {specificLocation && (
          <div className="form-card-field-set space-y-1 px-2">
            <select>
              <option value="home">Home</option>
              <option value="work">Work</option>
            </select>
          </div>
        )}
      </div>

      {/* <div className="mt-4 flex justify-between p-4"> */}
      <div className="fixed bottom-0 left-0 right-0 z-50 flex h-16 border-t-4 border-t-white bg-slate-800">
        <Link
          href="/"
          className="flex w-full items-center justify-center text-2xl text-slate-300">
          Cancel
        </Link>
        <button
          type="submit"
          className="w-full items-center justify-center bg-slate-300 text-2xl font-bold text-slate-700">
          Save
        </button>
      </div>
    </form>
  );
};

export default NewRoutine;
