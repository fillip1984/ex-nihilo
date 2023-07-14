import { type TimelineEvent } from "~/types";

const OnCompleteModal = ({
  event,
  close,
}: {
  event: TimelineEvent;
  close: () => void;
}) => {
  return (
    <div className="fixed inset-0">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/30"
        aria-hidden="true"
        onClick={close}
      />

      <div>{event.onComplete}</div>
    </div>
  );
};

export default OnCompleteModal;
