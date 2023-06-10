import { type Activity, type Routine, type Topic } from "@prisma/client";
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

const TimelineEventCard = ({
  activity,
  handleComplete,
  handleSkip,
}: {
  activity: Activity & {
    routine: Routine & {
      topic: Topic;
    };
  };
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
          className={`flex h-12 w-12 items-center justify-center rounded-full text-2xl ${activity.routine.topic.color}`}>
          {selectIcon(activity.routine.topic.icon)}
        </span>
        <div className="flex flex-col">
          <b>{activity.routine.name}</b>
          <p className="flex items-center gap-2 text-sm text-gray-200">
            <FaRegClock />
            {format(activity.routine.fromTime, "HH:mm")}
            {activity.routine.toTime &&
            !isEqual(activity.routine.fromTime, activity.routine.toTime)
              ? " - " + format(activity.routine.toTime, "HH:mm")
              : ""}
          </p>
          <p className="flex items-center gap-2 text-sm text-gray-400">
            <BsBodyText />
            {activity.routine.description}
          </p>
          <p className="flex items-center gap-2 text-xs text-gray-400">
            <BiCategory />
            {activity.routine.topic.name}
          </p>
          {/* <p>{activity.routine.startDate.toLocaleString()}</p>
          <p>{activity.start.toLocaleString()}</p> */}
        </div>
      </div>
      <div className="flex  text-3xl">
        <button
          type="button"
          onClick={() => handleComplete(activity.id)}
          className={`flex flex-1 justify-center rounded-bl-lg bg-green-400 p-2 transition-colors duration-300 ${
            activity.skip ? "hidden" : ""
          } `}
          disabled={activity.complete || activity.skip}>
          <MdCheck />
        </button>
        <button
          type="button"
          onClick={() => handleSkip(activity.id)}
          className={`flex flex-1 justify-center rounded-br-lg bg-red-400 p-2 transition-colors duration-300 ${
            activity.complete ? "hidden" : ""
          }`}
          disabled={activity.complete || activity.skip}>
          <MdNotInterested />
        </button>
      </div>
    </div>
  );
};

export default TimelineEventCard;
