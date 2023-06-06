import { type DaySelector, type Routine } from "@prisma/client";
import { startOfDay } from "date-fns";
import { useRouter } from "next/router";
import { useForm, useWatch, type SubmitHandler } from "react-hook-form";
import { api } from "~/utils/api";

type NewRoutineRecord = {
  routine: Routine;
  daySelectorOptions: Partial<DaySelector>[];
};

const NewRoutine = () => {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    getValues,
  } = useForm<NewRoutineRecord>({
    defaultValues: {
      routine: {
        summary: "",
        details: "",
        occurrenceType: undefined,
      },
      daySelectorOptions: [
        { label: "Sunday", abbreviatedLabel: "Sun", selected: false },
        { label: "Monday", abbreviatedLabel: "Mon", selected: false },
        { label: "Tuesday", abbreviatedLabel: "Tue", selected: false },
        { label: "Wednesday", abbreviatedLabel: "Wed", selected: false },
        { label: "Thursday", abbreviatedLabel: "Thurs", selected: false },
        { label: "Friday", abbreviatedLabel: "Fri", selected: false },
        { label: "Saturday", abbreviatedLabel: "Sat", selected: false },
      ],
    },
  });

  const eventType = useWatch({ control, name: "routine.occurrenceType" });

  const utils = api.useContext();
  const createRoutine = api.routines.create.useMutation({
    onSuccess: async () => {
      await utils.routines.invalidate();
      void router.push("/");
    },
  });

  const onSubmit: SubmitHandler<NewRoutineRecord> = (formData) => {
    // clean up artifacts, if a user first clicks one event type and made some selections those selections remain
    switch (formData.routine.occurrenceType) {
      case "DAY_OF_WEEK":
        formData.routine.dayOfMonth = null;
        break;
      case "DAY_OF_MONTH":
        formData.daySelectorOptions?.forEach((day) => (day.selected = false));
        break;
      case "SPECIFIC_DAY":
        formData.daySelectorOptions?.forEach((day) => (day.selected = false));
        formData.routine.dayOfMonth = null;
        break;
    }

    createRoutine.mutate({
      summary: formData.routine.summary,
      details: formData.routine.details,
      occurrenceType: formData.routine.occurrenceType,
      startDateTime: startOfDay(formData.routine.startDateTime),
      endDateTime: formData.routine.endDateTime
        ? startOfDay(formData.routine.endDateTime)
        : undefined,
      dayOfMonth: formData.routine.dayOfMonth ?? undefined,
      daysOfWeek:
        formData.routine.occurrenceType === "DAY_OF_WEEK"
          ? formData.daySelectorOptions.map((daySelector) => {
              return {
                label: daySelector.label as string,
                selected: daySelector.selected as boolean,
              };
            })
          : undefined,
    });
  };

  return (
    <div id="new-routine" className="px-4">
      <h3>New Routine</h3>
      <p className="my-4">
        Routines help form habits, and more importantly, they&apos;re what
        create your timeline... Lorem ipsum dolor sit amet consectetur
        adipisicing elit. Tempora deleniti, sequi rerum quidem debitis eaque.
        Optio nesciunt iusto iure ut doloribus veritatis quidem itaque nemo
        rerum sed illo dolores, aut adipisci consectetur eligendi placeat
        voluptatem architecto quo dolor deleniti?
      </p>
      <form
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-4"
        noValidate>
        <div className="flex flex-col">
          <label className="text-2xl">Summary</label>
          <input
            type="text"
            {...register("routine.summary", {
              required: "Field is required",
              minLength: {
                value: 2,
                message: "Field must be between 2 and 50 characrers",
              },
              maxLength: {
                value: 50,
                message: "Field must be between 2 and 50 characrers",
              },
            })}
            autoFocus
          />
          {errors.routine?.summary && (
            <span className="text-red-400">
              {errors.routine.summary.message}
            </span>
          )}
        </div>

        <div className="flex flex-col">
          <label className="text-2xl">Details</label>
          <textarea
            {...register("routine.details", {
              required: "Field is required",
              minLength: {
                value: 5,
                message: "Field must be between 5 and 500 characrers",
              },
              maxLength: {
                value: 500,
                message: "Field must be between 5 and 500 characrers",
              },
            })}
          />
          {errors.routine?.details && (
            <span className="text-red-400">
              {errors.routine.details.message}
            </span>
          )}
        </div>

        <div className="flex flex-col">
          <label className="text-2xl">Occurrence type</label>
          <select
            {...register("routine.occurrenceType", {
              required: "Field is required",
            })}>
            <option value="">Make selection</option>
            <option value="DAY_OF_WEEK">Occurs weekly by day(s)</option>
            <option value="DAY_OF_MONTH">Occurs monthly by day</option>
            <option value="SPECIFIC_DAY">
              Once, on specific day/date range
            </option>
          </select>
          {errors.routine?.occurrenceType && (
            <span className="text-red-400">
              {errors.routine.occurrenceType.message}
            </span>
          )}
        </div>

        {/* TODO: minor bug occurs sometimes where the validation isn't retriggered on selection. It happens some of the time which leads me to believe it is a bug in react-hook-from 
        To recreate the bug submit the form and then select one of the items and see that validation isn't retriggered until the form is submitted again. But, if you toggle individual items after that the validation occurs as it should*/}
        {eventType === "DAY_OF_WEEK" && (
          <div className="flex flex-col items-center">
            <div className="flex gap-2">
              {getValues("daySelectorOptions")?.map((day, index) => (
                <div key={day.label}>
                  <input
                    type="checkbox"
                    className="peer hidden"
                    id={`daysOfWeek.${index}.selected`}
                    {...register(`daySelectorOptions.${index}.selected`, {
                      validate: {
                        isAtLeastOneDaySelected: () => {
                          return (
                            eventType === "DAY_OF_WEEK" &&
                            getValues("daySelectorOptions")?.some(
                              (day) => day.selected
                            )
                          );
                        },
                      },
                    })}
                  />
                  <label
                    htmlFor={`daysOfWeek.${index}.selected`}
                    className="flex h-12 w-12 cursor-pointer select-none items-center justify-center rounded-full bg-white text-black peer-checked:bg-black peer-checked:text-white">
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
            {errors.daySelectorOptions && (
              <span className="text-red-400">
                Please select at least one day
              </span>
            )}
          </div>
        )}

        {eventType == "DAY_OF_MONTH" && (
          <div className="flex flex-col">
            <select
              {...register("routine.dayOfMonth", {
                required: "Field is required",
              })}>
              <option value="">Make a selection</option>
              <option value="FIRST">First day of month</option>
              <option value="MIDDLE">Middle of month</option>
              <option value="LAST">Last day of month</option>
            </select>
            {errors.routine?.dayOfMonth && (
              <span className="text-red-400">Field is required</span>
            )}
          </div>
        )}

        <div className="flex justify-center gap-4">
          <div className="flex w-1/2 flex-col">
            <label className="text-2xl">Starting</label>
            <input
              type="date"
              {...register("routine.startDateTime", {
                required: "Field is required",
                valueAsDate: true,
              })}
            />
            {errors.routine?.startDateTime && (
              <span className="text-red-400">
                {errors.routine.startDateTime.message}
              </span>
            )}
          </div>

          <div className="flex w-1/2 flex-col">
            <label className="text-2xl">
              Ending <span className="font-thin">(optional)</span>
            </label>
            <input
              type="date"
              {...register("routine.endDateTime", { valueAsDate: true })}
            />
            {errors.routine?.endDateTime && (
              <span className="text-red-400">
                {errors.routine.endDateTime.message}
              </span>
            )}
          </div>
        </div>

        <div className="my-2 flex gap-4">
          <button
            type="submit"
            className="flex items-center gap-1 rounded bg-slate-400 px-4 py-2 text-2xl text-white">
            Save
          </button>
          <button
            onClick={() => void router.push("/")}
            className="flex items-center gap-1 rounded border-2 border-slate-300 px-4 py-2 text-xl text-slate-300">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default NewRoutine;
