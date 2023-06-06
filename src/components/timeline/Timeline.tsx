import { useAutoAnimate } from "@formkit/auto-animate/react";
import { addMinutes, format } from "date-fns";
import { useState } from "react";
import { FaBed, FaRunning } from "react-icons/fa";
import { MdOutlineCleaningServices } from "react-icons/md";
import { type TimelineEvent } from "~/server/api/routers/TimelineRouter";
import SunInfoCard from "./SunInfoCard";
import TimelineEventCard from "./TimelineEventCard";

const Timeline = () => {
  const [parent] = useAutoAnimate();

  const [events, setEvents] = useState<TimelineEvent[]>([
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
          <TimelineEventCard
            key={event.id}
            event={event}
            handleComplete={handleComplete}
          />
        ))}
        <SunInfoCard mode="sunset" />
      </div>
    </div>
  );
};

export default Timeline;
