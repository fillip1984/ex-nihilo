import Link from "next/link";
import { BsBodyText, BsListTask } from "react-icons/bs";
import { type TopicSummaryType } from "~/types";
import { IconAvatar } from "./IconsAndColorHelpers";

const TopicCard = ({ topic }: { topic: TopicSummaryType }) => {
  return (
    <Link
      href={`/topics/${topic.id}`}
      key={topic.id}
      className="rounded-lg bg-white/10 p-2 transition duration-300 ease-in-out hover:bg-white/20">
      <div className="card-body flex flex-col gap-4 p-2">
        <h4 className="flex items-center gap-2">
          <IconAvatar icon={topic.icon} color={topic.color} />
          {topic.name}
        </h4>

        <div className="flex flex-col gap-3 pl-4">
          <div className="flex items-center gap-5">
            <BsBodyText className="h-6 w-6" />
            <p>{topic.description}</p>
          </div>
          <div className="flex items-center gap-5">
            <BsListTask className="h-6 w-6" />
            {topic._count.routines}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default TopicCard;
