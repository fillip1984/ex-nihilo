import { Dialog } from "@headlessui/react";
import { useState, type Dispatch, type SetStateAction } from "react";
import { BiBed } from "react-icons/bi";
import { BsHouse, BsSunrise, BsSunset, BsTrash } from "react-icons/bs";
import { FaBed, FaBrain, FaRunning, FaToilet } from "react-icons/fa";
import {
  GiForkKnifeSpoon,
  GiGrass,
  GiIonicColumn,
  GiPerspectiveDiceSixFacesRandom,
} from "react-icons/gi";
import { GrStatusUnknown } from "react-icons/gr";
import {
  MdOutlineCleaningServices,
  MdOutlineLocalLaundryService,
} from "react-icons/md";
import { PiTelevisionThin } from "react-icons/pi";

const iconOptions = [
  { name: "Bed", value: "BiBed", icon: <BiBed /> },
  { name: "House", value: "BsHouse", icon: <BsHouse /> },
  { name: "Trash", value: "BsTrash", icon: <BsTrash /> },
  { name: "Bed", value: "FaBed", icon: <FaBed /> },
  { name: "Brain", value: "FaBrain", icon: <FaBrain /> },
  { name: "Running", value: "FaRunning", icon: <FaRunning /> },
  { name: "Sunrise", value: "BsSunrise", icon: <BsSunrise /> },
  { name: "Sunset", value: "BsSunset", icon: <BsSunset /> },
  { name: "Toilet", value: "FaToilet", icon: <FaToilet /> },
  { name: "Silverware", value: "GiForkKnifeSpoon", icon: <GiForkKnifeSpoon /> },
  { name: "Grass", value: "GiGrass", icon: <GiGrass /> },
  { name: "TV", value: "PiTelevisionThin", icon: <PiTelevisionThin /> },
  { name: "Column", value: "GiIonicColumn", icon: <GiIonicColumn /> },
  {
    name: "Unknown",
    value: "GiPerspectiveDiceSixFacesRandom",
    icon: <GiPerspectiveDiceSixFacesRandom />,
  },
  {
    name: "Broom",
    value: "MdOutlineCleaningServices",
    icon: <MdOutlineCleaningServices />,
  },
  {
    name: "Laundry",
    value: "MdOutlineLocalLaundryService",
    icon: <MdOutlineLocalLaundryService />,
  },
];

export const retrieveIcon = (iconValue: string) => {
  const retrievedIcon = iconOptions.find((icon) => icon.value === iconValue);
  if (!retrievedIcon) {
    console.warn("Unable to find icon by value: ", iconValue);
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
  { name: "Yellow", value: "bg-yellow-400/60 text-yellow-300" },
];

export const retrieveColor = (colorName: string) => {
  const retrievedColor = colorOptions.find((color) => color.name === colorName);
  if (!retrievedColor) {
    return "";
  }

  return retrievedColor.value;
};

export const IconAvatar = ({
  iconValue,
  color,
}: {
  iconValue: string;
  color: string;
}) => {
  return (
    <span
      className={`flex h-12 w-12 items-center justify-center rounded-full text-2xl ${retrieveColor(
        color
      )}`}>
      {retrieveIcon(iconValue)}
    </span>
  );
};

// TODO: should probably swap to headless UI for this or use the native modal element
export const IconSearchModal = ({
  setSelectedIcon,
  isOpen,
  setIconSearchModalVisible,
}: {
  setSelectedIcon: Dispatch<SetStateAction<string>>;
  isOpen: boolean;
  setIconSearchModalVisible: Dispatch<SetStateAction<boolean>>;
}) => {
  const [iconSearch, setIconSearch] = useState("");

  const handleIconSelection = (selectedIconValue: string) => {
    setSelectedIcon(selectedIconValue);
    setIconSearchModalVisible(false);
  };
  return (
    <Dialog
      open={isOpen}
      onClose={() => setIconSearchModalVisible(false)}
      initialFocus={undefined}>
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
                  onClick={() => handleIconSelection(iconOption.value)}
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
    </Dialog>
  );
};

// TODO: should probably swap to headless UI for this or use the native modal element
export const ColorSearchModal = ({
  setSelectedColor,
  isOpen,
  setColorSearchModalVisible,
}: {
  setSelectedColor: Dispatch<SetStateAction<string>>;
  isOpen: boolean;
  setColorSearchModalVisible: Dispatch<SetStateAction<boolean>>;
}) => {
  const [colorSearch, setColorSearch] = useState("");

  const handleColorSelection = (selectedColorName: string) => {
    setSelectedColor(selectedColorName);
    setColorSearchModalVisible(false);
  };
  return (
    <Dialog
      open={isOpen}
      onClose={() => setColorSearchModalVisible(false)}
      initialFocus={undefined}>
      {/* The backdrop, rendered as a fixed sibling to the panel container */}
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

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
                colorOption.name
                  .toLowerCase()
                  .includes(colorSearch.toLowerCase())
              )
              .map((colorOption) => (
                <button
                  key={colorOption.name}
                  type="button"
                  onClick={() => handleColorSelection(colorOption.name)}
                  className={`flex h-[90px] w-[90px] flex-col items-center justify-center rounded border border-white p-4 hover:opacity-90 ${colorOption.value}`}>
                  {colorOption.name}
                </button>
              ))}
          </div>
        </div>
        <div
          onClick={() => setColorSearchModalVisible(false)}
          className="backdrop fixed inset-0 z-[998] bg-slate-200/40 backdrop-blur"></div>
      </div>
    </Dialog>
  );
};
