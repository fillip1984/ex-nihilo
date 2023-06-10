import { format, isEqual } from "date-fns";
import Link from "next/link";
import { BiCategory } from "react-icons/bi";
import { BsBodyText, BsSunrise, BsSunset } from "react-icons/bs";
import { FaBed, FaRegClock, FaRunning } from "react-icons/fa";
import { GiPerspectiveDiceSixFacesRandom } from "react-icons/gi";
import {
  MdCheck,
  MdNotInterested,
  MdOutlineCleaningServices,
} from "react-icons/md";
import { type TimelineEvent } from "~/types";

const TimelineEventCard = ({
  event,
  handleComplete,
  handleSkip,
}: {
  event: TimelineEvent;
  handleComplete: (id: string) => void;
  handleSkip: (id: string) => void;
}) => {
  const selectIcon = (iconName: string) => {
    switch (iconName) {
      case "FaBed":
        return <FaBed />;
      case "FaRunning":
        return <FaRunning />;
      case "BsSunrise":
        return <BsSunrise />;
      case "BsSunset":
        return <BsSunset />;
      case "MdOutlineCleaningServices":
        return <MdOutlineCleaningServices />;
      default:
        return <GiPerspectiveDiceSixFacesRandom />;
    }
  };

  return (
    <div className="flex flex-col">
      <div className="flex items-center gap-3 rounded-t-lg bg-white/10 p-2 transition duration-300 ease-in-out hover:bg-white/20">
        <span
          className={`flex h-12 w-12 items-center justify-center rounded-full text-2xl ${event.color}`}>
          {selectIcon(event.icon)}
        </span>
        <div className="flex flex-col">
          <b>{event.name}</b>
          <p className="flex items-center gap-2 text-sm text-gray-200">
            <FaRegClock />
            {format(event.fromTime, "HH:mm")}
            {event.toTime && !isEqual(event.fromTime, event.toTime)
              ? " - " + format(event.toTime, "HH:mm")
              : ""}
          </p>
          <p className="flex items-center gap-2 text-sm text-gray-400">
            <BsBodyText />
            {event.description}
          </p>
          <p className="flex items-center gap-2 text-xs text-gray-400">
            <BiCategory />
            {event.name}
          </p>
          {/* <p>{event.startDate.toLocaleString()}</p>
          <p>{event.start.toLocaleString()}</p> */}
        </div>
      </div>
      {event.complete !== null && event.skip !== null && (
        <div className="flex  text-3xl">
          <button
            type="button"
            onClick={() => handleComplete(event.id)}
            className={`flex flex-1 justify-center rounded-bl-lg bg-green-400 p-2 transition-colors duration-300 ${
              event.skip ? "hidden" : ""
            } `}
            disabled={event.complete || event.skip}>
            <MdCheck />
          </button>
          <button
            type="button"
            onClick={() => handleSkip(event.id)}
            className={`flex flex-1 justify-center rounded-br-lg bg-red-400 p-2 transition-colors duration-300 ${
              event.complete ? "hidden" : ""
            }`}
            disabled={event.complete || event.skip}>
            <MdNotInterested />
          </button>
        </div>
      )}

      {event.type === "Suninfo" && event.lengthOfDate && (
        <div className="flex items-center justify-around rounded-b-lg bg-slate-700 p-2 text-center">
          <div>
            <span className="text-slate-400">Length of day:</span>{" "}
            {event.lengthOfDate?.hours} hrs {event.lengthOfDate?.minutes} mins
          </div>
          <span className="rounded bg-gradient-to-l from-slate-400 to-yellow-600 p-1 text-sm">
            <span className="text-slate-200">Courtesy of: </span>
            <a href="https://sunrise-sunset.org/api" target="_blank">
              sunrise-sunset.org
            </a>
          </span>
        </div>
      )}
    </div>
  );
};

export default TimelineEventCard;
