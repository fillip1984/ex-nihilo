import { useAutoAnimate } from "@formkit/auto-animate/react";
import { format, parse } from "date-fns";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { type SetStateAction, useState, type Dispatch } from "react";
import { FaCalendarAlt, FaPlus } from "react-icons/fa";
import { api } from "~/utils/api";
import TimelineEventCard from "./TimelineEventCard";

const TimelinePage = () => {
  const { data: sessionData } = useSession();
  const utils = api.useContext();

  const [timelineAnimations] = useAutoAnimate();
  const [fabAnimations] = useAutoAnimate();
  const [fabOpen, setFabOpen] = useState(false);

  const [selectedDate, setSelectedDate] = useState(new Date());
  const filterOptions = ["Available", "Complete", "Skipped", "All"];
  const [filter, setFilter] = useState(filterOptions[0]);

  const { data: activities } = api.activities.readAll.useQuery({
    date: selectedDate,
    filter,
  });

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
    completeAct.mutate({ id });
  };

  const handleSkip = (id: string) => {
    skipAct.mutate({ id });
  };

  return (
    <div className="mx-auto my-4 flex w-full select-none flex-col overflow-hidden px-4 md:w-2/3 lg:w-1/3">
      <div className="my-4 text-center">
        {sessionData?.user.name && (
          <h3 className="mt-4 font-bold">Hello {sessionData?.user.name}</h3>
        )}
        <h4 className="flex items-center justify-center gap-2">
          {activities?.length}
          <span className="text-slate-500"> activities for today </span>

          <input
            type="date"
            value={format(selectedDate, "yyyy-MM-dd")}
            onChange={(e) =>
              setSelectedDate(parse(e.target.value, "yyyy-MM-dd", new Date()))
            }
            className="w-auto rounded-none border-0 border-b-2 bg-slate-900 p-0 text-xl text-white"
          />
          <FaCalendarAlt />
        </h4>
      </div>

      <div className="my-4 text-center">
        <h4>Filters</h4>
        <Filters
          filterOptions={filterOptions}
          filter={filter}
          setFilter={setFilter}
        />
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

const Filters = ({
  filterOptions,
  filter,
  setFilter,
}: {
  filterOptions: string[];
  filter: string | undefined;
  setFilter: Dispatch<SetStateAction<string | undefined>>;
}) => {
  const calculateTranslate = (filter: string | undefined) => {
    if (filter === undefined) {
      return "";
    }

    switch (filterOptions.indexOf(filter)) {
      case 0:
        return "translate-x-0";
      case 1:
        return "translate-x-full";
      case 2:
        return "translate-x-[200%]";
      case 3:
        return "translate-x-[300%]";
      default:
        throw new Error("not setup to go beyond 3 options");
    }
  };

  return (
    <>
      <div
        id="filter-container"
        className="relative mx-2 mt-2 rounded-md bg-slate-700 p-1">
        <div
          id="slider-container"
          className={`
            absolute inset-y-0 h-full w-1/4 transform px-4 py-1 transition-transform ${calculateTranslate(
              filter
            )}`}>
          <div
            id="slider"
            className="h-full w-full rounded-md bg-slate-400"></div>
        </div>
        <div className="relative grid h-full w-full grid-cols-4">
          {filterOptions.map((filterOption) => (
            <button
              key={filterOption}
              onClick={() => setFilter(filterOption)}
              className={`p-3 text-sm ${
                filterOption === filter ? "font-bold" : ""
              }`}>
              {filterOption}
            </button>
          ))}
        </div>
      </div>
    </>
  );
};

export default TimelinePage;
