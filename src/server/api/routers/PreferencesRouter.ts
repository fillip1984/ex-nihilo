import { preferencesFormSchema } from "~/types";
import { createTRPCRouter, protectedProcedure } from "../trpc";

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
    const preferences = await ctx.prisma.preferences.findUnique({
      where: {
        userId: ctx.session.user.id,
      },
    });

    return preferences;
  }),
});
