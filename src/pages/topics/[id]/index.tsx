import { useRouter } from "next/router";
import { api } from "~/utils/api";

const TopicPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const utils = api.useContext();

  const { data: topic } = api.topics.readOne.useQuery(
    {
      id: id as string,
    },
    { enabled: !!id }
  );

  const deleteTopic = api.topics.delete.useMutation({
    onSuccess: async () => {
      await utils.topics.invalidate();
      void router.push("/topics");
    },
  });

  const handleDelete = () => {
    deleteTopic.mutate({ id: id as string });
  };

  return (
    <div>
      <h2>{topic?.name}</h2>
      <p>{topic?.description}</p>
      <button
        type="button"
        onClick={handleDelete}
        className="flex items-center gap-1 rounded border-2 border-red-600 px-4 py-2 text-2xl text-red-600">
        Delete
      </button>
    </div>
  );
};

export default TopicPage;
