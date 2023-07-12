import { type Activity, OccurrenceType } from "@prisma/client";
import { z } from "zod";

export const preferencesFormSchema = z.object({
  latitude: z.number(),
  longitude: z.number(),
});

export type PreferencesFormSchemaType = z.infer<typeof preferencesFormSchema>;

export const routineFormSchema = z.object({
  routine: z
    .object({
      name: z.string().min(1),
      description: z.string().min(1),
      topicId: z.string().min(1),
      occurrenceType: z.nativeEnum(OccurrenceType),
      dailyEveryValue: z.number().nullish(),
      yearlyMonthValue: z.number().nullish(),
      yearlyDayValue: z.number().nullish(),
      startDate: z.string().min(1),
      fromTime: z.string().min(1),
      toTime: z.string().min(1),
      neverEnds: z.boolean(),
      endDate: z.string().nullish(),
    })
    .refine(
      (data) => data.neverEnds || (data.endDate && data.endDate?.length > 0),
      {
        message: "Either select an end date or select the never ends option",
        path: ["endDate"],
      }
    ),
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

export type TimelineEvent = {
  type: TimelineEventType;
  id: string;
  name: string;
  description: string;
  start: Date;
  end: Date;
  fromTime: Date;
  toTime: Date;
  complete: boolean | null;
  completedAt: Date | null;
  skip: boolean | null;
  color: string;
  icon: string;

  activity: Activity | null;
  topicName: string;

  lengthOfDate: Duration | null;
};

export type TimelineEventType = "Suninfo" | "Activity";
