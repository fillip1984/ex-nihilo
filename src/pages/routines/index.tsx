import Link from "next/link";
import { BsPlus } from "react-icons/bs";
import { FaArrowRight } from "react-icons/fa";
import RoutineCard from "~/components/routines/RoutineCard";
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
            <RoutineCard key={routine.id} routine={routine} />
          ))}
      </div>
    </div>
  );
};

export default RoutineList;
