import { format, isEqual } from "date-fns";
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
import { api } from "~/utils/api";
import { HH_mm_aka24hr } from "~/utils/date";

const TimelineEventCard = ({ event }: { event: TimelineEvent }) => {
  const utils = api.useContext();

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

  const completeAct = api.activities.complete.useMutation({
    onSuccess: async () => {
      await utils.timeline.invalidate();
      await utils.activities.invalidate();
    },
  });
  const skipAct = api.activities.skip.useMutation({
    onSuccess: async () => {
      await utils.timeline.invalidate();
      await utils.activities.invalidate();
    },
  });

  const handleComplete = (id: string) => {
    completeAct.mutate({ id });
  };

  const handleSkip = (id: string) => {
    skipAct.mutate({ id });
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
            {format(event.fromTime, HH_mm_aka24hr)}
            {event.toTime && !isEqual(event.fromTime, event.toTime)
              ? " - " + format(event.toTime, HH_mm_aka24hr)
              : ""}
          </p>
          <p className="flex items-center gap-2 text-sm text-gray-400">
            <BsBodyText />
            {event.description}
          </p>
          <p className="flex items-center gap-2 text-xs text-gray-400">
            <BiCategory />
            {event.topicName}
          </p>
        </div>
      </div>
      {event.complete !== null && event.skip !== null && (
        <div className="flex rounded-b-lg bg-slate-700 text-3xl">
          <button
            type="button"
            onClick={() => handleComplete(event.id)}
            className={`flex flex-1 items-center justify-center gap-2 text-green-400 transition-colors duration-300 hover:text-green-500 ${
              event.skip
                ? "border-b-lg hidden"
                : "rounded-bl-lg border-r-2 border-r-slate-500 py-1"
            } `}
            disabled={event.complete || event.skip}>
            <MdCheck />
            {event.completedAt && (
              <span className="text-sm">
                Completed:{" "}
                {Intl.DateTimeFormat("en-US", {
                  dateStyle: "short",
                  timeStyle: "short",
                }).format(event.completedAt)}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => handleSkip(event.id)}
            className={`flex flex-1 items-center justify-center gap-2 py-1 text-red-400 transition-colors duration-300 hover:text-red-500 ${
              event.complete ? "border-b-lg hidden" : "rounded-br-lg"
            }`}
            disabled={event.complete || event.skip}>
            <MdNotInterested />
            {event.skip && (
              <span className="text-sm">
                Skipped:{" "}
                {Intl.DateTimeFormat("en-US", {
                  dateStyle: "short",
                  timeStyle: "short",
                }).format(event.activity?.updatedAt)}
              </span>
            )}
          </button>
        </div>
      )}

      {event.type === "Suninfo" && event.lengthOfDate && (
        <div className="flex items-center justify-between rounded-b-lg bg-slate-700 p-2 text-center">
          <div>
            <span className="text-slate-400">Length of day:</span>{" "}
            {event.lengthOfDate?.hours} hrs {event.lengthOfDate?.minutes} mins
          </div>
          <a
            href="https://sunrise-sunset.org/"
            target="_blank"
            className="rounded bg-gradient-to-r from-yellow-600 to-slate-400 px-2 py-1 text-sm">
            sunrise-sunset.org
          </a>
        </div>
      )}
    </div>
  );
};

export default TimelineEventCard;
