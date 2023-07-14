import { format, formatDuration, isEqual } from "date-fns";
import { BiCategory } from "react-icons/bi";
import { BsBodyText } from "react-icons/bs";
import {
  FaCaretDown,
  FaChevronDown,
  FaRegClock,
  FaStopwatch,
} from "react-icons/fa";
import { MdCheck, MdNotInterested } from "react-icons/md";

import { type TimelineEvent } from "~/types";
import { api } from "~/utils/api";
import { HH_mm_aka24hr } from "~/utils/date";
import { IconAvatar } from "../topics/IconsAndColorHelpers";
import { useState } from "react";
import { useAutoAnimate } from "@formkit/auto-animate/react";

const TimelineEventCard = ({ event }: { event: TimelineEvent }) => {
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
    completeAct({ id });
  };

  const handleSkip = (id: string) => {
    skipAct({ id });
  };
  return (
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
        <div className="flex items-center justify-between rounded-b-lg bg-slate-700 p-2">
          <p>
            Day time:{" "}
            {formatDuration(event.duration, {
              format: ["years", "months", "weeks", "days", "hours", "minutes"],
            })}
          </p>
          <a
            href="https://sunrise-sunset.org/"
            target="_blank"
            className="rounded bg-gradient-to-r from-yellow-600 to-slate-400 px-2 py-1 text-sm">
            sunrise-sunset.org
          </a>
        </div>
      )}

      {event.type !== "Suninfo" &&
        event.complete !== null &&
        event.skip !== null && (
          <div className="flex rounded-b-lg bg-slate-700 text-3xl">
            <button
              type="button"
              onClick={() => handleComplete(event.id)}
              className={`flex flex-1 items-center justify-center gap-2 text-green-400 transition-colors duration-300 hover:text-green-500 ${
                event.skip
                  ? "border-b-lg hidden"
                  : "rounded-bl-lg border-r-2 border-r-slate-500 py-1"
              } `}
              disabled={event.complete || event.skip || isMutating}>
              <MdCheck className={`${isCompleting ? "animate-pulse" : ""}`} />
              {event.completedAt && (
                <span className="text-sm">
                  Completed:{" "}
                  {Intl.DateTimeFormat("en-US", {
                    dateStyle: "short",
                    timeStyle: "short",
                  }).format(event.completedAt)}
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={() => handleSkip(event.id)}
              className={`flex flex-1 items-center justify-center gap-2 py-1 text-red-400 transition-colors duration-300 hover:text-red-500 ${
                event.complete ? "border-b-lg hidden" : "rounded-br-lg"
              }`}
              disabled={event.complete || event.skip || isMutating}>
              <MdNotInterested
                className={`${isSkipping ? "animate-pulse" : ""}`}
              />
              {event.skip && (
                <span className="text-sm">
                  Skipped:{" "}
                  {Intl.DateTimeFormat("en-US", {
                    dateStyle: "short",
                    timeStyle: "short",
                  }).format(event.activity?.updatedAt)}
                </span>
              )}
            </button>
          </div>
        )}
    </div>
  );
};

export default TimelineEventCard;
