import {
  CompleteOptionType,
  OccurrenceType,
  type Activity,
  type DaySelector,
  type Routine,
} from "@prisma/client";
import { z } from "zod";

/////TRPC STUFF
export type RoutineAndAll = Routine & {
  weeklyDaysSelected: DaySelector[];
  monthlyDaysSelected: DaySelector[];
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
};

export type TimelineEventType = "Suninfo" | "Activity";
