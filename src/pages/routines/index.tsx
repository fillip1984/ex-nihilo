import { format } from "date-fns";
import Link from "next/link";
import { BsBodyText, BsClock, BsRepeat } from "react-icons/bs";
import { api } from "~/utils/api";

const RoutineList = () => {
  const { data: routines } = api.routines.readAll.useQuery();

  const handleRebuildActivities = () => {
    console.log("rebuilding activities");
  };

  return (
    <div className="flex flex-col gap-2 p-4">
      <h2>Routines</h2>
      <div className="rounded border border-slate-400 p-2">
        <p>
          Rebuild activies deletes and then recreates activities which feed your
          timeline.
        </p>
        <p>
          <b>ALL ACTIVITY HISTORY WILL BE LOST!</b>
        </p>
        <button
          onClick={handleRebuildActivities}
          className="my-2 rounded bg-red-400 px-4 py-2 font-bold">
          Rebuild Activities
        </button>
      </div>
      <div className="my-4">
        <Link
          href="/routines/new"
          className="rounded bg-slate-400 px-4 py-2 font-bold">
          Add Routine
        </Link>
      </div>
      {routines?.map((routine) => (
        <Link
          href={`/routines/${routine.id}`}
          key={routine.id}
          className="flex w-full items-center gap-3 rounded-lg bg-white/10 p-2 transition duration-300 ease-in-out hover:bg-white/20">
          <div className="card-body flex flex-col gap-4 p-2">
            <div className="flex items-center gap-2">
              <BsBodyText className="text-2xl" />
              <div>
                <b>{routine.name}</b>
                <p>{routine.description}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <BsRepeat className="text-2xl" />
              {routine.occurrenceType}
            </div>
            <div className="flex items-center gap-2">
              <BsClock className="text-2xl" />
              {format(routine.fromTime, "HH:mm")}
              {routine.toTime ? " - " + format(routine.toTime, "HH:mm") : ""}
            </div>
            {/* <p className="text-xs text-gray-300">{event.topic}</p> */}
          </div>
        </Link>
      ))}
    </div>
  );
};

export default RoutineList;
