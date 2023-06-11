import { preferencesFormSchema } from "~/types";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const PreferencesRouter = createTRPCRouter({
  create: protectedProcedure
    .input(preferencesFormSchema)
    .mutation(async ({ ctx, input }) => {
      const result = await ctx.prisma.preferences.create({
        data: {
          longitude: input.longitude,
          latitude: input.latitude,
          userId: ctx.session.user.id,
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
  update: protectedProcedure
    .input(preferencesFormSchema)
    .mutation(async ({ ctx, input }) => {
      const result = await ctx.prisma.preferences.update({
        where: {
          userId: ctx.session.user.id,
        },
        data: {
          longitude: input.longitude,
          latitude: input.latitude,
        },
      });

      return result;
    }),
});
