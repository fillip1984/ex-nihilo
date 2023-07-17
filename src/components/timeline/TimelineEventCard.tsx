import { format, formatDuration, isEqual } from "date-fns";
import { BiCategory } from "react-icons/bi";
import { BsBodyText, BsHeartPulseFill } from "react-icons/bs";
import {
  FaChevronDown,
  FaClock,
  FaRegClock,
  FaStopwatch,
} from "react-icons/fa";
import { MdCheck, MdNotInterested } from "react-icons/md";

import { useAutoAnimate } from "@formkit/auto-animate/react";
import { useState } from "react";
import {
  FaFlagCheckered,
  FaHeartPulse,
  FaRegNoteSticky,
} from "react-icons/fa6";
import {
  GiBiceps,
  GiHearts,
  GiNestedHearts,
  GiPathDistance,
} from "react-icons/gi";
import { IoScaleOutline } from "react-icons/io5";
import { type TimelineEvent } from "~/types";
import { api } from "~/utils/api";
import { HH_mm_aka24hr } from "~/utils/date";
import { IconAvatar } from "../topics/IconsAndColorHelpers";

const TimelineEventCard = ({
  event,
  handleOnComplete,
}: {
  event: TimelineEvent;
  handleOnComplete: (event: TimelineEvent) => void;
}) => {
  const utils = api.useContext();

  const [cardAnimations] = useAutoAnimate();
  const [showDetails, setShowDetails] = useState(false);

  const { mutate: completeAct, isLoading: isCompleting } =
    api.activities.complete.useMutation({
      onSuccess: async () => {
        await utils.timeline.invalidate();
        await utils.activities.invalidate();
      },
    });
  const { mutate: skipAct, isLoading: isSkipping } =
    api.activities.skip.useMutation({
      onSuccess: async () => {
        await utils.timeline.invalidate();
        await utils.activities.invalidate();
      },
    });
  const isMutating = isCompleting || isSkipping;

  const handleComplete = (id: string) => {
    switch (event.onComplete) {
      case "SIMPLE":
        completeAct({ id });
        return;
      case "NOTE":
      case "WEIGH_IN":
      case "RUNNERS_LOG":
      case "BLOOD_PRESSURE_READING":
        handleOnComplete(event);
        return;
      default:
        throw new Error(
          // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
          "Unable to handle onComplete value: " + event.onComplete
        );
    }
  };

  const handleSkip = (id: string) => {
    skipAct({ id });
  };
  return (
    <>
      <div className="flex flex-col">
        <div className="flex gap-3 rounded-t-lg bg-white/10 p-2 transition duration-300 ease-in-out hover:bg-white/20">
          <IconAvatar iconValue={event.icon} color={event.color} />
          <div ref={cardAnimations} className="flex w-full flex-col">
            <div className="flex items-center justify-between">
              <b>{event.name}</b>
              <button
                onClick={() => setShowDetails((prev) => !prev)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-400">
                <FaChevronDown
                  className={`text-xl transition-transform duration-300 ${
                    showDetails ? "rotate-180" : ""
                  }`}
                />
              </button>
            </div>
            <p className="flex items-center gap-2 text-sm">
              <FaRegClock />
              {format(event.start, HH_mm_aka24hr)}
              {event.end && !isEqual(event.start, event.end)
                ? " - " + format(event.end, HH_mm_aka24hr)
                : ""}
            </p>

            {event.complete && event.run && (
              <div className="my-2 flex items-center gap-2">
                <FaFlagCheckered />
                <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                  <span className="flex items-center gap-1">
                    <GiPathDistance />
                    {event.run.distance} mi
                  </span>
                  <span className="flex items-center gap-1">
                    <FaClock />
                    {event.run.duration}
                  </span>
                  <span className="flex items-center gap-1">
                    <FaStopwatch />
                    {event.run.pace} mi/min
                  </span>
                  <span className="flex items-center gap-1">
                    <FaHeartPulse />
                    {event.run.heartRateAverage}
                  </span>
                </div>
              </div>
            )}

            {event.complete && event.weighIn && (
              <div className="my-2 flex items-center gap-2">
                <FaFlagCheckered />
                <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                  <span className="flex items-center gap-1">
                    <IoScaleOutline />
                    {event.weighIn.weight} lbs
                  </span>
                  {event.weighIn.bodyFatPercentage && (
                    <span className="flex items-center gap-1">
                      <GiBiceps /> {event.weighIn.bodyFatPercentage} %
                    </span>
                  )}
                </div>
              </div>
            )}

            {event.complete && event.bloodPressureReading && (
              <div className="my-2 flex items-center gap-2">
                <FaFlagCheckered />
                <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                  <span className="flex items-center gap-1">
                    <GiHearts />
                    {event.bloodPressureReading.systolic}
                  </span>
                  <span className="flex items-center gap-1">
                    <GiNestedHearts />
                    {event.bloodPressureReading.diastolic}
                  </span>
                  {event.bloodPressureReading.pulse && (
                    <span className="flex items-center gap-1">
                      <BsHeartPulseFill /> {event.bloodPressureReading.pulse}
                    </span>
                  )}
                </div>
              </div>
            )}

            {event.complete && event.note && (
              <div className="my-2 flex items-center gap-2">
                <FaFlagCheckered />
                <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                  <span className="flex items-center gap-1">
                    <FaRegNoteSticky />
                    {event.note.content}
                  </span>
                </div>
              </div>
            )}

            {showDetails && (
              <div>
                <div className="mt-2 flex flex-col gap-1 text-sm text-gray-400">
                  <p className="flex items-center gap-2">
                    <BsBodyText />
                    {event.description}
                  </p>
                  <p className="flex items-center gap-2">
                    <BiCategory />
                    {event.topicName}
                  </p>

                  {event.type !== "Suninfo" && (
                    <p className="flex items-center gap-2">
                      <FaStopwatch />
                      {formatDuration(event.duration, {
                        format: [
                          "years",
                          "months",
                          "weeks",
                          "days",
                          "hours",
                          "minutes",
                        ],
                      })}
                      <span className="text-xs">(Duration)</span>
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {event.type === "Suninfo" && (
          <div className="flex items-center justify-between rounded-b-lg bg-white/20 p-2">
            <p className="text-xs sm:text-sm">
              Day time:{" "}
              {formatDuration(event.duration, {
                format: [
                  "years",
                  "months",
                  "weeks",
                  "days",
                  "hours",
                  "minutes",
                ],
              })}
            </p>
            <a
              href="https://sunrise-sunset.org/"
              target="_blank"
              className="rounded bg-gradient-to-r from-yellow-600 to-slate-400 px-2 py-1 text-xs sm:text-sm">
              sunrise-sunset.org
            </a>
          </div>
        )}

        {event.type !== "Suninfo" &&
          event.complete === false &&
          event.skip === false && (
            <div className="flex rounded-b-lg bg-white/20 text-3xl">
              <button
                type="button"
                onClick={() => handleComplete(event.id)}
                className="flex flex-1 items-center justify-center gap-2 border-r border-r-slate-500 text-green-400 transition-colors duration-300 hover:text-green-500"
                disabled={event.complete || event.skip || isMutating}>
                <MdCheck className={`${isCompleting ? "animate-pulse" : ""}`} />
              </button>
              <button
                type="button"
                onClick={() => handleSkip(event.id)}
                className="flex flex-1 items-center justify-center gap-2 py-1 text-red-400 transition-colors duration-300 hover:text-red-500"
                disabled={event.complete || event.skip || isMutating}>
                <MdNotInterested
                  className={`${isSkipping ? "animate-pulse" : ""}`}
                />
              </button>
            </div>
          )}

        {event.type !== "Suninfo" && (event.complete || event.skip) && (
          <div className="flex rounded-b-lg bg-white/20 text-3xl">
            {event.completedAt && (
              <button
                type="button"
                className="flex flex-1 items-center justify-center gap-2 text-green-400 transition-colors duration-300 hover:text-green-500"
                disabled={event.complete || event.skip || isMutating}>
                <MdCheck />
                <span className="text-sm">
                  Completed:{" "}
                  {Intl.DateTimeFormat("en-US", {
                    dateStyle: "short",
                    timeStyle: "short",
                  }).format(event.completedAt)}
                </span>
              </button>
            )}
            {event.skip && (
              <button
                type="button"
                className="flex flex-1 items-center justify-center gap-2 py-1 text-red-400 transition-colors duration-300 hover:text-red-500"
                disabled={event.complete || event.skip || isMutating}>
                <MdNotInterested />
                <span className="text-sm">
                  Skipped:{" "}
                  {Intl.DateTimeFormat("en-US", {
                    dateStyle: "short",
                    timeStyle: "short",
                  }).format(event.activity?.updatedAt)}
                </span>
              </button>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default TimelineEventCard;
