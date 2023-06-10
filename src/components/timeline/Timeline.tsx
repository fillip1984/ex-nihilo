import { useAutoAnimate } from "@formkit/auto-animate/react";
import { addDays, format, parse } from "date-fns";
import Link from "next/link";
import { useState, type Dispatch, type SetStateAction } from "react";
import {
  FaCalendarAlt,
  FaChevronLeft,
  FaChevronRight,
  FaPlus,
} from "react-icons/fa";
import { api } from "~/utils/api";
import TimelineEventCard from "./TimelineEventCard";

const TimelinePage = () => {
  const utils = api.useContext();

  const [timelineAnimations] = useAutoAnimate();

  const [selectedDate, setSelectedDate] = useState(new Date());
  const filterOptions = ["Available", "Complete", "Skipped", "All"];
  const [filter, setFilter] = useState(filterOptions[0]);

  const { data: events } = api.timeline.buildAgenda.useQuery({
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
        {/* {sessionData?.user.name && (
          <h3 className="mt-4 font-bold">Hello {sessionData?.user.name}</h3>
        )} */}
        <h4 className="flex items-center justify-center gap-2">
          {events?.length}
          <span className="text-slate-500"> activities for </span>
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
        <div className="mt-4 flex items-center justify-center gap-4 text-2xl">
          <button
            onClick={() => setSelectedDate((prev) => addDays(prev, -1))}
            className="flex items-center">
            <FaChevronLeft />
          </button>
          <button
            onClick={() => setSelectedDate((prev) => addDays(prev, 1))}
            className="flex items-center">
            <FaChevronRight />
          </button>
        </div>
      </div>

      <div className="mb-4 text-center">
        <FiltersBar
          filterOptions={filterOptions}
          filter={filter}
          setFilter={setFilter}
        />
      </div>
      <div
        id="timeline-grid"
        ref={timelineAnimations}
        className="flex w-full flex-col gap-3">
        {events?.map((event) => (
          <TimelineEventCard
            key={event.id}
            event={event}
            handleComplete={handleComplete}
            handleSkip={handleSkip}
          />
        ))}
      </div>

      <FabSection />
    </div>
  );
};

const FiltersBar = ({
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
            absolute inset-y-0 h-full w-1/4 transform transition-transform ${calculateTranslate(
              filter
            )}`}>
          <div
            id="slider"
            className="h-full w-full rounded-md bg-slate-400"></div>
        </div>
        <div className="relative flex h-full w-full">
          {filterOptions.map((filterOption) => (
            <button
              key={filterOption}
              onClick={() => setFilter(filterOption)}
              className={`flex w-full flex-col items-center justify-center py-3 text-sm ${
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

const FabSection = () => {
  const [fabOpen, setFabOpen] = useState(false);
  const fabOptions = [
    {
      href: "/routines",
      label: "Manage Routines",
    },
    {
      href: "/topics",
      label: "Manage Topics",
    },
  ];

  return (
    <div>
      <div className="relative">
        <div className="fixed bottom-28 right-8 z-[998]">
          <div className="flex flex-col items-end gap-6 text-xl font-bold">
            {fabOptions.map((fabOption) => (
              <Link
                key={fabOption.label}
                href={fabOption.href}
                className={`rounded bg-slate-800 p-2 text-slate-200 transition duration-200 ease-in-out ${
                  fabOpen ? "opacity-100" : "translate-y-3 opacity-0"
                }`}>
                {fabOption.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
      <button
        onClick={() => setFabOpen((prev) => !prev)}
        className={`fixed bottom-8 right-8 z-[999] flex h-16 w-16 items-center justify-center rounded-full bg-slate-300 text-4xl text-slate-800 transition duration-300 ease-in-out hover:bg-slate-400 ${
          fabOpen ? "rotate-45" : ""
        }`}>
        <FaPlus />
      </button>
      <div
        id="fab-backdrop"
        onClick={() => setFabOpen((prev) => !prev)}
        className={`absolute bottom-0 left-0 right-0 top-0 z-[997] bg-slate-200/30 backdrop-blur-sm ${
          fabOpen ? "" : "hidden"
        }`}></div>
    </div>
  );
};

export default TimelinePage;
