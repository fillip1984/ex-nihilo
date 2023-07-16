import Link from "next/link";
import { BsBodyText, BsClock, BsRepeat } from "react-icons/bs";
import { TbTimelineEvent } from "react-icons/tb";
import { type RoutineAndAll } from "~/types";

const RoutineCard = ({ routine }: { routine: RoutineAndAll }) => {
  return (
    <Link
      href={`/routines/${routine.id}`}
      key={routine.id}
      className="flex w-full items-center gap-3 rounded-lg bg-white/10 p-2 transition duration-300 ease-in-out hover:bg-white/20">
      <div className="card-body flex flex-col gap-4 p-2">
        <div className="factoid flex items-center gap-2">
          <BsBodyText className="text-2xl" />
          <div>
            <b>{routine.name}</b>
            <p>{routine.description}</p>
          </div>
        </div>
        <div className="factoid">
          <div className="flex items-center gap-2">
            <BsRepeat className="text-2xl" />
            {routine.occurrenceType === "DAILY" && (
              <span>Every {routine.dailyEveryValue} day(s)</span>
            )}
            {routine.occurrenceType === "WEEKLY" && (
              <div className="text-xs text-slate-600 sm:text-sm">
                <div className="flex gap-2 p-1">
                  {routine.weeklyDaysSelected.map((day) => (
                    <span
                      key={day.id}
                      className={`${day.selected ? "text-white" : ""}`}>
                      {day.abbreviatedLabel}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="factoid flex items-center gap-2">
          <BsClock className="text-2xl" />
          {routine.fromTime}
          {routine.toTime ? " - " + routine.toTime : ""}
        </div>
        {/* <p className="text-xs text-gray-300">{event.topic}</p> */}
        {/* // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access */}
        <div className="factoid flex items-center gap-2">
          <TbTimelineEvent className="text-2xl" />
          {routine._count.activities.toString()}
        </div>
      </div>
    </Link>
  );
};

export default RoutineCard;
