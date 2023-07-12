import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { toast } from "react-hot-toast";
import { BsGeoAlt, BsRepeat } from "react-icons/bs";
import LoadingErrorAndRetry from "~/components/shared/LoadingErrorAndRetry";
import { preferencesFormSchema, type PreferencesFormSchemaType } from "~/types";
import { api } from "~/utils/api";

const Preferences = () => {
  const router = useRouter();

  // read data stuff
  const {
    data: preferences,
    isLoading,
    isError,
    refetch,
  } = api.preferences.read.useQuery(undefined, {
    refetchOnWindowFocus: false,
  });
  const { register, reset, setValue, handleSubmit } =
    useForm<PreferencesFormSchemaType>({
      resolver: zodResolver(preferencesFormSchema),
    });
  useEffect(() => {
    if (preferences) {
      reset({
        latitude: preferences.latitude,
        longitude: preferences.longitude,
      });
    }
  }, [preferences, reset]);

  // change/mutate stuff
  const utils = api.useContext();
  const { mutate: savePreferences } = api.preferences.save.useMutation({
    onSuccess: async () => {
      await utils.preferences.invalidate();
      await utils.activities.invalidate();
      toast.success("Preferences updated");
    },
  });
  const onSubmit: SubmitHandler<PreferencesFormSchemaType> = (formData) => {
    savePreferences({ ...formData });
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      console.error("Your browser does not support geolocation");
    }
    navigator.geolocation.getCurrentPosition(
      (position: GeolocationPosition) => {
        console.log(`Success! Accuracy: ${position.coords.accuracy}`);
        setValue("latitude", position.coords.latitude);
        setValue("longitude", position.coords.longitude);
      },
      () => {
        console.error("Failed!?");
      }
    );
  };

  const handleRebuildActivities = () => {
    console.log("rebuilding activities");
    createActivities.mutate();
  };

  const createActivities = api.activities.rebuild.useMutation({
    onSuccess: async () => {
      await utils.activities.invalidate();
      void router.push("/");
    },
  });

  return (
    <div className="form-container mx-auto flex w-full flex-col gap-2 px-4 md:w-2/3 lg:w-1/2 xl:w-1/3">
      <div className="py-4">
        <h2>Preferences</h2>
      </div>

      {(isLoading || isError) && (
        <LoadingErrorAndRetry
          isLoading={isLoading}
          isError={isError}
          retry={() => void refetch()}
        />
      )}

      {!isLoading && !isError && preferences && (
        <div className="flex flex-col gap-2">
          <form
            // eslint-disable-next-line @typescript-eslint/no-misused-promises
            onSubmit={handleSubmit(onSubmit)}
            noValidate>
            <div className="form-card rounded-lg bg-slate-300 p-2 text-slate-700">
              <div className="form-card-title flex items-center gap-2 py-2 text-2xl">
                <BsGeoAlt />
                <span className="uppercase">Location</span>
              </div>
              <div className="form-card-body flex flex-col gap-1 px-2">
                <p className="form-card-field-set-info text-sm">
                  Your location is used to fetch info such as sunrise/sunset
                  info
                </p>
                <div className="form-card-field-set grid grid-cols-3 items-center">
                  <label htmlFor="latitude">Latitude</label>
                  <input
                    type="number"
                    step={0.01}
                    id="latitude"
                    placeholder="Latitude formatted like 38.2527"
                    {...register("latitude", {
                      valueAsNumber: true,
                    })}
                    className="col-span-2"
                  />
                </div>
                <div className="form-card-field-set grid grid-cols-3 items-center">
                  <label htmlFor="longitude">Longitude</label>
                  <input
                    type="number"
                    step={0.01}
                    id="longitude"
                    placeholder="Longitude formatted like -85.7585"
                    {...register("longitude", {
                      valueAsNumber: true,
                    })}
                    className="col-span-2"
                  />
                </div>
              </div>
              <div className="flex justify-center py-2">
                <button
                  type="button"
                  onClick={handleUseCurrentLocation}
                  className="w-1/2 rounded-lg bg-slate-800 px-4 py-2 text-white">
                  Use my current location
                </button>
              </div>
              <div className="text-center">
                <b>Want to somewhat preserve your privacy?</b>
                <p>Provide only 2 numbers past the decimal</p>
                <a
                  target="_blank"
                  href="https://en.wikipedia.org/wiki/Decimal_degrees#Precision"
                  className="underline">
                  Explanation
                </a>
              </div>
            </div>

            <div className="form-fixed-button-group fixed bottom-0 left-0 right-0 z-50 flex h-16 border-t-4 border-t-white bg-slate-800">
              <Link
                href="/"
                className="btn-secondary flex w-full items-center justify-center text-2xl text-slate-300">
                Cancel
              </Link>
              <button
                type="submit"
                className="btn-primary w-full items-center justify-center bg-slate-300 text-2xl font-bold text-slate-700">
                Save
              </button>
            </div>
          </form>

          <div className="form-card rounded-lg bg-slate-300 p-2 text-slate-700">
            <div className="form-card-title flex items-center gap-2 py-2 text-2xl">
              <BsRepeat />
              <span className="uppercase">Routines and Topics</span>
            </div>
            Coming soon...
            {/* <div className="border-slate-400 p-2">
          <p>
            Rebuild activies -&gt; deletes and then recreates activities which
            feed your timeline.
          </p>
          <p>
            <b>ALL ACTIVITY HISTORY WILL BE LOST!</b>
          </p>
          <button
            onClick={handleRebuildActivities}
            className="my-2 rounded bg-red-600 px-4 py-2 font-bold text-white">
            Rebuild Activities
          </button> 
        </div>*/}
          </div>
        </div>
      )}
    </div>
  );
};

export default Preferences;
