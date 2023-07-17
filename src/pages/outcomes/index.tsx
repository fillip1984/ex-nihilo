import { format } from "date-fns";
import Link from "next/link";
import { BsHeartPulseFill } from "react-icons/bs";
import { FaArrowRight, FaClock, FaStopwatch } from "react-icons/fa";
import { FaHeartPulse } from "react-icons/fa6";
import {
  GiBiceps,
  GiHearts,
  GiNestedHearts,
  GiPathDistance,
} from "react-icons/gi";
import { IoScaleOutline } from "react-icons/io5";
import { api } from "~/utils/api";
import { yyyyMMddHyphenated } from "~/utils/date";

const Outcomes = () => {
  const { data: weighIns } = api.weighIns.readAll.useQuery();
  const { data: runs } = api.runs.readAll.useQuery();
  const { data: bloodPressureReadings } =
    api.bloodPressureReadings.readAll.useQuery();

  return (
    <div className="mx-auto w-full px-4 md:w-2/3 lg:w-1/2 xl:w-1/3">
      <div className="flex flex-col gap-2 p-4">
        <div className="flex items-center gap-4">
          <h2>Outcomes</h2>
        </div>
        <div className="my-4 flex gap-2">
          <Link
            href="/topics"
            className="flex items-center gap-2 rounded border border-slate-400 px-4 py-2 font-bold text-slate-400">
            Manage Topics <FaArrowRight />
          </Link>
          <Link
            href="/routines"
            className="flex items-center gap-2 rounded border border-slate-400 px-4 py-2 font-bold text-slate-400">
            Manage Routines <FaArrowRight />
          </Link>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div>
          <h3>Weigh ins</h3>
          {weighIns?.map((weighIn) => (
            <div key={weighIn.id} className="rounded border px-2">
              <span className="flex items-center gap-2">
                {/* <FaClock /> */}
                <h4>{format(weighIn.date, yyyyMMddHyphenated)}</h4>
              </span>
              <span className="flex items-center gap-2">
                <IoScaleOutline />
                {weighIn.weight}
              </span>
              <span className="flex items-center gap-2">
                <GiBiceps />
                {weighIn.bodyFatPercentage}
              </span>
            </div>
          ))}
        </div>

        <div>
          <h3>Runs</h3>
          {runs?.map((run) => (
            <div key={run.id} className="rounded border px-2">
              <span className="flex items-center gap-2">
                {/* <FaClock /> */}
                <h4>{format(run.date, yyyyMMddHyphenated)}</h4>
              </span>
              <span className="flex items-center gap-1">
                <GiPathDistance />
                {run.distance} mi
              </span>
              <span className="flex items-center gap-1">
                <FaClock />
                {run.duration}
              </span>
              <span className="flex items-center gap-1">
                <FaStopwatch />
                {run.pace} mi/min
              </span>
              <span className="flex items-center gap-1">
                <FaHeartPulse />
                {run.heartRateAverage}
              </span>
            </div>
          ))}
        </div>

        <div>
          <h3>Blood Pressure Reading</h3>
          {bloodPressureReadings?.map((bloodPressureReading) => (
            <div key={bloodPressureReading.id} className="rounded border px-2">
              <span className="flex items-center gap-2">
                {/* <FaClock /> */}
                <h4>{format(bloodPressureReading.date, yyyyMMddHyphenated)}</h4>
              </span>
              <span className="flex items-center gap-2">
                <GiHearts />
                {bloodPressureReading.systolic}
              </span>
              <span className="flex items-center gap-1">
                <GiNestedHearts />
                {bloodPressureReading.diastolic}
              </span>
              <span className="flex items-center gap-2">
                <BsHeartPulseFill />
                {bloodPressureReading.pulse}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Outcomes;
