import { format } from "date-fns";
import { BsSunrise, BsSunset } from "react-icons/bs";
import { api } from "~/utils/api";

const SunInfoCard = ({ mode }: { mode: string }) => {
  const { data: sunInfo } = api.sunInfo.read.useQuery({
    date: new Date(),
  });

  return (
    <>
      {mode === "sunrise" && sunInfo && (
        <div className="flex w-full items-center gap-3 rounded-lg bg-white/10 p-2 transition duration-300 ease-in-out hover:bg-white/20">
          <span
            className={`flex h-12 w-12 items-center justify-center rounded-full bg-yellow-300/60 text-2xl text-yellow-200`}>
            <BsSunrise />
          </span>
          <div className="flex flex-col">
            <div className="font-bold">Sunrise</div>
            <div className="text-sm text-gray-300">
              {format(sunInfo?.sunrise, "HH:mm")}
            </div>
          </div>
          <div className="flex flex-1 justify-end p-4">
            Sunset at {format(sunInfo.sunset, "HH:mm")}, length of day:{" "}
            {sunInfo.dayLength.hours} h {sunInfo.dayLength.minutes} min
          </div>
        </div>
      )}

      {mode === "sunset" && sunInfo && (
        <div className="flex w-full items-center gap-3 rounded-lg bg-white/10 p-2 transition duration-300 ease-in-out hover:bg-white/20">
          <span
            className={`flex h-12 w-12 items-center justify-center rounded-full bg-yellow-300/60 text-2xl text-yellow-200`}>
            <BsSunset />
          </span>
          <div className="flex flex-col">
            <div className="font-bold">Sunset</div>
            <div className="text-sm text-gray-300">
              {format(sunInfo?.sunset, "HH:mm")}
            </div>
          </div>
          <div className="flex flex-1 justify-end p-4">
            Length of day: {sunInfo.dayLength.hours} h{" "}
            {sunInfo.dayLength.minutes} min
          </div>
        </div>
      )}
    </>
  );
};

export default SunInfoCard;
