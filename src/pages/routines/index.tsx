import Link from "next/link";
import { BsBodyText, BsClock, BsPlus, BsRepeat } from "react-icons/bs";
import { FaArrowRight } from "react-icons/fa";
import { TbTimelineEvent } from "react-icons/tb";
import LoadingErrorAndRetry from "~/components/shared/LoadingErrorAndRetry";
import { api } from "~/utils/api";

const RoutineList = () => {
  const {
    data: routines,
    isLoading,
    isError,
    refetch,
  } = api.routines.readAll.useQuery();

  const { data: topicCount } = api.topics.count.useQuery();

  return (
    <div className="list-container mx-auto w-full px-4 md:w-2/3 lg:w-1/2 xl:w-1/3">
      <div className="flex flex-col gap-2 p-4">
        <div className="flex items-center gap-4">
          <h2>Routines</h2>
          {!!topicCount && topicCount > 0 && (
            <Link
              href="/routines/new"
              className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-400 text-4xl">
              <BsPlus />
            </Link>
          )}
        </div>
        <div className="my-4 flex gap-2">
          <Link
            href="/topics"
            className="flex items-center gap-2 rounded border border-slate-400 px-4 py-2 font-bold text-slate-400">
            Manage Topics <FaArrowRight />
          </Link>
        </div>

        {(isLoading || isError) && (
          <LoadingErrorAndRetry
            isLoading={isLoading}
            isError={isError}
            retry={() => void refetch()}
          />
        )}

        {topicCount === 0 && (
          <p>You need to add topics before creating routines</p>
        )}

        {!isLoading &&
          !isError &&
          routines?.map((routine) => (
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
                <div className="factoid flex items-center gap-2">
                  <BsRepeat className="text-2xl" />
                  {routine.occurrenceType}
                  {routine.occurrenceType === "DAILY" && (
                    <span className="text-sm text-slate-400">
                      Every {routine.dailyEveryValue} day(s)
                    </span>
                  )}

                  {routine.occurrenceType === "WEEKLY" && (
                    <div className="text-sm text-slate-400">
                      <div className="flex gap-2 rounded border p-1">
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
          ))}
      </div>
    </div>
  );
};

export default RoutineList;
