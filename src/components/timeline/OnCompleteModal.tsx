import { zodResolver } from "@hookform/resolvers/zod";
import { MoodType, WeatherType } from "@prisma/client";
import clsx from "clsx";
import { format } from "date-fns";
import {
  useEffect,
  useState,
  type ChangeEvent,
  type Dispatch,
  type SetStateAction,
} from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { AiOutlineClose } from "react-icons/ai";
import {
  FaRegFaceFrownOpen,
  FaRegFaceGrinStars,
  FaRegFaceMeh,
  FaRegFaceSmile,
} from "react-icons/fa6";
import {
  TiWeatherDownpour,
  TiWeatherSnow,
  TiWeatherSunny,
} from "react-icons/ti";
import TextareaAutosize from "react-textarea-autosize";
import {
  bloodPressureReadingFormSchema,
  noteFormSchema,
  runningLog,
  weighInFormSchema,
  type BloodPressureReadingFormSchemaType,
  type NoteFormSchemaType,
  type RunningLogType,
  type TimelineEvent,
  type WeighInFormSchemaType,
} from "~/types";
import { api } from "~/utils/api";
import { yyyyMMddHyphenated } from "~/utils/date";
import Mutating from "../shared/Mutating";

const OnCompleteModal = ({
  event,
  close,
}: {
  event: TimelineEvent;
  close: () => void;
}) => {
  const [isClosing, setIsClosing] = useState(false);
  useEffect(() => {
    if (isClosing) {
      setTimeout(() => close(), 150);
    }
  }, [isClosing, close]);

  return (
    <div className="relative">
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[998] bg-black/30 opacity-80 backdrop-blur"
        aria-hidden="true"
        onClick={() => setIsClosing(true)}
      />

      {/* Modal */}
      {event && (
        <div
          className={clsx(
            "fixed inset-2 z-[999] mx-auto flex w-[90%] animate-grow flex-col rounded-lg border border-slate-100 bg-slate-800 md:w-3/4 lg:w-1/2",
            { "animate-shrink": isClosing }
          )}>
          {event.onComplete === "RUNNERS_LOG" && (
            <RunningLog event={event} close={() => setIsClosing(true)} />
          )}

          {event.onComplete === "WEIGH_IN" && (
            <WeighIn event={event} close={() => setIsClosing(true)} />
          )}

          {event.onComplete === "BLOOD_PRESSURE_READING" && (
            <BloodPressureReading
              event={event}
              close={() => setIsClosing(true)}
            />
          )}

          {event.onComplete === "NOTE" && (
            <TakeNotes event={event} close={() => setIsClosing(true)} />
          )}
        </div>
      )}
    </div>
  );
};

export default OnCompleteModal;

const RunningLog = ({
  event,
  close,
}: {
  event: TimelineEvent;
  close: () => void;
}) => {
  const weatherOptions = [
    { label: "Cold", value: WeatherType.Cold, icon: <TiWeatherSnow /> },
    { label: "Rainy", value: WeatherType.Rainy, icon: <TiWeatherDownpour /> },
    { label: "Fair", value: WeatherType.Fair, icon: <TiWeatherSunny /> },
    { label: "Hot", value: WeatherType.Hot, icon: <TiWeatherSunny /> },
  ];

  const moodOptions = [
    // { label: "The worst", icon: <FaRegFaceDizzy /> },
    { label: "Bad", value: MoodType.Bad, icon: <FaRegFaceFrownOpen /> },
    { label: "Okay", value: MoodType.Okay, icon: <FaRegFaceMeh /> },
    { label: "Good", value: MoodType.Good, icon: <FaRegFaceSmile /> },
    { label: "Great", value: MoodType.Great, icon: <FaRegFaceGrinStars /> },
  ];

  const [selectedWeather, setSelectedWeather] = useState<
    WeatherType | undefined
  >();
  const [selectedMood, setSelectedMood] = useState<MoodType | undefined>();

  const [duration, setDuration] = useState("");
  const [pace, setPace] = useState("");

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<RunningLogType>({
    resolver: zodResolver(runningLog),
    defaultValues: {
      date: format(new Date(), yyyyMMddHyphenated),
      activityId: event.id,
    },
  });

  const utils = api.useContext();
  const { mutate: createRun, isLoading: isCreatingRun } =
    api.runs.create.useMutation({
      onSuccess: async () => {
        await utils.runs.invalidate();
        completeAct({ id: event.id });
      },
    });

  const { mutate: completeAct, isLoading: isActivityCompleting } =
    api.activities.complete.useMutation({
      onSuccess: async () => {
        await utils.timeline.invalidate();
        await utils.activities.invalidate();
        close();
      },
    });

  const onSubmit: SubmitHandler<RunningLogType> = (formData) => {
    createRun(formData);
  };

  useEffect(() => {
    console.log("errors", errors);
  }, [errors]);

  useEffect(() => {
    setValue("duration", duration);
  }, [duration, setValue]);

  useEffect(() => {
    setValue("pace", pace);
  }, [pace, setValue]);

  useEffect(() => {
    setValue("weather", selectedWeather);
  }, [selectedWeather, setValue]);

  useEffect(() => {
    setValue("mood", selectedMood);
  }, [selectedMood, setValue]);

  const maskDurationField = (
    e: ChangeEvent<HTMLInputElement>,
    setField: Dispatch<SetStateAction<string>>,
    precision: number
  ) => {
    if (e.target.value.length === 0) {
      setField("");
      return;
    }
    const stringVal = e.target.value.replaceAll(":", ""); //remove mask
    const numericVal = parseInt(stringVal); //remove leading zeros
    const stringRepOfNumeric = numericVal.toString();
    let newVal = "";
    switch (stringRepOfNumeric.length) {
      case 1:
        newVal = "00:00:0" + stringRepOfNumeric;
        break;
      case 2:
        newVal = "00:00:" + stringRepOfNumeric;
        break;
      case 3:
        newVal =
          "00:0" +
          stringRepOfNumeric.substring(0, 1) +
          ":" +
          stringRepOfNumeric.substring(1);
        break;
      case 4:
        newVal =
          "00:" +
          stringRepOfNumeric.substring(0, 2) +
          ":" +
          stringRepOfNumeric.substring(2);
        break;
      case 5:
        if (precision === 4) {
          return;
        }
        newVal =
          "0" +
          stringRepOfNumeric.substring(0, 1) +
          ":" +
          stringRepOfNumeric.substring(1, 3) +
          ":" +
          stringRepOfNumeric.substring(3);

        break;
      case 6:
        if (precision === 4) {
          return;
        }
        newVal =
          stringRepOfNumeric.substring(0, 2) +
          ":" +
          stringRepOfNumeric.substring(2, 4) +
          ":" +
          stringRepOfNumeric.substring(4);

        break;
    }

    if (precision === 4) {
      setField(newVal.substring(3));
    } else {
      setField(newVal);
    }
  };

  return (
    <>
      {(isCreatingRun || isActivityCompleting) && <Mutating />}

      {!isCreatingRun && !isActivityCompleting && event && (
        <form
          className="flex h-full flex-col"
          // eslint-disable-next-line @typescript-eslint/no-misused-promises
          onSubmit={handleSubmit(onSubmit)}
          noValidate>
          {/* title or heading */}
          <div className="flex items-center justify-between p-2">
            <h3>Running Log</h3>
            <button
              type="button"
              onClick={close}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-400/30">
              <AiOutlineClose />
            </button>
          </div>

          {/* body */}
          <div className="flex-1 overflow-hidden">
            <div className="flex h-full flex-col gap-4 overflow-y-scroll p-4 pb-24">
              <div className="flex flex-col gap-3">
                <h4>Run Details</h4>

                <div>
                  <label>Date</label>
                  <input
                    type="date"
                    {...register("date", { valueAsDate: true })}
                  />
                  {errors.date && (
                    <span className="text-red-400">{errors.date.message}</span>
                  )}
                </div>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label>Distance</label>
                    <input
                      type="text"
                      inputMode="decimal"
                      placeholder="3.8 miles"
                      {...register("distance", { valueAsNumber: true })}
                    />
                    {errors.distance && (
                      <span className="text-red-400">
                        {errors.distance.message}
                      </span>
                    )}
                  </div>
                  <div className="flex-1">
                    <label>Duration</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="43:18"
                      onChange={(e) => maskDurationField(e, setDuration, 6)}
                      value={duration}
                    />
                    {errors.duration && (
                      <span className="text-red-400">
                        {errors.duration.message}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label>Pace</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="12:23 min/mi"
                      onChange={(e) => maskDurationField(e, setPace, 4)}
                      value={pace}
                    />
                    {errors.pace && (
                      <span className="text-red-400">
                        {errors.pace.message}
                      </span>
                    )}
                  </div>
                  <div className="flex-1">
                    <label>Heart rate average</label>
                    <input
                      type="number"
                      inputMode="numeric"
                      placeholder="160 bpm"
                      {...register("heartRateAverage")}
                    />
                    {errors.heartRateAverage && (
                      <span className="text-red-400">
                        {errors.heartRateAverage.message}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center gap-1">
                  <h4>Weather</h4>
                  <span className="text-sm font-thin">(optional)</span>
                </div>
                <div className="my-2 grid grid-flow-col justify-center gap-2">
                  {weatherOptions.map((weather) => (
                    <button
                      key={weather.label}
                      type="button"
                      onClick={() => {
                        if (selectedWeather === weather.label) {
                          setSelectedWeather(undefined);
                        } else {
                          setSelectedWeather(weather.value);
                        }
                      }}
                      className={clsx(
                        "flex h-16 w-20 flex-col items-center justify-center rounded-lg border border-slate-200 text-2xl transition-colors duration-200 ease-in-out",
                        {
                          "border-slate-600 bg-slate-100 text-slate-600":
                            selectedWeather === weather.label,
                        }
                      )}>
                      {weather.icon}
                      <span className="mt-1 text-xs">{weather.label}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <div className="flex items-center gap-1">
                  <h4>Mood</h4>
                  <span className="text-sm font-thin">(optional)</span>
                </div>
                <div className="my-2 grid grid-flow-col justify-center gap-2">
                  {moodOptions.map((mood) => (
                    <button
                      key={mood.label}
                      type="button"
                      onClick={() => {
                        if (selectedMood === mood.label) {
                          setSelectedMood(undefined);
                        } else {
                          setSelectedMood(mood.value);
                        }
                      }}
                      className={clsx(
                        "flex h-16 w-20 flex-col items-center justify-center rounded-lg border border-slate-200 text-2xl transition-colors duration-200 ease-in-out",
                        {
                          "border-slate-600 bg-slate-100 text-slate-600":
                            selectedMood === mood.label,
                        }
                      )}>
                      {mood.icon}
                      <span className="mt-1 text-xs">{mood.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* footer */}
          <button
            type="submit"
            className="w-full rounded-b-lg border bg-slate-400 p-4 text-2xl">
            Save and Complete
          </button>
        </form>
      )}
    </>
  );
};

const WeighIn = ({
  event,
  close,
}: {
  event: TimelineEvent;
  close: () => void;
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<WeighInFormSchemaType>({
    resolver: zodResolver(weighInFormSchema),
    defaultValues: {
      date: format(new Date(), yyyyMMddHyphenated),
      activityId: event.id,
    },
  });

  const utils = api.useContext();
  const { mutate: createWeighIn, isLoading: isCreatingWeighIn } =
    api.weighIns.create.useMutation({
      onSuccess: () => {
        void utils.weighIns.invalidate();
        completeAct({ id: event.id });
      },
    });

  const { mutate: completeAct, isLoading: isActivityCompleting } =
    api.activities.complete.useMutation({
      onSuccess: async () => {
        await utils.timeline.invalidate();
        await utils.activities.invalidate();
        close();
      },
    });

  const onSubmit: SubmitHandler<WeighInFormSchemaType> = (formData) => {
    createWeighIn(formData);
  };

  return (
    <>
      {(isCreatingWeighIn || isActivityCompleting) && <Mutating />}

      {!isCreatingWeighIn && !isActivityCompleting && event && (
        <form
          className="flex h-full flex-col"
          // eslint-disable-next-line @typescript-eslint/no-misused-promises
          onSubmit={handleSubmit(onSubmit)}
          noValidate>
          {/* title or heading */}
          <div className="flex items-center justify-between p-2">
            <h3>Weigh In</h3>
            <button
              type="button"
              onClick={close}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-400/30">
              <AiOutlineClose />
            </button>
          </div>

          {/* body */}
          <div className="flex-1 overflow-hidden">
            <div className="flex h-full flex-col gap-4 overflow-y-scroll p-4 pb-24">
              <div className="flex flex-col gap-3">
                <h4>Weigh In</h4>

                <div>
                  <label>Date</label>
                  <input
                    type="date"
                    {...register("date", { valueAsDate: true })}
                  />
                  {errors.date && (
                    <span className="text-red-400">{errors.date.message}</span>
                  )}
                </div>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label>Weight</label>
                    <input
                      type="number"
                      inputMode="decimal"
                      placeholder="192.3"
                      {...register("weight", { valueAsNumber: true })}
                    />
                    {errors.weight && (
                      <span className="text-red-400">
                        {errors.weight.message}
                      </span>
                    )}
                  </div>
                  <div className="flex-1">
                    <label>Body Fat % (optional)</label>
                    <input
                      type="number"
                      inputMode="decimal"
                      placeholder="17.3"
                      {...register("bodyFatPercentage")}
                    />
                    {errors.bodyFatPercentage && (
                      <span className="text-red-400">
                        {errors.bodyFatPercentage.message}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* footer */}
          <button
            type="submit"
            className="w-full rounded-b-lg border bg-slate-400 p-4 text-2xl">
            Save and Complete
          </button>
        </form>
      )}
    </>
  );
};

const BloodPressureReading = ({
  event,
  close,
}: {
  event: TimelineEvent;
  close: () => void;
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<BloodPressureReadingFormSchemaType>({
    resolver: zodResolver(bloodPressureReadingFormSchema),
    defaultValues: {
      date: format(new Date(), yyyyMMddHyphenated),
      activityId: event.id,
    },
  });

  const utils = api.useContext();
  const {
    mutate: createBloodPressureReading,
    isLoading: isCreatingBloodPressureReading,
  } = api.bloodPressureReadings.create.useMutation({
    onSuccess: () => {
      void utils.weighIns.invalidate();
      completeAct({ id: event.id });
    },
  });

  const { mutate: completeAct, isLoading: isActivityCompleting } =
    api.activities.complete.useMutation({
      onSuccess: async () => {
        await utils.timeline.invalidate();
        await utils.activities.invalidate();
        close();
      },
    });

  const onSubmit: SubmitHandler<BloodPressureReadingFormSchemaType> = (
    formData
  ) => {
    createBloodPressureReading(formData);
  };

  useEffect(() => {
    console.log("errors", errors);
  }, [errors]);

  return (
    <>
      {(isCreatingBloodPressureReading || isActivityCompleting) && <Mutating />}

      {!isCreatingBloodPressureReading && !isActivityCompleting && event && (
        <form
          className="flex h-full flex-col"
          // eslint-disable-next-line @typescript-eslint/no-misused-promises
          onSubmit={handleSubmit(onSubmit)}
          noValidate>
          {/* title or heading */}
          <div className="flex items-center justify-between p-2">
            <h3>Blood Pressure Reading</h3>
            <button
              type="button"
              onClick={close}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-400/30">
              <AiOutlineClose />
            </button>
          </div>

          {/* body */}
          <div className="flex-1 overflow-hidden">
            <div className="flex h-full flex-col gap-4 overflow-y-scroll p-4 pb-24">
              <div className="flex flex-col gap-3">
                <h4>Blood Pressure Reading</h4>

                <div>
                  <label>Date</label>
                  <input
                    type="date"
                    {...register("date", { valueAsDate: true })}
                  />
                  {errors.date && (
                    <span className="text-red-400">{errors.date.message}</span>
                  )}
                </div>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label>Systolic</label>
                    <input
                      type="number"
                      inputMode="decimal"
                      placeholder="170"
                      {...register("systolic", { valueAsNumber: true })}
                    />
                    {errors.systolic && (
                      <span className="text-red-400">
                        {errors.systolic.message}
                      </span>
                    )}
                  </div>
                  <div className="flex-1">
                    <label>Diastolic</label>
                    <input
                      type="number"
                      inputMode="decimal"
                      placeholder="80"
                      {...register("diastolic", { valueAsNumber: true })}
                    />
                    {errors.diastolic && (
                      <span className="text-red-400">
                        {errors.diastolic.message}
                      </span>
                    )}
                  </div>
                </div>
                <div className="w-1/3">
                  <label>Pulse (optional)</label>
                  <input
                    type="number"
                    inputMode="numeric"
                    placeholder="80"
                    {...register("pulse")}
                  />
                  {errors.pulse && (
                    <span className="text-red-400">{errors.pulse.message}</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* footer */}
          <button
            type="submit"
            className="w-full rounded-b-lg border bg-slate-400 p-4 text-2xl">
            Save and Complete
          </button>
        </form>
      )}
    </>
  );
};

const TakeNotes = ({
  event,
  close,
}: {
  event: TimelineEvent;
  close: () => void;
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<NoteFormSchemaType>({
    resolver: zodResolver(noteFormSchema),
    defaultValues: {
      date: format(new Date(), yyyyMMddHyphenated),
      activityId: event.id,
    },
  });

  const utils = api.useContext();
  const { mutate: createNote, isLoading: isCreatingNote } =
    api.notes.create.useMutation({
      onSuccess: () => {
        void utils.weighIns.invalidate();
        completeAct({ id: event.id });
      },
    });

  const { mutate: completeAct, isLoading: isActivityCompleting } =
    api.activities.complete.useMutation({
      onSuccess: async () => {
        await utils.timeline.invalidate();
        await utils.activities.invalidate();
        close();
      },
    });

  const onSubmit: SubmitHandler<NoteFormSchemaType> = (formData) => {
    createNote(formData);
  };

  useEffect(() => {
    console.log("errors", errors);
  }, [errors]);

  return (
    <>
      {(isCreatingNote || isActivityCompleting) && <Mutating />}

      {!isCreatingNote && !isActivityCompleting && event && (
        <form
          className="flex h-full flex-col"
          // eslint-disable-next-line @typescript-eslint/no-misused-promises
          onSubmit={handleSubmit(onSubmit)}
          noValidate>
          {/* title or heading */}
          <div className="flex items-center justify-between p-2">
            <h3>Note</h3>
            <button
              type="button"
              onClick={close}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-400/30">
              <AiOutlineClose />
            </button>
          </div>

          {/* body */}
          <div className="flex-1 overflow-hidden">
            <div className="flex h-full flex-col gap-4 overflow-y-scroll p-4 pb-24">
              <div className="flex flex-col gap-3">
                <h4>Note</h4>

                <div>
                  <label>Date</label>
                  <input
                    type="date"
                    {...register("date", { valueAsDate: true })}
                  />
                  {errors.date && (
                    <span className="text-red-400">{errors.date.message}</span>
                  )}
                </div>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label>Note</label>
                    <TextareaAutosize minRows={2} {...register("content")} />
                    {errors.content && (
                      <span className="text-red-400">
                        {errors.content.message}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* footer */}
          <button
            type="submit"
            className="w-full rounded-b-lg border bg-slate-400 p-4 text-2xl">
            Save and Complete
          </button>
        </form>
      )}
    </>
  );
};
