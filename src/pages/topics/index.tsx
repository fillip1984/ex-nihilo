import Link from "next/link";
import { BsBodyText } from "react-icons/bs";
import { api } from "~/utils/api";

const TopicList = () => {
  const { data: topics } = api.topics.readAll.useQuery();

  return (
    <div className="flex flex-col gap-2 p-4">
      <h2>Topics</h2>
      <div className="my-4">
        <Link
          href="/topics/new"
          className="rounded bg-slate-400 px-4 py-2 font-bold">
          Add Topic
        </Link>
      </div>
      {topics?.map((topic) => (
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
          </div>
        </Link>
      ))}
    </div>
  );
};

export default TopicList;