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
import { yyyyMMddHyphenated } from "~/utils/date";
import LoadingErrorAndRetry from "../shared/LoadingErrorAndRetry";
import TimelineEventCard from "./TimelineEventCard";
import OnCompleteModal from "./OnCompleteModal";
import { type TimelineEvent } from "~/types";

const TimelinePage = () => {
  const [timelineAnimations] = useAutoAnimate();

  const [selectedDate, setSelectedDate] = useState(new Date());
  const filterOptions = ["Available", "Complete", "Skipped", "All"];
  const [filter, setFilter] = useState(filterOptions[0]);

  const {
    data: events,
    isLoading,
    isError,
    refetch,
  } = api.timeline.buildAgenda.useQuery({
    date: selectedDate,
    filter,
  });

  // on complete modal stuff
  const [showOnCompleteModal, setShowOnCompleteModal] = useState(false);
  const [completingEvent, setCompletingEvent] = useState<TimelineEvent | null>(
    null
  );
  const handleOnComplete = (event: TimelineEvent) => {
    setCompletingEvent(event);
    setShowOnCompleteModal(true);
  };

  return (
    <>
      <div className="mx-auto my-4 flex w-full select-none flex-col overflow-hidden px-4 md:w-3/4 lg:w-2/3 xl:w-1/2">
        <Header
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          eventCount={events?.length}
        />

        <div className="mb-4 text-center">
          <FiltersBar
            filterOptions={filterOptions}
            filter={filter}
            setFilter={setFilter}
          />
        </div>

        {(isLoading || isError) && (
          <LoadingErrorAndRetry
            isLoading={isLoading}
            isError={isError}
            retry={() => void refetch()}
          />
        )}

        {!isLoading && !isError && (
          <div
            id="timeline-grid"
            ref={timelineAnimations}
            className="flex w-full flex-col gap-3">
            {events?.map((event) => (
              <TimelineEventCard
                key={event.id}
                event={event}
                handleOnComplete={handleOnComplete}
              />
            ))}
          </div>
        )}

        <FabSection />
      </div>

      {completingEvent && showOnCompleteModal && (
        <OnCompleteModal
          event={completingEvent}
          close={() => setShowOnCompleteModal(false)}
        />
      )}
    </>
  );
};

const Header = ({
  selectedDate,
  setSelectedDate,
  eventCount,
}: {
  selectedDate: Date;
  setSelectedDate: Dispatch<SetStateAction<Date>>;
  eventCount: number | undefined;
}) => {
  return (
    <div className="relative my-4 text-center">
      <h4 className="flex items-center justify-center gap-2">
        {eventCount ?? ""}
        <span className="text-slate-500">
          {" "}
          activities for{" "}
          <span className="text-white">{format(selectedDate, "EEEE")}</span>
        </span>
      </h4>
      <div className="mt-4 flex items-center justify-center gap-4 text-2xl">
        <button
          onClick={() => setSelectedDate((prev) => addDays(prev, -1))}
          className="flex items-center">
          <FaChevronLeft />
        </button>
        <div className="input-appender relative">
          <input
            type="date"
            value={format(selectedDate, yyyyMMddHyphenated)}
            onChange={(e) =>
              setSelectedDate(
                parse(e.target.value, yyyyMMddHyphenated, new Date())
              )
            }
            className="w-auto cursor-pointer rounded-none border-0 border-b-2 bg-slate-900 p-1 pr-10 text-xl text-white"
          />
          <FaCalendarAlt className="pointer-events-none absolute right-2 top-1" />
        </div>
        <button
          onClick={() => setSelectedDate((prev) => addDays(prev, 1))}
          className="flex items-center">
          <FaChevronRight />
        </button>
      </div>
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
    <>
      <div className="relative">
        <div className="fixed bottom-28 right-8 z-[50]">
          <div className="flex flex-col items-end gap-6 text-xl font-bold">
            {fabOptions.map((fabOption) => (
              <Link
                key={fabOption.label}
                href={fabOption.href}
                className={`rounded bg-slate-800 p-2 text-slate-200 transition duration-200 ease-in-out ${
                  fabOpen ? "opacity-100" : "hidden"
                }`}>
                {fabOption.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
      <button
        onClick={() => setFabOpen((prev) => !prev)}
        className={`fixed bottom-8 right-8 z-[50] flex h-16 w-16 items-center justify-center rounded-full bg-slate-300 text-4xl text-slate-800 transition duration-300 ease-in-out hover:bg-slate-400 ${
          fabOpen ? "rotate-45" : ""
        }`}>
        <FaPlus />
      </button>
      <div
        id="fab-backdrop"
        onClick={() => setFabOpen((prev) => !prev)}
        className={`fixed bottom-0 left-0 right-0 top-0 z-[49] bg-slate-200/30 backdrop-blur-sm ${
          fabOpen ? "" : "hidden"
        }`}></div>
    </>
  );
};

export default TimelinePage;
