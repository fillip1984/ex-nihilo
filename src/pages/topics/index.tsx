import Link from "next/link";
import { BsBodyText, BsListTask } from "react-icons/bs";
import LoadingErrorAndRetry from "~/components/shared/LoadingErrorAndRetry";
import { api } from "~/utils/api";

const TopicList = () => {
  const {
    data: topics,
    isLoading,
    isError,
    refetch,
  } = api.topics.readAll.useQuery();

  return (
    <div className="list-container mx-auto w-full px-4 md:w-2/3 lg:w-1/2 xl:w-1/3">
      <div className="flex flex-col gap-2 p-4">
        <h2>Topics</h2>
        <div className="my-4 flex gap-2">
          <Link
            href="/topics/new"
            className="rounded bg-slate-400 px-4 py-2 font-bold">
            Add Topic
          </Link>
          <Link
            href="/routines"
            className="rounded border border-slate-400 px-4 py-2 font-bold text-slate-400">
            Manage Routines
          </Link>
        </div>

        {(isLoading || isError) && (
          <LoadingErrorAndRetry
            isLoading={isLoading}
            isError={isError}
            retry={() => void refetch()}
          />
        )}

        {!isLoading &&
          !isError &&
          topics?.map((topic) => (
            <Link
              href={`/topics/${topic.id}`}
              key={topic.id}
              className="flex w-full items-center gap-3 rounded-lg bg-white/10 p-2 transition duration-300 ease-in-out hover:bg-white/20">
              <div className="card-body flex flex-col gap-4 p-2">
                <div className="flex items-center gap-2">
                  <BsBodyText className="text-2xl" />
                  <div>
                    <b>{topic.name}</b>
                    <p>{topic.description}</p>
                  </div>
                </div>
                <div className="factoid flex items-center gap-2">
                  <BsListTask className="text-2xl" />
                  {topic._count.routines.toString()}
                </div>
              </div>
            </Link>
          ))}
      </div>
    </div>
  );
};

export default TopicList;
