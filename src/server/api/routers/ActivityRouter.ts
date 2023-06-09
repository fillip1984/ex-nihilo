import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { type Routine } from "@prisma/client";
import { prisma } from "~/server/db";

const createFromRoutine = async (routine: Routine) => {
  switch (routine.occurrenceType) {
    case "NEVER":
      return await prisma.activity.create({
        data: {
          routineId: routine.id,
          start: routine.startDate,
          end: routine.endDate as Date,
        },
      });
    case "DAILY":
  }
};

export const ActivityRouter = createTRPCRouter({
  // create: protectedProcedure.input({z.inferType<Routine>}).mutation(async ({ctx, input}) => {})
});
