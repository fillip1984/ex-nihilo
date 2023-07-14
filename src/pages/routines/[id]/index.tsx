import { useAutoAnimate } from "@formkit/auto-animate/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { format, getDaysInMonth, parse } from "date-fns";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useForm, useWatch, type SubmitHandler } from "react-hook-form";
import {
  BsArchive,
  BsBodyText,
  BsChevronDown,
  BsClock,
  BsGeoAlt,
  BsRepeat,
  BsThreeDotsVertical,
} from "react-icons/bs";
import { FaTrashAlt } from "react-icons/fa";
import TextareaAutosize from "react-textarea-autosize";
import { routineFormSchema, type RoutineFormSchemaType } from "~/types";

import { api } from "~/utils/api";
import { HH_mm_aka24hr, months, yyyyMMddHyphenated } from "~/utils/date";

const RoutineDetails = () => {
  const router = useRouter();
  const { id } = router.query;
  const isNew = id === "new";

  const [occurrenceAnimation] = useAutoAnimate();
  const [whenAnimation] = useAutoAnimate();
  const [specificLocationAnimation] = useAutoAnimate();
  const [specificLocation, setSpecificLocation] = useState(false);

  const { data: topics } = api.topics.readAll.useQuery(undefined, {
    refetchOnWindowFocus: false,
  });

  const { data: freshRoutine } = api.routines.readOne.useQuery(
    { id: id as string },
    { enabled: !!id && !isNew, refetchOnWindowFocus: false }
  );

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

  // reset form with retrieved values if we are editing, setup fields otherwise for creation
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

    if (isNew) {
      const routineDetails = {
        weeklyDaySelectorOptions: weeklyDaySelectorOptions,
        monthlyDaySelectorOptions: monthlyDaySelectorOptions,
      };
      reset(routineDetails);
    } else if (!isNew && freshRoutine) {
      const routineDetails = {
        routine: {
          id: freshRoutine.id,
          name: freshRoutine.name,
          description: freshRoutine.description,
          topicId: freshRoutine.topicId,
          occurrenceType: freshRoutine.occurrenceType,
          dailyEveryValue: freshRoutine.dailyEveryValue,
          yearlyMonthValue: freshRoutine.yearlyMonthValue,
          yearlyDayValue: freshRoutine.yearlyDayValue,
          startDate: format(freshRoutine.startDate, yyyyMMddHyphenated),
          fromTime: format(freshRoutine.fromTime, HH_mm_aka24hr),
          toTime: format(freshRoutine.toTime, HH_mm_aka24hr),
          neverEnds: freshRoutine.neverEnds,
          endDate: freshRoutine.endDate
            ? format(freshRoutine.endDate, yyyyMMddHyphenated)
            : undefined,
        },
        weeklyDaySelectorOptions,
        monthlyDaySelectorOptions,
      };

      if (freshRoutine.weeklyDaysSelected.length > 0) {
        routineDetails.weeklyDaySelectorOptions =
          freshRoutine.weeklyDaysSelected.map((selector) => {
            const selection = {
              label: selector.label,
              abbreviatedLabel: selector.abbreviatedLabel,
              selected: selector.selected,
            };
            return selection;
          });
      }

      if (freshRoutine.monthlyDaysSelected.length > 0) {
        routineDetails.monthlyDaySelectorOptions =
          freshRoutine.monthlyDaysSelected.map((selector) => {
            const selection = {
              label: parseInt(selector.label),
              abbreviatedLabel: parseInt(selector.abbreviatedLabel),
              selected: selector.selected,
            };
            return selection;
          });
      }

      reset(routineDetails);
    }
  }, [freshRoutine, reset, id, isNew]);

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
  const { mutate: createRoutine } = api.routines.create.useMutation({
    onSuccess: async () => {
      await utils.routines.invalidate();
      void router.push("/routines");
    },
  });

  const { mutate: updateRoutine } = api.routines.update.useMutation({
    onSuccess: async () => {
      await utils.routines.invalidate();
      void router.push("/routines");
    },
  });

  const { mutate: deleteRoutine } = api.routines.delete.useMutation({
    onSuccess: async () => {
      await utils.routines.invalidate();
      void router.push("/routines");
    },
  });

  const onSubmit: SubmitHandler<RoutineFormSchemaType> = (formData) => {
    if (isNew) {
      createRoutine({ ...formData });
    } else {
      updateRoutine({ ...formData });
    }
  };

  const [routineMenuOpen, setRoutineMenuOpen] = useState(false);
  const routineMenuItems = [
    {
      label: "Delete",
      icon: <FaTrashAlt />,
      action: () => deleteRoutine({ id: id as string }),
    },
    {
      label: "Archive",
      icon: <BsArchive />,
      action: () => {
        console.log("archive coming soon");
        setRoutineMenuOpen(false);
      },
    },
  ];

  return (
    <div className="form-container mx-auto w-full px-4 md:w-2/3 lg:w-1/2 xl:w-1/3">
      <form
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-2 pt-8">
        <div className="form-card rounded-lg bg-slate-300 p-2 text-slate-700">
          <div className="relative flex items-center justify-between">
            <div className="form-card-title flex items-center gap-2 py-2 text-2xl">
              <BsBodyText />
              <span className="uppercase">Routine</span>
            </div>
            {!isNew && (
              <button
                type="button"
                onClick={() => setRoutineMenuOpen(true)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-400/50">
                <BsThreeDotsVertical />
              </button>
            )}
            <div
              id="avatar-menu"
              className={`bg- absolute right-0 top-12 z-[999] w-36 rounded bg-white/70 backdrop-blur transition duration-300 ease-in-out ${
                routineMenuOpen ? "" : "hidden"
              }`}>
              <div className="flex flex-col p-2">
                {routineMenuItems.map((menuItem) => (
                  <button
                    type="button"
                    key={menuItem.label}
                    onClick={menuItem.action}
                    className="flex items-center gap-2 rounded p-2 text-slate-600 hover:bg-slate-400 hover:text-white">
                    {menuItem.icon}
                    {menuItem.label}
                  </button>
                ))}
              </div>
            </div>
            <div
              id="routineMenu-backdrop"
              onClick={() => setRoutineMenuOpen(false)}
              className={`fixed bottom-0 left-0 right-0 top-0 z-[998] ${
                routineMenuOpen ? "" : "hidden"
              }`}
            />
          </div>
        </div>
        <div className="form-card rounded-lg bg-slate-300 p-2 text-slate-700">
          <div className="form-card-title flex items-center gap-2 py-2 text-2xl">
            <BsBodyText />
            <span className="uppercase">INFO</span>
          </div>
          <div className="form-card-field-set space-y-1 px-2">
            <input
              type="text"
              placeholder="Name"
              {...register("routine.name")}
            />
            <TextareaAutosize
              placeholder="Description"
              {...register("routine.description")}
            />
          </div>
          <div className="grid grid-cols-5 items-center gap-2 px-2">
            <label>Topic</label>
            <select
              className="col-span-2 col-start-4"
              {...register("routine.topicId")}>
              <option value=""></option>
              {topics?.map((topic) => (
                <option key={topic.id} value={topic.id}>
                  {topic.name}
                </option>
              ))}
            </select>
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
                        {day.abbreviatedLabel}{" "}
                        {day.abbreviatedLabel > 28 && "*"}
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
          <div
            ref={whenAnimation}
            className="form-card-field-set space-y-1 px-2">
            <div className="grid grid-cols-5 items-center gap-2">
              <label>Starts</label>
              <input
                type="date"
                className="col-span-2 col-start-4"
                {...register("routine.startDate", {
                  setValueAs: (v) => {
                    if (!v) return undefined;
                    return parse(v as string, yyyyMMddHyphenated, new Date());
                  },
                })}
              />
            </div>
            <div className="grid grid-cols-6 items-center gap-2">
              <label>From</label>
              <input
                type="time"
                {...register("routine.fromTime", {
                  setValueAs: (v) => {
                    if (!v) return undefined;
                    return parse(v as string, "HH:mm", new Date());
                  },
                })}
                className="col-span-2"
              />
              <label>To</label>
              <input
                type="time"
                {...register("routine.toTime", {
                  setValueAs: (v) => {
                    if (!v) return undefined;
                    return parse(v as string, "HH:mm", new Date());
                  },
                })}
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
                  {...register("routine.endDate", {
                    setValueAs: (v) => {
                      if (!v) return undefined;
                      return parse(v as string, yyyyMMddHyphenated, new Date());
                    },
                  })}
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
            href="/routines"
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
    </div>
  );
};

export default RoutineDetails;
