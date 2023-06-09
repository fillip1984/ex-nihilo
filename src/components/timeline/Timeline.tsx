import { useAutoAnimate } from "@formkit/auto-animate/react";
import Link from "next/link";
import { useState } from "react";
import { FaPlus } from "react-icons/fa";
import { api } from "~/utils/api";
import TimelineEventCard from "./TimelineEventCard";

const TimelinePage = () => {
  const [parent] = useAutoAnimate();
  const [fabAnimations] = useAutoAnimate();
  const [fabOpen, setFabOpen] = useState(false);

  const { data: routines } = api.timeline.readAll.useQuery();

  const handleComplete = (id: string) => {
    console.log("consider it done", id);

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
      <div
        id="timeline-grid"
        ref={parent}
        className="flex w-full flex-col gap-3">
        {routines?.map((routine) => (
          <TimelineEventCard
            key={routine.id}
            routine={routine}
            handleComplete={handleComplete}
          />
        ))}
      </div>

      <div ref={fabAnimations}>
        {/* href="/routines/new" */}
        {fabOpen && (
          <div className="fixed bottom-0 left-1/2 right-0 top-2/3 z-[998]">
            <div className="flex flex-col items-end gap-6 p-8 text-xl font-bold">
              <Link
                href="/routines"
                className="rounded-lg bg-slate-200/20 p-2 backdrop-blur-sm md:left-3/4">
                Manage Routines
              </Link>
              <Link
                href="/topics/new"
                className="rounded-lg bg-slate-200/20 p-2 backdrop-blur-sm md:left-3/4">
                Manage Topics
              </Link>
            </div>
          </div>
        )}
      </div>
      <button
        onClick={() => setFabOpen((prev) => !prev)}
        className="fixed bottom-8 right-8 z-[999] flex h-16 w-16 items-center justify-center rounded-full bg-slate-300 text-4xl text-slate-800 transition-colors duration-300 ease-in-out hover:bg-slate-400">
        <FaPlus />
      </button>
      <div
        id="fab-backdrop"
        onClick={() => setFabOpen((prev) => !prev)}
        className={`absolute bottom-0 left-0 right-0 top-0 z-[997] ${
          fabOpen ? "" : "hidden"
        }`}></div>
    </div>
  );
};

export default TimelinePage;
