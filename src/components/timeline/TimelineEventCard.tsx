import { format } from "date-fns";
import { type TimelineEvent } from "~/server/api/routers/TimelineRouter";

const TimelineEventCard = ({
  event,
  handleComplete,
}: {
  event: TimelineEvent;
  handleComplete: (id: string) => void;
}) => {
  return (
    <div
      onClick={() => handleComplete(event.id)}
      className="flex w-full items-center gap-3 rounded-lg bg-white/10 p-2 transition duration-300 ease-in-out hover:bg-white/20">
      <span
        className={`flex h-12 w-12 items-center justify-center rounded-full text-2xl ${event.color}`}>
        {event.icon}
      </span>
      <div className="flex flex-col">
        <b>{event.description}</b>
        <span className="text-sm text-gray-300">
          {format(event.start, "HH:mm")}{" "}
          {event.end ? "-" + format(event.end, "HH:mm") : ""}
        </span>
        <p className="text-xs text-gray-300">{event.topic}</p>
      </div>
    </div>
  );
};

export default TimelineEventCard;
