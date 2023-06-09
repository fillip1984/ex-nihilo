import { type Routine } from "@prisma/client";
import { format, isEqual } from "date-fns";
import { BsSunrise, BsSunset } from "react-icons/bs";
import { FaBed, FaRunning } from "react-icons/fa";
import { GiPerspectiveDiceSixFacesRandom } from "react-icons/gi";
import { MdOutlineCleaningServices } from "react-icons/md";

const TimelineEventCard = ({
  routine,
  handleComplete,
}: {
  routine: Routine;
  handleComplete: (id: string) => void;
}) => {
  const selectIcon = (iconName: string) => {
    switch (iconName) {
      case "<FaBed />":
        return <FaBed />;
      case "<FaRunning />":
        return <FaRunning />;
      case "<BsSunrise />":
        return <BsSunrise />;
      case "<BsSunset />":
        return <BsSunset />;
      case "<MdOutlineCleaningServices />":
        return <MdOutlineCleaningServices />;
      default:
        return <GiPerspectiveDiceSixFacesRandom />;
    }
  };

  return (
    <div
      onClick={() => handleComplete(routine.id)}
      className="flex w-full items-center gap-3 rounded-lg bg-white/10 p-2 transition duration-300 ease-in-out hover:bg-white/20">
      {/* <span
        className={`flex h-12 w-12 items-center justify-center rounded-full text-2xl ${event.color}`}>
        {selectIcon(event.icon)}
      </span> */}
      <div className="flex flex-col">
        <b>{routine.summary}</b>
        <span className="text-sm text-gray-300">
          {format(routine.fromTime, "HH:mm")}
          {routine.toTime && !isEqual(routine.fromTime, routine.toTime)
            ? " - " + format(routine.toTime, "HH:mm")
            : ""}
        </span>
        {/* <p className="text-xs text-gray-300">{event.topic}</p> */}
      </div>
    </div>
  );
};

export default TimelineEventCard;
