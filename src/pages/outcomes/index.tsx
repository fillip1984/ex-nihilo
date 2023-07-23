import clsx from "clsx";
import { endOfWeek, format, startOfWeek } from "date-fns";
import Link from "next/link";
import { useState } from "react";
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
import LoadingErrorAndRetry from "~/components/shared/LoadingErrorAndRetry";
import { api } from "~/utils/api";
import { yyyyMMddHyphenated } from "~/utils/date";

const Outcomes = () => {
  const weighInsFilters = [{ label: "This week" }, { label: "Last 10" }];
  const [weighInsFilter, setWeighInsFilter] = useState(
    weighInsFilters[0]?.label
  );

  const runsFilters = [{ label: "This week" }, { label: "Last 10" }];
  const [runsFilter, setRunsFilter] = useState(runsFilters[0]?.label);

  const bloodPressureReadingsFilters = [
    { label: "This week" },
    { label: "Last 10" },
  ];
  const [bloodPressureReadingsFilter, setBloodPressureReadingsFilter] =
    useState(bloodPressureReadingsFilters[0]?.label);

  const { data: weighIns } = api.weighIns.readAll.useQuery(
    {
      filter: weighInsFilter ?? "",
    },
    { enabled: !!weighInsFilter }
  );
  const { data: runs } = api.runs.readAll.useQuery(
    {
      filter: runsFilter ?? "",
    },
    { enabled: !!runsFilter }
  );
  const { data: bloodPressureReadings } =
    api.bloodPressureReadings.readAll.useQuery(
      {
        filter: bloodPressureReadingsFilter ?? "",
      },
      { enabled: !!bloodPressureReadingsFilter }
    );

  const [start] = useState(startOfWeek(new Date()));
  const [end] = useState(endOfWeek(new Date()));

  const {
    data: routineOutcomes,
    isLoading,
    isError,
    refetch,
  } = api.activities.readAll.useQuery({
    start,
    end,
  });

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

      {(isLoading || isError) && (
        <LoadingErrorAndRetry
          isLoading={isLoading}
          isError={isError}
          retry={() => void refetch()}
        />
      )}

      {!isLoading && !isError && routineOutcomes && (
        <div className="mb-6">
          <div className="mb-4">
            <h3>Routine Outcomes</h3>
            <p className="text-sm">
              For week: {format(start, yyyyMMddHyphenated)} to{" "}
              {format(end, yyyyMMddHyphenated)}
            </p>
          </div>
          <div className="flex flex-col gap-3">
            {routineOutcomes.map((routineOutcome) => (
              <div
                key={routineOutcome.id}
                className="rounded-lg bg-white/10 p-2">
                <h4>{routineOutcome.name}</h4>
                <p className="text-sm">{routineOutcome.description}</p>
                <div className="my-2 flex w-full justify-around gap-2">
                  <div className="flex w-1/4 flex-col items-center rounded bg-slate-400 p-4">
                    <span>Pending</span>
                    <span className="text-4xl">
                      {
                        routineOutcome.activities.filter(
                          (act) => !act.skip && !act.complete
                        ).length
                      }
                    </span>
                  </div>
                  <div className="flex w-1/4 flex-col items-center rounded bg-green-500/70 p-4">
                    <span>Complete</span>
                    <span className="text-4xl">
                      {
                        routineOutcome.activities.filter((act) => act.complete)
                          .length
                      }
                    </span>
                  </div>
                  <div className="flex w-1/4 flex-col items-center rounded bg-red-500/70 p-4">
                    <span>Skipped</span>
                    <span className="text-4xl">
                      {
                        routineOutcome.activities.filter((act) => act.skip)
                          .length
                      }
                    </span>
                  </div>
                  <div className="flex w-1/4 flex-col items-center rounded bg-black p-4">
                    <span>Total</span>
                    <span className="text-4xl">
                      {routineOutcome.activities.length}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-col gap-4">
        <div>
          <h3>Weigh ins</h3>
          <div className="my-2 flex gap-2">
            {weighInsFilters.map((weighInFilterOption) => (
              <button
                key={weighInFilterOption.label}
                type="button"
                onClick={() => setWeighInsFilter(weighInFilterOption.label)}
                className={clsx("rounded px-4 py-2", {
                  "bg-slate-400 text-slate-800":
                    weighInFilterOption.label === weighInsFilter,
                  "border border-slate-400 text-slate-400":
                    weighInFilterOption.label !== weighInsFilter,
                })}>
                {weighInFilterOption.label}
              </button>
            ))}
          </div>
          <div className="flex flex-col gap-2">
            {weighIns?.length === 0 && (
              <p className="text-center">No results</p>
            )}
            {weighIns?.map((weighIn) => (
              <div key={weighIn.id} className="rounded border p-2">
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
        </div>
        <div>
          <h3>Runs</h3>
          <div className="my-2 flex gap-2">
            {runsFilters.map((runFilterOption) => (
              <button
                key={runFilterOption.label}
                type="button"
                onClick={() => setRunsFilter(runFilterOption.label)}
                className={clsx("rounded px-4 py-2", {
                  "bg-slate-400 text-slate-800":
                    runFilterOption.label === runsFilter,
                  "border border-slate-400 text-slate-400":
                    runFilterOption.label !== runsFilter,
                })}>
                {runFilterOption.label}
              </button>
            ))}
          </div>
          <div className="flex flex-col gap-2">
            {runs?.length === 0 && <p className="text-center">No results</p>}
            {runs?.map((run) => (
              <div key={run.id} className="rounded border p-2">
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
        </div>
        <div>
          <h3>Blood Pressure Readings</h3>
          <div className="my-2 flex gap-2">
            {bloodPressureReadingsFilters.map(
              (bloodPressureReadingsFilterOption) => (
                <button
                  key={bloodPressureReadingsFilterOption.label}
                  type="button"
                  onClick={() =>
                    setBloodPressureReadingsFilter(
                      bloodPressureReadingsFilterOption.label
                    )
                  }
                  className={clsx("rounded px-4 py-2", {
                    "bg-slate-400 text-slate-800":
                      bloodPressureReadingsFilterOption.label ===
                      bloodPressureReadingsFilter,
                    "border border-slate-400 text-slate-400":
                      bloodPressureReadingsFilterOption.label !==
                      bloodPressureReadingsFilter,
                  })}>
                  {bloodPressureReadingsFilterOption.label}
                </button>
              )
            )}
          </div>
          <div className="flex flex-col gap-2">
            {bloodPressureReadings?.length === 0 && (
              <p className="text-center">No results</p>
            )}
            {bloodPressureReadings?.map((bloodPressureReading) => (
              <div key={bloodPressureReading.id} className="rounded border p-2">
                <span className="flex items-center gap-2">
                  {/* <FaClock /> */}
                  <h4>
                    {format(bloodPressureReading.date, yyyyMMddHyphenated)}
                  </h4>
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
    </div>
  );
};

export default Outcomes;
