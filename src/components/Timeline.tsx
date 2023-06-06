import {
  addMinutes,
  format,
  intervalToDuration,
  parseISO,
  type Duration,
} from "date-fns";
import { useEffect } from "react";
import { BsSunrise } from "react-icons/bs";
import { FaBed, FaRunning } from "react-icons/fa";
import { MdOutlineCleaningServices } from "react-icons/md";

const Timeline = () => {
  const events = [
    {
      topic: "Time based event",
      icon: <BsSunrise />,
      description: "Sunrise",
      color: "bg-yellow-300/60 text-yellow-200",
      start: new Date(),
      end: addMinutes(new Date(), 30),
    },
    {
      topic: "Routine",
      icon: <FaBed />,
      description: "Wake up",
      color: "bg-orange-300/60 text-orange-200",
      start: new Date(),
      end: addMinutes(new Date(), 30),
    },
    {
      topic: "Health & Fitness",
      icon: <FaRunning />,
      description: "Go for a run",
      color: "bg-green-300/60 text-green-200",
      start: new Date(),
      end: addMinutes(new Date(), 30),
    },
    {
      topic: "Home chore",
      icon: <MdOutlineCleaningServices />,
      description: "Unload dishwasher",
      color: "bg-red-400/60 text-red-300",
      start: new Date(),
      end: addMinutes(new Date(), 30),
    },
  ];
  return (
    <div className="mx-auto my-4 flex w-full flex-col px-4 md:w-2/3 lg:w-1/3">
      <h4 className="mb-4 flex flex-col text-center">
        <span className="text-gray-200/30">Timeline for</span>
        {format(new Date(), "MM-dd-yyyy")}
      </h4>
      <div id="timeline-grid" className="flex w-full flex-col gap-3">
        {events.map((event) => (
          <div
            key={event.description}
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
      </div>
    </div>
  );
};

const sunInfo = () => {
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

  const sunLightApi = async () => {
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

    const sunriseSunSet: SunriseSunset = {
      sunrise,
      sunset,
      dayLength,
    };

    return sunriseSunSet;
  };

  const sunInfoForToday = sunLightApi();

  // return (
  // <span>{sunInfoForToday.s</span>
  // )
};

export default Timeline;
