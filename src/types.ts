import {
  CompleteOptionType,
  MoodType,
  OccurrenceType,
  WeatherType,
  type Activity,
  type DaySelector,
  type Routine,
} from "@prisma/client";
import { z } from "zod";

/////TRPC STUFF
export type RoutineAndAll = Routine & {
  weeklyDaysSelected: DaySelector[];
  monthlyDaysSelected: DaySelector[];
  _count?: {
    activities: number;
  };
};
/////FORM STUFF
// TODO: figure out how to allow undefined or null. Right now there is no way to reset or zero out these values
export const preferencesFormSchema = z.object({
  latitude: z.number().nullish(),
  longitude: z.number().nullish(),
  timezone: z.string(),
});
// TODO: figure out how to require both
// .refine(
//   (data) =>
//     (data.latitude && !data.latitude) || (data.longitude && !data.latitude),
//   {
//     message:
//       "Either provide both longitude and latitude or don't supply either",
//     path: ["longitude"],
//   }
// );

export type PreferencesFormSchemaType = z.infer<typeof preferencesFormSchema>;

export const routineFormSchema = z.object({
  routine: z
    .object({
      id: z.string().nullish(),
      name: z.string().min(1),
      description: z.string().min(1),
      topicId: z.string().min(1),
      onComplete: z.nativeEnum(CompleteOptionType),
      occurrenceType: z.nativeEnum(OccurrenceType),
      dailyEveryValue: z.number().nullish(),
      yearlyMonthValue: z.number().nullish(),
      yearlyDayValue: z.number().nullish(),
      startDate: z.string(),
      fromTime: z.string(),
      toTime: z.string(),
      neverEnds: z.boolean(),
      endDate: z.string().optional(),
    })
    // TODO: bugs!, leaving alone for now but need to overhaul this form's validation
    .refine((data) => data.neverEnds || (data.endDate && data.endDate), {
      message: "Either select an end date or select the never ends option",
      path: ["endDate"],
    }),
  weeklyDaySelectorOptions: z.array(
    z.object({
      label: z.string(),
      abbreviatedLabel: z.string(),
      selected: z.boolean(),
    })
  ),
  monthlyDaySelectorOptions: z.array(
    z.object({
      label: z.number(),
      abbreviatedLabel: z.number(),
      selected: z.boolean(),
    })
  ),
});

export type RoutineFormSchemaType = z.infer<typeof routineFormSchema>;

export const topicFormSchema = z.object({
  id: z.string().nullish(),
  name: z.string().min(1),
  description: z.string().min(1),
  icon: z.string().min(1),
  color: z.string().min(1),
});

export type TopicFormSchemaType = z.infer<typeof topicFormSchema>;

export const topicSummary = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  icon: z.string(),
  color: z.string(),
  _count: z.object({
    routines: z.number(),
  }),
});

export type TopicSummaryType = z.infer<typeof topicSummary>;

export const routineSummary = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
});

export type RoutineSummaryType = z.infer<typeof routineSummary>;

export const activitySummary = z.object({
  id: z.string(),
  complete: z.boolean(),
  skip: z.boolean(),
});

export type ActivitySummaryType = z.infer<typeof activitySummary>;

export const routineOutcome = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  activities: z.array(activitySummary),
});

export type RoutineOutcomeType = z.infer<typeof routineOutcome>;

export type TimelineEvent = {
  type: TimelineEventType;
  id: string;
  name: string;
  description: string;
  start: Date;
  end: Date;
  complete: boolean | null;
  completedAt: Date | null;
  skip: boolean | null;
  color: string;
  icon: string;

  activity: Activity | null;
  topicName: string;

  duration: Duration;

  onComplete: CompleteOptionType;
  run?: RunningLogType;
  weighIn?: WeighInFormSchemaType;
  bloodPressureReading?: BloodPressureReadingFormSchemaType;
  note?: NoteFormSchemaType;
};

export type TimelineEventType = "Suninfo" | "Activity";

export const runningLog = z.object({
  activityId: z.string(),
  date: z.date().or(z.string()),
  distance: z.number({
    required_error: "Required",
    invalid_type_error: "Required",
  }),
  duration: z.string().min(1, { message: "Required" }),
  pace: z.string().min(1, { message: "Required" }),
  heartRateAverage: z.string().optional(),
  weather: z.nativeEnum(WeatherType).optional(),
  mood: z.nativeEnum(MoodType).optional(),
});

export type RunningLogType = z.infer<typeof runningLog>;

export const weighInFormSchema = z.object({
  activityId: z.string(),
  date: z.date().or(z.string()),
  weight: z.number(),
  bodyFatPercentage: z.string().optional(),
});

export type WeighInFormSchemaType = z.infer<typeof weighInFormSchema>;

export const bloodPressureReadingFormSchema = z.object({
  activityId: z.string(),
  date: z.date().or(z.string()),
  systolic: z.number(),
  diastolic: z.number(),
  pulse: z.string().optional(),
  // category: z.nativeEnum(BloodPressureCategory),
});

export type BloodPressureReadingFormSchemaType = z.infer<
  typeof bloodPressureReadingFormSchema
>;

export const noteFormSchema = z.object({
  activityId: z.string(),
  date: z.date().or(z.string()),
  content: z.string().min(1),
});

export type NoteFormSchemaType = z.infer<typeof noteFormSchema>;
