import { type Activity, type Routine, type Topic } from "@prisma/client";
import { format, isEqual } from "date-fns";
import { BsSunrise, BsSunset } from "react-icons/bs";
import { FaBed, FaRunning } from "react-icons/fa";
import { GiPerspectiveDiceSixFacesRandom } from "react-icons/gi";
import { MdOutlineCleaningServices } from "react-icons/md";

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
    <div className="flex w-full gap-3 rounded-lg bg-white/10 p-2 transition duration-300 ease-in-out hover:bg-white/20">
      <span
        className={`flex h-12 w-12 items-center justify-center rounded-full text-2xl ${activity.routine.topic.color}`}>
        {selectIcon(activity.routine.topic.icon)}
      </span>
      <div className="flex flex-col">
        <b>{activity.routine.name}</b>
        <span className="text-sm text-gray-300">
          {format(activity.routine.fromTime, "HH:mm")}
          {activity.routine.toTime &&
          !isEqual(activity.routine.fromTime, activity.routine.toTime)
            ? " - " + format(activity.routine.toTime, "HH:mm")
            : ""}
        </span>
        <p className="text-xs text-gray-300">{activity.routine.topic.name}</p>
        <p>{activity.routine.startDate.toLocaleString()}</p>
        <p>{activity.start.toLocaleString()}</p>
      </div>
      <div className="flex flex-1 flex-col">
        <button
          type="button"
          onClick={() => handleComplete(activity.id)}
          className="flex-1 bg-green-400">
          Complete
        </button>
        <button
          type="button"
          onClick={() => handleSkip(activity.id)}
          className="flex-1 bg-red-400">
          Skip
        </button>
      </div>
    </div>
  );
};

export default TimelineEventCard;
