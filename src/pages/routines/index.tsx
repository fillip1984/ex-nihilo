import { format } from "date-fns";
import Link from "next/link";
import { api } from "~/utils/api";
import { BsBodyText, BsClock, BsRepeat } from "react-icons/bs";

const RoutinePage = () => {
  const { data: routines } = api.routines.readAll.useQuery();
  return (
    <div className="mx-auto flex w-1/2 flex-col gap-2">
      <h2>Routines</h2>
      {routines?.map((routine) => (
        <Link
          href={`/routines/${routine.id}`}
          key={routine.id}
          className="flex w-full items-center gap-3 rounded-lg bg-white/10 p-2 transition duration-300 ease-in-out hover:bg-white/20">
          <div className="card-body flex flex-col gap-4 p-2">
            <div className="flex items-center gap-2">
              <BsBodyText className="text-2xl" />
              <div>
                <b>{routine.summary}</b>
                <p>{routine.details}</p>
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

export default RoutinePage;
