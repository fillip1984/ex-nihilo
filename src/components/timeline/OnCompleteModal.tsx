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
import { runningLog, type RunningLogType, type TimelineEvent } from "~/types";
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
    console.log(formData);
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
    setField: Dispatch<SetStateAction<string>>
  ) => {
    if (e.target.value.length === 0) {
      setField("");
      return;
    }
    const stringVal = e.target.value.replaceAll(":", ""); //remove mask
    const numericVal = parseInt(stringVal); //remove leading zeros
    const stringRepOfNumeric = numericVal.toString();
    switch (stringRepOfNumeric.length) {
      case 1:
        setField("00:00:0" + stringRepOfNumeric);
        return;
      case 2:
        setField("00:00:" + stringRepOfNumeric);
        return;
      case 3:
        setField(
          "00:0" +
            stringRepOfNumeric.substring(0, 1) +
            ":" +
            stringRepOfNumeric.substring(1)
        );
        return;
      case 4:
        setField(
          "00:" +
            stringRepOfNumeric.substring(0, 2) +
            ":" +
            stringRepOfNumeric.substring(2)
        );
        return;
      case 5:
        setField(
          "0" +
            stringRepOfNumeric.substring(0, 1) +
            ":" +
            stringRepOfNumeric.substring(1, 3) +
            ":" +
            stringRepOfNumeric.substring(3)
        );
        return;
      case 6:
        setField(
          stringRepOfNumeric.substring(0, 2) +
            ":" +
            stringRepOfNumeric.substring(2, 4) +
            ":" +
            stringRepOfNumeric.substring(4)
        );
        return;
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
                      onChange={(e) => maskDurationField(e, setDuration)}
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
                      onChange={(e) => maskDurationField(e, setPace)}
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
