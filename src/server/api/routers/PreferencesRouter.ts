import { preferencesFormSchema } from "~/types";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { prisma } from "~/server/db";

export const PreferencesRouter = createTRPCRouter({
  save: protectedProcedure
    .input(preferencesFormSchema)
    .mutation(async ({ ctx, input }) => {
      const result = await ctx.prisma.preferences.upsert({
        where: {
          userId: ctx.session.user.id,
        },
        update: {
          latitude: input.latitude,
          longitude: input.longitude,
        },
        create: {
          userId: ctx.session.user.id,
          latitude: input.latitude,
          longitude: input.longitude,
        },
      });
      return result;
    }),
  read: protectedProcedure.query(async ({ ctx }) => {
    return getOrCreateUserPreferences(ctx.session.user.id);
  }),
});

export const getOrCreateUserPreferences = async (userId: string) => {
  let preferences = await prisma.preferences.findUnique({
    where: {
      userId,
    },
  });

  // build out preferences if it doesn't already exist
  if (!preferences) {
    preferences = await prisma.preferences.create({
      data: {
        userId,
      },
    });
  }

  return preferences;
};

export const getUserTimezone = async (userId: string) => {
  const user = await getOrCreateUserPreferences(userId);

  if (!user) {
    throw new Error("Unable to determine user timezone, userId: " + userId);
  }

  return user.timezone;
};
