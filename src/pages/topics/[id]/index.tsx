import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { BsBodyText } from "react-icons/bs";
import { FaSearch } from "react-icons/fa";
import {
  ColorSearchModal,
  IconSearchModal,
  retrieveColor,
  retrieveIcon,
} from "~/components/IconsAndColorHelpers";
import { topicFormSchema, type TopicFormSchemaType } from "~/types";
import { api } from "~/utils/api";

const TopicDetails = () => {
  const router = useRouter();
  const { id } = router.query;
  const isNew = id === "new";

  const [iconSearchModalVisible, setIconSearchModalVisible] = useState(false);
  const [selectedIcon, setSelectedIcon] = useState("");
  const [colorSearchModalVisible, setColorSearchModalVisible] = useState(false);
  const [selectedColor, setSelectedColor] = useState("");

  // read stuff
  const { data: topic } = api.topics.readOne.useQuery(
    {
      id: id as string,
    },
    { enabled: !!id && !isNew, refetchOnWindowFocus: false }
  );
  const { register, reset, handleSubmit, setValue } =
    useForm<TopicFormSchemaType>({
      resolver: zodResolver(topicFormSchema),
    });
  useEffect(() => {
    if (topic) {
      reset({
        id: id as string,
        name: topic.name,
        description: topic.description,
        icon: topic.icon,
        color: topic.color,
      });
      setSelectedIcon(topic.icon);
      setSelectedColor(topic.color);
    }
  }, [topic, reset, id]);

  // mutate stuff
  const utils = api.useContext();
  const deleteTopic = api.topics.delete.useMutation({
    onSuccess: async () => {
      await utils.topics.invalidate();
      void router.push("/topics");
    },
  });

  const { mutate: updateTopic } = api.topics.update.useMutation({
    onSuccess: async () => {
      await utils.topics.invalidate();
      await router.push("/topics");
    },
  });

  const { mutate: createTopic } = api.topics.create.useMutation({
    onSuccess: async () => {
      await utils.topics.invalidate();
      void router.push("/topics");
    },
  });

  const onSubmit: SubmitHandler<TopicFormSchemaType> = (formData) => {
    if (isNew) {
      createTopic({ ...formData });
    } else {
      updateTopic({ ...formData });
    }
  };

  const handleDelete = () => {
    deleteTopic.mutate({ id: id as string });
  };

  const handleIconSearch = () => {
    setIconSearchModalVisible((prev) => !prev);
  };
  useEffect(() => {
    if (selectedIcon) {
      setValue("icon", selectedIcon);
    }
  }, [selectedIcon, setValue]);

  const handleColorSearch = () => {
    setColorSearchModalVisible((prev) => !prev);
  };
  useEffect(() => {
    if (selectedColor) {
      setValue("color", selectedColor);
    }
  }, [selectedColor, setValue]);

  return (
    <div className="form-container mx-auto w-full px-4 md:w-2/3 lg:w-1/2 xl:w-1/3">
      <form
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        onSubmit={handleSubmit(onSubmit)}
        className="mx-4 flex flex-col gap-2 pt-8">
        <div className="form-card rounded-lg bg-slate-300 p-2 text-slate-700">
          <div className="form-card-title flex items-center gap-2 py-2 text-2xl">
            <BsBodyText />
            <span className="uppercase">INFO</span>
          </div>
          <div className="form-card-field-set space-y-1 px-2">
            <input type="text" placeholder="Name" {...register("name")} />
            <textarea placeholder="Details" {...register("description")} />
          </div>
          <div className="grid grid-cols-5 items-center gap-2 space-y-1 px-2">
            <label>Icon</label>
            <button
              type="button"
              onClick={handleIconSearch}
              className="col-span-2 col-start-4 flex items-center justify-center rounded border border-black bg-white p-4">
              {selectedIcon ? retrieveIcon(selectedIcon) : <FaSearch />}
            </button>
          </div>
          <div className="grid grid-cols-5 items-center gap-2 space-y-1 px-2">
            <label>Color</label>
            <button
              type="button"
              onClick={handleColorSearch}
              className={`col-span-2 col-start-4 flex items-center justify-center rounded border border-black p-4 ${
                selectedColor
                  ? retrieveColor(selectedColor)
                  : "bg-white text-black"
              }`}>
              {selectedColor ? (
                <b className="text-white">{selectedColor}</b>
              ) : (
                <FaSearch />
              )}
            </button>
          </div>
          {/* <div className="grid grid-cols-5 items-center gap-2 space-y-1 px-2">
            <label>Icon</label>
            <select className="col-span-3 col-start-3" {...register("icon")}>
              <option value=""></option>
              {icons.map((icon) => (
                <option key={icon.label} value={icon.value}>
                  {icon.label}
                </option>
              ))}
            </select>
          </div>
          <div className="my-1 grid grid-cols-5 items-center gap-2 px-2">
            <label>Color</label>
            <select className="col-span-2 col-start-4" {...register("color")}>
              <option value=""></option>
              {colors.map((color) => (
                <option key={color.label} value={color.value}>
                  {color.label}
                </option>
              ))}
            </select>
          </div> */}
        </div>

        {!isNew && (
          <div className="flex items-center justify-center">
            <button
              type="button"
              onClick={handleDelete}
              className="my-4 flex w-1/2 items-center justify-center gap-1 rounded bg-red-600 px-4 py-2 text-2xl text-black">
              Delete
            </button>
          </div>
        )}
        {/* <div className="mt-4 flex justify-between p-4"> */}
        <div className="fixed bottom-0 left-0 right-0 z-50 flex h-16 border-t-4 border-t-white bg-slate-800">
          <Link
            href="/topics"
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

      {/* TODO: would be nice if this covered nav and buttons */}
      {iconSearchModalVisible && (
        <IconSearchModal
          setSelectedIcon={setSelectedIcon}
          setIconSearchModalVisible={setIconSearchModalVisible}
        />
      )}

      {/* TODO: would be nice if this covered nav and buttons */}
      {colorSearchModalVisible && (
        <ColorSearchModal
          setSelectedColor={setSelectedColor}
          setColorSearchModalVisible={setColorSearchModalVisible}
        />
      )}
    </div>
  );
};

export default TopicDetails;
