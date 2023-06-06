import autoAnimate from "@formkit/auto-animate";
import {
  addMinutes,
  format,
  intervalToDuration,
  parseISO,
  type Duration,
} from "date-fns";
import { useEffect, useRef, useState } from "react";
import { BsSunrise, BsSunset } from "react-icons/bs";
import { FaBed, FaRunning } from "react-icons/fa";
import { MdOutlineCleaningServices } from "react-icons/md";

const Timeline = () => {
  const parent = useRef(null);
  useEffect(() => {
    parent.current && autoAnimate(parent.current);
  }, [parent]);

  const [events, setEvents] = useState([
    {
      id: "1",
      topic: "Routine",
      icon: <FaBed />,
      description: "Wake up",
      color: "bg-orange-300/60 text-orange-200",
      start: new Date(),
      end: addMinutes(new Date(), 30),
      complete: false,
    },
    {
      id: "2",
      topic: "Health & Fitness",
      icon: <FaRunning />,
      description: "Go for a run",
      color: "bg-green-300/60 text-green-200",
      start: new Date(),
      end: addMinutes(new Date(), 30),
      complete: false,
    },
    {
      id: "3",
      topic: "Home chore",
      icon: <MdOutlineCleaningServices />,
      description: "Unload dishwasher",
      color: "bg-red-400/60 text-red-300",
      start: new Date(),
      end: addMinutes(new Date(), 30),
      complete: false,
    },
  ]);

  const handleComplete = (id: string) => {
    setEvents(
      events.map((event) =>
        event.id === id ? { ...event, complete: !event.complete } : event
      )
    );
    setEvents(events.filter((event) => event.id !== id));
  };

  return (
    <div className="mx-auto my-4 flex w-full select-none flex-col overflow-hidden px-4 md:w-2/3 lg:w-1/3">
      <h4 className="mb-4 flex flex-col text-center">
        <span className="text-gray-200/30">Timeline for</span>
        {format(new Date(), "MM-dd-yyyy")}
      </h4>
      <div
        id="timeline-grid"
        className="flex w-full flex-col gap-3"
        ref={parent}>
        <SunInfoCard mode="sunrise" />
        {events.map((event) => (
          <div
            key={event.id}
            onClick={() => handleComplete(event.id)}
            className="flex w-full items-center gap-3 rounded-lg bg-white/10 p-2 transition duration-300 ease-in-out hover:bg-white/20">
            <span
              className={`flex h-12 w-12 items-center justify-center rounded-full text-2xl ${event.color}`}>
              {event.icon}
            </span>
            <div className="flex flex-col">
              <b>{event.description}</b>
              <span className="text-sm text-gray-300">
                {format(event.start, "HH:mm")} - {format(event.end, "HH:mm")}
              </span>
              <p className="text-xs text-gray-300">{event.topic}</p>
            </div>
          </div>
        ))}
        <SunInfoCard mode="sunset" />
      </div>
    </div>
  );
};

const SunInfoCard = ({ mode }: { mode: string }) => {
  type SunriseSunsetRaw = {
    results: {
      sunrise: string;
      sunset: string;
      solar_noon: string;
      day_length: number;
      civil_twilight_begin: string;
      civil_twilight_end: string;
      nautical_twilight_begin: string;
      nautical_twilight_end: string;
      astronomical_twilight_begin: string;
      astronomical_twilight_end: string;
    };
    status: string;
  };
  type SunriseSunset = {
    sunrise: Date;
    sunset: Date;
    dayLength: Duration;
  };

  const fetchSunLightApi = async () => {
    // provided by: https://sunrise-sunset.org/api
    // changing formatted to 1 changes response values!
    const lat = 38.18519;
    const long = -85.55975;
    const date = format(new Date(), "yyyy-MM-dd");
    const formatted = 0;

    const sunLightResponse = await fetch(
      `https://api.sunrise-sunset.org/json?lat=${lat}&lng=${long}&date=${date}&formatted=${formatted}`
    );

    if (!sunLightResponse.ok) {
      console.warn(
        "Error occurred while fetching sunrise/sunset info, info is nice to have so not throwing an error"
      );
      return null;
    }

    const sunriseSunSetRaw =
      (await sunLightResponse.json()) as SunriseSunsetRaw;

    // const sunrise = parse(
    //   sunriseSunSetRaw.results.sunrise,
    //   "h:mm:ss bb",
    //   new Date()
    // );
    // console.log(subHours(sunrise, 4));

    const sunrise = parseISO(sunriseSunSetRaw.results.sunrise);
    const sunset = parseISO(sunriseSunSetRaw.results.sunset);
    // See: https://stackoverflow.com/questions/48776140/format-a-duration-from-seconds-using-date-fns
    const dayLength = intervalToDuration({
      start: 0,
      end: sunriseSunSetRaw.results.day_length * 1000,
    });

    const sunriseSunset: SunriseSunset = {
      sunrise,
      sunset,
      dayLength,
    };

    return sunriseSunset;
  };

  const [sunriseInfo, setSunriseInfo] = useState<SunriseSunset | null>(null);

  useEffect(() => {
    async function initSunriseInfo() {
      setSunriseInfo(await fetchSunLightApi());
    }

    void initSunriseInfo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      {mode === "sunrise" && sunriseInfo && (
        <div className="flex w-full items-center gap-3 rounded-lg bg-white/10 p-2 transition duration-300 ease-in-out hover:bg-white/20">
          <span
            className={`flex h-12 w-12 items-center justify-center rounded-full bg-yellow-300/60 text-2xl text-yellow-200`}>
            <BsSunrise />
          </span>
          <div className="flex flex-col">
            <div className="font-bold">Sunrise</div>
            <div className="text-sm text-gray-300">
              {format(sunriseInfo?.sunrise, "HH:mm")}
            </div>
          </div>
          <div className="flex flex-1 justify-end p-4">
            Sunset at {format(sunriseInfo.sunset, "HH:mm")}, length of day:{" "}
            {sunriseInfo.dayLength.hours} h {sunriseInfo.dayLength.minutes} min
          </div>
        </div>
      )}

      {mode === "sunset" && sunriseInfo && (
        <div className="flex w-full items-center gap-3 rounded-lg bg-white/10 p-2 transition duration-300 ease-in-out hover:bg-white/20">
          <span
            className={`flex h-12 w-12 items-center justify-center rounded-full bg-yellow-300/60 text-2xl text-yellow-200`}>
            <BsSunset />
          </span>
          <div className="flex flex-col">
            <div className="font-bold">Sunset</div>
            <div className="text-sm text-gray-300">
              {format(sunriseInfo?.sunset, "HH:mm")}
            </div>
          </div>
          <div className="flex flex-1 justify-end p-4">
            Length of day: {sunriseInfo.dayLength.hours} h{" "}
            {sunriseInfo.dayLength.minutes} min
          </div>
        </div>
      )}
    </>
  );
};

export default Timeline;
