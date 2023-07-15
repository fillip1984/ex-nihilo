import clsx from "clsx";
import { useEffect, useState } from "react";
import { AiOutlineClose } from "react-icons/ai";
import {
  FaRegFaceDizzy,
  FaRegFaceFrownOpen,
  FaRegFaceGrinStars,
  FaRegFaceMeh,
  FaRegFaceSmile,
} from "react-icons/fa6";
import {
  TiWeatherDownpour,
  TiWeatherSnow,
  TiWeatherSunny,
} from "react-icons/ti";
import { type TimelineEvent } from "~/types";

const OnCompleteModal = ({
  event,
  close,
}: {
  event: TimelineEvent;
  close: () => void;
}) => {
  const weatherOptions = [
    { label: "Cold", icon: <TiWeatherSnow /> },
    { label: "Rainy", icon: <TiWeatherDownpour /> },
    { label: "Fair", icon: <TiWeatherSunny /> },
    { label: "Hot", icon: <TiWeatherSunny /> },
  ];

  const moodOptions = [
    { label: "The worst", icon: <FaRegFaceDizzy /> },
    { label: "Not great", icon: <FaRegFaceFrownOpen /> },
    { label: "Okay", icon: <FaRegFaceMeh /> },
    { label: "Good", icon: <FaRegFaceSmile /> },
    { label: "Great", icon: <FaRegFaceGrinStars /> },
  ];

  const [selectedWeather, setSelectedWeather] = useState("");
  const [selectedMood, setSelectedMood] = useState("");

  const [isClosing, setIsClosing] = useState(false);
  useEffect(() => {
    if (isClosing) {
      setTimeout(() => close(), 150);
    }
  }, [isClosing, close]);

  return (
    <div className="relative">
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[998] bg-black/30 opacity-80 backdrop-blur"
        aria-hidden="true"
        onClick={() => setIsClosing(true)}
      />

      {/* Modal */}
      <div
        className={clsx(
          "fixed inset-2 z-[999] mx-auto w-[90%] animate-grow rounded-lg border border-slate-100 bg-slate-800 md:w-3/4 lg:w-1/2",
          { "animate-shrink": isClosing }
        )}>
        {/* title or headin */}
        <div className="flex items-center justify-between p-2">
          <h3>Running Log</h3>
          <button
            type="button"
            onClick={() => setIsClosing(true)}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-400/30">
            <AiOutlineClose />
          </button>
        </div>

        {/* body */}
        <div className="h-[90%] overflow-hidden">
          <div className="flex h-full flex-col gap-4 overflow-y-scroll p-4">
            <div className="flex flex-col gap-3">
              <h4>Run Details</h4>
              <div>
                <label>Date</label>
                <input type="date" />
              </div>
              <div>
                <label>Distance</label>
                <input type="text" placeholder="3.8 miles" />
              </div>
              <div>
                <label>Duration</label>
                <input type="text" placeholder="43:18" />
              </div>
              <div>
                <label>Pace</label>
                <input type="text" placeholder="12:23 min/mi" />
              </div>
              <div>
                <label>Heart rate average</label>
                <input type="text" placeholder="160 bpm" />
              </div>
            </div>
            <p>
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Eveniet
              modi ducimus vitae saepe aliquid nesciunt magni voluptatum quo
              iste! Optio magni earum perferendis tempora ipsam eum, culpa
              dolorum est, laboriosam temporibus nulla! Omnis explicabo vero
              provident animi deleniti cumque impedit qui tenetur excepturi
              facilis alias modi obcaecati, illo dolorem delectus quidem ipsa
              accusamus eveniet necessitatibus dolorum! Harum quod, a placeat
              minus veniam iusto. Qui facere minima perferendis sequi eius
              voluptatem nam rem autem suscipit, cumque temporibus doloremque
              sed, deleniti laborum blanditiis aliquam architecto ea itaque
              aspernatur iste assumenda quisquam sint consectetur. Explicabo
              soluta ducimus error. Repellat natus quia distinctio harum!
            </p>
            <div>
              <h4>Weather</h4>
              <div className="my-2 flex flex-wrap justify-center gap-2">
                {weatherOptions.map((weather) => (
                  <button
                    key={weather.label}
                    type="button"
                    onClick={() => setSelectedWeather(weather.label)}
                    className={clsx(
                      "flex h-16 w-20 flex-col items-center justify-center rounded-lg border border-slate-200 text-2xl transition-colors duration-200 ease-in-out",
                      {
                        "border-slate-600 bg-slate-100 text-slate-600":
                          selectedWeather === weather.label,
                      }
                    )}>
                    {weather.icon}
                    <span className="mt-1 text-xs">{weather.label}</span>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <h4>Mood</h4>
              <div className="my-2 flex flex-wrap justify-center gap-2">
                {moodOptions.map((mood) => (
                  <button
                    key={mood.label}
                    type="button"
                    onClick={() => setSelectedMood(mood.label)}
                    className={clsx(
                      "flex h-16 w-20 flex-col items-center justify-center rounded-lg border border-slate-200 text-2xl transition-colors duration-200 ease-in-out",
                      {
                        "border-slate-600 bg-slate-100 text-slate-600":
                          selectedMood === mood.label,
                      }
                    )}>
                    {mood.icon}
                    <span className="mt-1 text-xs">{mood.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* footer */}
      </div>
    </div>
  );
};

export default OnCompleteModal;
