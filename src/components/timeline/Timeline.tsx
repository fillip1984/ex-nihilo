import { useAutoAnimate } from "@formkit/auto-animate/react";
import { format } from "date-fns";
import Link from "next/link";
import { FaPlus } from "react-icons/fa";
import { api } from "~/utils/api";
import TimelineEventCard from "./TimelineEventCard";

const TimelinePage = () => {
  const [parent] = useAutoAnimate();

  const { data: timelinePoints } = api.timeline.readAll.useQuery();

  const handleComplete = (id: string) => {
    // setEvents(
    //   events.map((event) =>
    //     event.id === id ? { ...event, complete: !event.complete } : event
    //   )
    // );
    // setEvents(events.filter((event) => event.id !== id));
  };

  return (
    <div className="mx-auto my-4 flex w-full select-none flex-col overflow-hidden px-4 md:w-2/3 lg:w-1/3">
      <h4 className="mb-4 flex flex-col text-center"></h4>
      <div id="timeline-grid" className="flex w-full flex-col gap-3">
        {timelinePoints?.map((timelinePoint) => (
          <div
            key={timelinePoint.date.getTime()}
            ref={parent}
            className="flex flex-col gap-3">
            <h3>{format(timelinePoint.date, "MM-dd-yyyy")}</h3>
            {timelinePoint.events.map((event) => (
              <TimelineEventCard
                key={event.id}
                event={event}
                handleComplete={handleComplete}
              />
            ))}
          </div>
        ))}
      </div>
      <Link
        href="/routines/new"
        className="fixed bottom-8 right-8 flex h-16 w-16 items-center justify-center rounded-full bg-slate-300 text-4xl text-slate-800 transition-colors duration-300 ease-in-out hover:bg-slate-400">
        <FaPlus />
      </Link>
    </div>
  );
};

export default TimelinePage;
