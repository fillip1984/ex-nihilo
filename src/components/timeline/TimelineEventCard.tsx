import { type TimelineEvent } from "@prisma/client";
import { format } from "date-fns";
import { FaBed, FaRunning } from "react-icons/fa";
import { MdOutlineCleaningServices } from "react-icons/md";
import { GiPerspectiveDiceSixFacesRandom } from "react-icons/gi";

const TimelineEventCard = ({
  event,
  handleComplete,
}: {
  event: TimelineEvent;
  handleComplete: (id: string) => void;
}) => {
  const selectIcon = (iconName: string) => {
    switch (iconName) {
      case "<FaBed />":
        return <FaBed />;
      case "<FaRunning />":
        return <FaRunning />;
      case "<MdOutlineCleaningServices />":
        return <MdOutlineCleaningServices />;
      default:
        return <GiPerspectiveDiceSixFacesRandom />;
    }
  };

  return (
    <div
      onClick={() => handleComplete(event.id)}
      className="flex w-full items-center gap-3 rounded-lg bg-white/10 p-2 transition duration-300 ease-in-out hover:bg-white/20">
      <span
        className={`flex h-12 w-12 items-center justify-center rounded-full text-2xl ${event.color}`}>
        {selectIcon(event.icon)}
      </span>
      <div className="flex flex-col">
        <b>{event.description}</b>
        <span className="text-sm text-gray-300">
          {format(event.start, "HH:mm")}
          {event.end ? " - " + format(event.end, "HH:mm") : ""}
        </span>
        <p className="text-xs text-gray-300">{event.topic}</p>
      </div>
    </div>
  );
};

export default TimelineEventCard;
