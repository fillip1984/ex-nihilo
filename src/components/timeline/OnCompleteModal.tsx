import { zodResolver } from "@hookform/resolvers/zod";
import clsx from "clsx";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
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
import {
  topicFormSchema,
  type TimelineEvent,
  type TopicFormSchemaType,
} from "~/types";

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
    { label: "Cold", icon: <TiWeatherSnow /> },
    { label: "Rainy", icon: <TiWeatherDownpour /> },
    { label: "Fair", icon: <TiWeatherSunny /> },
    { label: "Hot", icon: <TiWeatherSunny /> },
  ];

  const moodOptions = [
    // { label: "The worst", icon: <FaRegFaceDizzy /> },
    { label: "Bad", icon: <FaRegFaceFrownOpen /> },
    { label: "Okay", icon: <FaRegFaceMeh /> },
    { label: "Good", icon: <FaRegFaceSmile /> },
    { label: "Great", icon: <FaRegFaceGrinStars /> },
  ];

  const [selectedWeather, setSelectedWeather] = useState("");
  const [selectedMood, setSelectedMood] = useState("");

  const { register, reset, handleSubmit, setValue } =
    useForm<TopicFormSchemaType>({
      resolver: zodResolver(topicFormSchema),
    });

  return (
    <>
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
      <div className="h-flex-1 overflow-hidden">
        <div className="flex h-full flex-col gap-4 overflow-y-scroll p-4 pb-24">
          <p>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Ipsam
            laboriosam voluptatibus nemo consequatur beatae consectetur, iste
            velit magnam molestias obcaecati voluptas? Tempore aspernatur
            voluptatibus dolores aliquid porro cupiditate modi sed magnam
            nesciunt dolor alias aliquam corporis sint deserunt laboriosam
            minima doloribus dignissimos impedit, in debitis iusto. Amet
            delectus, hic aut placeat alias commodi labore corrupti odio
            voluptatibus cum soluta nam maiores sunt reprehenderit officia
            cumque tempora iste nostrum eveniet dolor tempore aliquam voluptates
            consequatur? Itaque accusamus neque amet placeat. Pariatur
            recusandae veniam dolores ad, sunt illo possimus, mollitia qui non
            molestias modi porro ex. Voluptatum ex consequuntur quos repellendus
            expedita?
          </p>
          <div className="flex flex-col gap-3">
            <h4>Run Details</h4>
            <div>
              <label>Date</label>
              <input type="date" />
            </div>
            <div className="flex gap-4">
              <div className="flex-1">
                <label>Distance</label>
                <input type="text" placeholder="3.8 miles" />
              </div>
              <div className="flex-1">
                <label>Duration</label>
                <input type="text" placeholder="43:18" />
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-1">
                <label>Pace</label>
                <input type="text" placeholder="12:23 min/mi" />
              </div>
              <div className="flex-1">
                <label>Heart rate average</label>
                <input type="text" placeholder="160 bpm" />
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-1">
              <h4>Weather</h4>
              <span className="text-sm font-thin">(optional)</span>
            </div>
            <div className="my-2 flex flex-wrap justify-center gap-2">
              {weatherOptions.map((weather) => (
                <button
                  key={weather.label}
                  type="button"
                  onClick={() => {
                    if (selectedWeather === weather.label) {
                      setSelectedWeather("");
                    } else {
                      setSelectedWeather(weather.label);
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
            <div className="my-2 flex flex-wrap justify-center gap-2">
              {moodOptions.map((mood) => (
                <button
                  key={mood.label}
                  type="button"
                  onClick={() => {
                    if (selectedMood === mood.label) {
                      setSelectedMood("");
                    } else {
                      setSelectedMood(mood.label);
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
      <button className="w-full rounded-b-lg border bg-slate-400 p-4 text-2xl">
        Save and Complete
      </button>
    </>
  );
};
