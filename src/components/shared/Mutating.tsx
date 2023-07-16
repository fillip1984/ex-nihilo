import { FaCircleNotch } from "react-icons/fa";

const Mutating = () => {
  return (
    <div className="flex h-full items-center justify-center">
      <FaCircleNotch className="animate-spin text-8xl" />

      {/* {isError && (
        <div>
          <h2 className="flex items-center justify-center gap-2 uppercase">
            <FaExclamationTriangle /> error
          </h2>
          <div className="my-8">
            <p>An occurred has occurred, would you like to try?</p>
            <button
              type="button"
              onClick={retry}
              className="mt-1 w-full rounded bg-slate-400 px-4 py-2 text-3xl">
              Retry
            </button>
          </div>
        </div>
      )} */}
    </div>
  );
};

export default Mutating;
