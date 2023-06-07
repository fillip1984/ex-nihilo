import { format } from "date-fns";
import { api } from "~/utils/api";

const RoutinePage = () => {
  const { data: routines } = api.routines.readAll.useQuery();
  return (
    <div>
      <h2>Routines</h2>
      {routines?.map((routine) => (
        <div key={routine.id}>
          <h4>{routine.summary}</h4>
          {format(routine.fromTime, "HH:mm")} -&gt;{" "}
          {format(routine.toTime, "HH:mm")}
        </div>
      ))}
    </div>
  );
};

export default RoutinePage;
