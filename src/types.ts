import { OccurrenceType } from "@prisma/client";
import { z } from "zod";

export const routineFormSchema = z.object({
  routine: z
    .object({
      name: z.string().min(1),
      description: z.string().min(1),
      occurrenceType: z.nativeEnum(OccurrenceType),
      dailyEveryValue: z.number().nullish(),
      yearlyMonthValue: z.number().nullish(),
      yearlyDayValue: z.number().nullish(),
      startDate: z.string().min(1),
      fromTime: z.string().min(1),
      toTime: z.string().min(1),
      endDate: z.string().nullish(),
      neverEnds: z.boolean(),
      topicId: z.string().min(1),
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
  name: z.string().min(1),
  description: z.string().min(1),
  icon: z.string().min(1),
  color: z.string().min(1),
});

export type TopicFormSchemaType = z.infer<typeof topicFormSchema>;