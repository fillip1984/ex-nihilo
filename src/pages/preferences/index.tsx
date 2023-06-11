import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { BsGeoAlt } from "react-icons/bs";
import { preferencesFormSchema, type PreferencesFormSchemaType } from "~/types";
import { api } from "~/utils/api";

const Preferences = () => {
  const { data: preferences } = api.preferences.read.useQuery();

  const { register, reset, setValue } = useForm<PreferencesFormSchemaType>({
    resolver: zodResolver(preferencesFormSchema),
  });

  useEffect(() => {
    if (preferences) {
      reset({
        longitude: preferences.longitude,
        latitude: preferences.latitude,
      });
    }
  }, [preferences, reset]);

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      console.error("Your browser does not support geolocation");
    }
    // const { currentLong, currentLat } = position.coords;
    navigator.geolocation.getCurrentPosition(
      (position: GeolocationPosition) => {
        console.log(`Success! Accuracy: ${position.coords.accuracy}`);
        setValue("longitude", position.coords.longitude);
        setValue("latitude", position.coords.latitude);
      },
      () => {
        console.error("Failed!?");
      }
    );
  };

  return (
    <div className="form-container mx-auto w-full md:w-2/3 lg:w-1/2 xl:w-1/3">
      <div className="py-4">
        <h3 className="text-center uppercase">User Preferences</h3>
      </div>
      <form>
        <div className="form-card rounded-lg bg-slate-300 p-2 text-slate-700">
          <div className="form-card-title flex items-center gap-2 py-2 text-2xl">
            <BsGeoAlt />
            <span className="uppercase">Location</span>
          </div>
          <div className="form-card-body flex flex-col gap-1 px-2">
            <p className="form-card-field-set-info text-sm">
              Your location is used to fetch info such as sunrise/sunset info
            </p>
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
          </div>
          <div className="flex justify-center py-2">
            <button
              type="button"
              onClick={handleUseCurrentLocation}
              className="w-1/2 rounded-lg bg-slate-800 px-4 py-2 text-white">
              Use my current location
            </button>
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
    </div>
  );
};

export default Preferences;