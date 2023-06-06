import { useAutoAnimate } from "@formkit/auto-animate/react";
import { format } from "date-fns";
import Link from "next/link";
import { useState } from "react";
import {
  BsBodyText,
  BsChevronBarDown,
  BsChevronDown,
  BsClock,
  BsGeoAlt,
  BsRepeat,
} from "react-icons/bs";

const NewRoutine = () => {
  const [repeatsAnimation] = useAutoAnimate();
  const [specificLocationAnimation] = useAutoAnimate();
  const [repeats, setRepeats] = useState(false);
  const [specificLocation, setSpecificLocation] = useState(false);

  return (
    <form className="mx-4 flex flex-col gap-2 pt-8">
      <div className="form-card rounded-lg bg-slate-300 p-2 text-slate-700">
        <div className="form-card-title flex items-center gap-2 py-2 text-2xl">
          <BsBodyText />
          <span className="uppercase">INFO</span>
        </div>
        <div className="form-card-field-set space-y-1">
          <input type="text" placeholder="Summary" />
          <textarea placeholder="Details" />
        </div>
      </div>

      <div className="form-card rounded-lg bg-slate-300 p-2 text-slate-700">
        <div className="form-card-title flex items-center gap-2 py-2 text-2xl">
          <BsClock />
          <span className="uppercase">WHEN</span>
        </div>
        <div className="form-card-field-set space-y-1">
          <div className="grid grid-cols-5 items-center gap-2">
            <label>Starts</label>
            <input type="date" className="col-span-2" />
            <input type="time" className="col-span-2" />
          </div>
          <div className="grid grid-cols-5 items-center gap-2">
            <label>Ends</label>
            <input type="date" className="col-span-2" />
            <input type="time" className="col-span-2" />
          </div>
        </div>
      </div>

      <div
        ref={repeatsAnimation}
        className="form-card rounded-lg bg-slate-300 p-2 text-slate-700">
        <div
          onClick={() => setRepeats((prev) => !prev)}
          className="form-card-title flex items-center gap-2 py-2 text-2xl">
          <BsRepeat />
          <span className="uppercase">REPEAT</span>
          <div className="ml-auto flex h-8 w-8 items-center justify-center rounded-full border border-slate-900">
            <BsChevronDown
              className={`transition-transform duration-300 ${
                repeats ? "rotate-180" : ""
              }`}
            />
          </div>
        </div>

        {repeats && (
          <div className="form-card-field-set space-y-1">
            <div className="grid grid-cols-5 items-center gap-2">
              <label>Starts</label>
              <input type="date" className="col-span-2" />
              <input type="time" className="col-span-2" />
            </div>
            <div className="grid grid-cols-5 items-center gap-2">
              <label>Ends</label>
              <input type="date" className="col-span-2" />
              <input type="time" className="col-span-2" />
            </div>
          </div>
        )}
      </div>

      <div
        ref={specificLocationAnimation}
        className="form-card rounded-lg bg-slate-300 p-2 text-slate-700">
        <div
          onClick={() => setSpecificLocation((prev) => !prev)}
          className="form-card-title flex items-center gap-2 py-2 text-2xl">
          <BsGeoAlt />
          <span className="uppercase">WHERE</span>
          <div className="ml-auto flex h-8 w-8 items-center justify-center rounded-full border border-slate-900">
            <BsChevronDown
              className={`transition-transform duration-300 ${
                specificLocation ? "rotate-180" : ""
              }`}
            />
          </div>
        </div>

        {specificLocation && (
          <div className="form-card-field-set space-y-1">
            <div className="grid grid-cols-5 items-center gap-2">
              <label>Starts</label>
              <input type="date" className="col-span-2" />
              <input type="time" className="col-span-2" />
            </div>
            <div className="grid grid-cols-5 items-center gap-2">
              <label>Ends</label>
              <input type="date" className="col-span-2" />
              <input type="time" className="col-span-2" />
            </div>
          </div>
        )}
      </div>

      {/* <div className="mt-4 flex justify-between p-4"> */}
      <div className="fixed bottom-0 left-0 right-0 z-50 flex h-16 border-t-4 border-t-white bg-slate-800">
        <Link
          href="/"
          className="flex w-full items-center justify-center text-2xl text-slate-300">
          Cancel
        </Link>
        <button
          type="submit"
          className="w-full items-center justify-center bg-slate-300 text-2xl font-bold text-slate-700">
          Save
        </button>
      </div>
    </form>
  );
};

export default NewRoutine;
