import Link from "next/link";
import LoadingErrorAndRetry from "~/components/shared/LoadingErrorAndRetry";
import TopicCard from "~/components/topics/TopicCard";
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
          topics?.map((topic) => <TopicCard key={topic.id} topic={topic} />)}
      </div>
    </div>
  );
};

export default TopicList;
