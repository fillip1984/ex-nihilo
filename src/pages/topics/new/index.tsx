import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/router";
import { useForm, type SubmitHandler } from "react-hook-form";
import { BsBodyText } from "react-icons/bs";
import { topicFormSchema, type TopicFormSchemaType } from "~/types";

import { api } from "~/utils/api";

const NewTopic = () => {
  const router = useRouter();

  const { register, handleSubmit } = useForm<TopicFormSchemaType>({
    resolver: zodResolver(topicFormSchema),
  });

  const icons = [
    { label: "Running", value: "FaRunning" },
    { label: "Wake up/Go to sleep", value: "FaBed" },
    { label: "Cleaning", value: "MdOutlineCleaningServices" },
  ];

  const colors = [
    { label: "Green", value: "bg-green-300/60 text-green-200" },
    { label: "Orange", value: "bg-orange-300/60 text-orange-200" },
    { label: "Red", value: "bg-red-400/60 text-red-300" },
  ];

  const utils = api.useContext();
  const createTopic = api.topics.create.useMutation({
    onSuccess: async () => {
      await utils.topics.invalidate();
      void router.push("/topics");
    },
  });

  const onSubmit: SubmitHandler<TopicFormSchemaType> = (formData) => {
    createTopic.mutate({ ...formData });
  };

  return (
    <div className="form-container mx-auto w-full px-4 md:w-2/3 lg:w-1/2 xl:w-1/3">
      <form
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-2 pt-8">
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
            <select className="col-span-2 col-start-4" {...register("icon")}>
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
          </div>
        </div>

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
    </div>
  );
};

export default NewTopic;
