import { useAutoAnimate } from "@formkit/auto-animate/react";
import clsx from "clsx";
import { format } from "date-fns";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";
import { FaPlus } from "react-icons/fa";
import { api } from "~/utils/api";
import TimelineEventCard from "./TimelineEventCard";

const TimelinePage = () => {
  const { data: sessionData } = useSession();

  const [timelineAnimations] = useAutoAnimate();
  const [fabAnimations] = useAutoAnimate();
  const [fabOpen, setFabOpen] = useState(false);

  const utils = api.useContext();
  const { data: activities } = api.activities.readAll.useQuery();
  const completeAct = api.activities.complete.useMutation({
    onSuccess: async () => {
      await utils.activities.invalidate();
    },
  });
  const skipAct = api.activities.skip.useMutation({
    onSuccess: async () => {
      await utils.activities.invalidate();
    },
  });

  const handleComplete = (id: string) => {
    console.log("consider it done", id);
    completeAct.mutate({ id });
    // setEvents(
    //   events.map((event) =>
    //     event.id === id ? { ...event, complete: !event.complete } : event
    //   )
    // );
    // setEvents(events.filter((event) => event.id !== id));
  };

  const handleSkip = (id: string) => {
    console.log("skipping", id);
    skipAct.mutate({ id });
  };

  return (
    <div className="mx-auto my-4 flex w-full select-none flex-col overflow-hidden px-4 md:w-2/3 lg:w-1/3">
      <div className="my-4 text-center">
        {sessionData?.user.name && (
          <h3 className="mt-4 font-bold">Hello {sessionData?.user.name}</h3>
        )}
        <h4>
          {activities?.length}
          <span className="text-slate-500"> activities for today </span>
          {format(new Date(), "MM/dd/yyyy")}
        </h4>
      </div>
      <div>
        <h4>Filters</h4>
        <Filters />
      </div>
      <div
        id="timeline-grid"
        ref={timelineAnimations}
        className="flex w-full flex-col gap-3">
        {activities?.map((activity) => (
          <TimelineEventCard
            key={activity.id}
            activity={activity}
            handleComplete={handleComplete}
            handleSkip={handleSkip}
          />
        ))}
      </div>

      <div ref={fabAnimations}>
        {/* href="/activitys/new" */}
        {fabOpen && (
          <div className="fixed bottom-0 left-1/2 right-0 top-2/3 z-[998]">
            <div className="flex flex-col items-end gap-6 p-8 text-xl font-bold">
              <Link
                href="/routines"
                className="rounded-lg bg-slate-200/20 p-2 backdrop-blur-sm md:left-3/4">
                Manage Routines
              </Link>
              <Link
                href="/topics"
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

const Filters = () => {
  // type FilterOptions = "Available" | "Complete" | "Skipped" | "All";
  const filters = ["Available", "Complete", "Skipped", "All"];
  const [filter, setFilter] = useState("Available");

  const [app, setApp] = useState<"light" | "dark" | "system">("light");
  return (
    <>
      <div
        id="filter-container"
        className="relative mx-2 mt-2 rounded-md bg-slate-700 p-1">
        <div
          id="slider-container"
          className={clsx(
            "absolute inset-y-0 h-full w-1/3 transform px-4 py-1 transition-transform",
            {
              "translate-x-0": app === "light",
              "translate-x-full": app === "dark",
              "translate-x-[200%]": app === "system",
            }
          )}>
          <div
            id="slider"
            className={clsx(
              "h-full w-full rounded-md bg-slate-400",
              {
                active: app === "light",
                "bg-gray-600": app === "dark",
              },
              {
                // needs to be separate object otherwise dark/light & system keys overlap resulting in a visual bug
                ["bg-gray-600"]: app === "system",
              }
            )}></div>
        </div>
        <div className="relative flex h-full w-full">
          <button
            tabIndex={0}
            onClick={() => setApp("light")}
            className={clsx(
              "my-2 ml-2 w-1/3 cursor-pointer select-none py-1 text-sm focus:outline-none",
              {
                active: app === "light",
                "text--gray-900 font-bold": app === "light",
                "text--gray-600": app !== "light",
              }
            )}>
            Light
          </button>
          <button
            tabIndex={0}
            onClick={() => setApp("dark")}
            className={clsx(
              "my-2 ml-2 w-1/3 cursor-pointer select-none py-1 text-sm focus:outline-none",
              {
                active: app === "dark",
                "font-bold text-white": app === "dark",
                "text--gray-600": app !== "dark",
              }
            )}>
            Dark
          </button>
          <button
            tabIndex={0}
            onClick={() => setApp("system")}
            className={clsx(
              "my-2 ml-2 w-1/3 cursor-pointer select-none py-1 text-sm focus:outline-none",
              {
                active: app === "system",
                "font-bold text-white": app === "system",
                "text--gray-600": app !== "system",
              }
            )}>
            System
          </button>
        </div>
      </div>
    </>
  );
};

export default TimelinePage;
