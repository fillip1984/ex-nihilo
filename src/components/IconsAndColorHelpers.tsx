import { useState, type Dispatch, type SetStateAction } from "react";
import { BiBed } from "react-icons/bi";
import { BsSunrise, BsSunset, BsTrash } from "react-icons/bs";
import { FaBed, FaBrain, FaRunning, FaToilet } from "react-icons/fa";
import {
  GiForkKnifeSpoon,
  GiGrass,
  GiIonicColumn,
  GiPerspectiveDiceSixFacesRandom,
} from "react-icons/gi";
import { GrMonitor, GrStatusUnknown } from "react-icons/gr";
import {
  MdOutlineCleaningServices,
  MdOutlineLocalLaundryService,
} from "react-icons/md";

export const iconOptions = [
  { name: "BiBed", icon: <BiBed /> },
  { name: "BsTrash", icon: <BsTrash /> },
  { name: "FaBed", icon: <FaBed /> },
  { name: "FaBrain", icon: <FaBrain /> },
  { name: "FaRunning", icon: <FaRunning /> },
  { name: "BsSunrise", icon: <BsSunrise /> },
  { name: "BsSunset", icon: <BsSunset /> },
  { name: "FaToilet", icon: <FaToilet /> },
  { name: "GiForkKnifeSpoon", icon: <GiForkKnifeSpoon /> },
  { name: "GiGrass", icon: <GiGrass /> },
  { name: "GrMonitor", icon: <GrMonitor /> },
  { name: "GiIonicColumn", icon: <GiIonicColumn /> },
  {
    name: "GiPerspectiveDiceSixFacesRandom",
    icon: <GiPerspectiveDiceSixFacesRandom />,
  },
  { name: "MdOutlineCleaningServices", icon: <MdOutlineCleaningServices /> },
  {
    name: "MdOutlineLocalLaundryService",
    icon: <MdOutlineLocalLaundryService />,
  },
];

export const retrieveIcon = (iconName: string) => {
  const retrievedIcon = iconOptions.find((icon) => icon.name === iconName);
  if (!retrievedIcon) {
    return <GrStatusUnknown />;
  }
  return retrievedIcon.icon;
};

export const colorOptions = [
  { name: "Blue", value: "bg-sky-300/60 text-sky-200" },
  { name: "Fuchsia", value: "bg-fuchsia-300/60 text-fuchsia-200" },
  { name: "Green", value: "bg-green-300/60 text-green-200" },
  { name: "Indigo", value: "bg-indigo-300/60 text-indigo-200" },
  { name: "Orange", value: "bg-orange-300/60 text-orange-200" },
  { name: "Red", value: "bg-red-400/60 text-red-300" },
];

export const retrieveColor = (colorName: string) => {
  console.log(colorName);

  const retrievedColor = colorOptions.find((color) => color.name === colorName);
  if (!retrievedColor) {
    return "";
  }

  return retrievedColor.value;
};

// TODO: should probably swap to headless UI for this or use the native modal element
export const IconSearchModal = ({
  setSelectedIcon,
  setIconSearchModalVisible,
}: {
  setSelectedIcon: Dispatch<SetStateAction<string>>;
  setIconSearchModalVisible: Dispatch<SetStateAction<boolean>>;
}) => {
  const [iconSearch, setIconSearch] = useState("");

  const handleIconSelection = (selectedIconName: string) => {
    setSelectedIcon(selectedIconName);
    setIconSearchModalVisible(false);
  };
  return (
    <div className="modal-and-backdrop-container fixed inset-0">
      <div className="modal fixed inset-20 z-[999] rounded-lg bg-slate-900 p-2 text-white">
        <input
          type="search"
          value={iconSearch}
          onChange={(e) => setIconSearch(e.target.value)}
          placeholder="search for icons"
          className=""
        />
        <div className="flex flex-wrap justify-center gap-2 overflow-scroll p-4 pb-24">
          {iconOptions
            .filter((iconOption) =>
              iconOption.name.toLowerCase().includes(iconSearch.toLowerCase())
            )
            .map((iconOption) => (
              <button
                key={iconOption.name}
                type="button"
                onClick={() => handleIconSelection(iconOption.name)}
                className="flex h-[90px] w-[90px] flex-col items-center overflow-hidden rounded border border-white p-4 text-2xl hover:bg-slate-300/40">
                {iconOption.icon}
                <p className="mt-1 text-xs">{iconOption.name}</p>
              </button>
            ))}
        </div>
      </div>
      <div
        onClick={() => setIconSearchModalVisible(false)}
        className="backdrop fixed inset-0 z-[998] bg-slate-200/40 backdrop-blur"></div>
    </div>
  );
};

// TODO: should probably swap to headless UI for this or use the native modal element
export const ColorSearchModal = ({
  setSelectedColor,
  setColorSearchModalVisible,
}: {
  setSelectedColor: Dispatch<SetStateAction<string>>;
  setColorSearchModalVisible: Dispatch<SetStateAction<boolean>>;
}) => {
  const [colorSearch, setColorSearch] = useState("");

  const handleColorSelection = (selectedColorName: string) => {
    setSelectedColor(selectedColorName);
    setColorSearchModalVisible(false);
  };
  return (
    <div className="modal-and-backdrop-container fixed inset-0">
      <div className="modal fixed inset-20 z-[999] rounded-lg bg-slate-900 p-2 text-white">
        <input
          type="search"
          value={colorSearch}
          onChange={(e) => setColorSearch(e.target.value)}
          placeholder="search for colors"
          className=""
        />
        <div className="flex flex-wrap justify-center gap-2 overflow-auto p-4">
          {colorOptions
            .filter((colorOption) =>
              colorOption.name.toLowerCase().includes(colorSearch.toLowerCase())
            )
            .map((colorOption) => (
              <button
                key={colorOption.name}
                type="button"
                onClick={() => handleColorSelection(colorOption.name)}
                className={`flex h-[90px] w-[90px] flex-col items-center overflow-hidden rounded border border-white p-4 text-2xl hover:opacity-90 ${colorOption.value}`}>
                {colorOption.name}
              </button>
            ))}
        </div>
      </div>
      <div
        onClick={() => setColorSearchModalVisible(false)}
        className="backdrop fixed inset-0 z-[998] bg-slate-200/40 backdrop-blur"></div>
    </div>
  );
};
