import { useRouter } from "next/router";
import { api } from "~/utils/api";

const RoutineEdit = () => {
  const router = useRouter();
  const { id } = router.query;
  const utils = api.useContext();

  const { data: routine } = api.routines.readOne.useQuery(
    {
      id: id as string,
    },
    { enabled: !!id }
  );

  const deleteRoutine = api.routines.delete.useMutation({
    onSuccess: async () => {
      await utils.routines.invalidate();
      void router.push("/routines");
    },
  });

  const handleDelete = () => {
    deleteRoutine.mutate({ id: id as string });
  };

  return (
    <div>
      <h2>{routine?.summary}</h2>
      <p>{routine?.details}</p>
      <button
        type="button"
        onClick={handleDelete}
        className="flex items-center gap-1 rounded border-2 border-red-600 px-4 py-2 text-2xl text-red-600">
        Delete
      </button>
    </div>
  );
};

export default RoutineEdit;
