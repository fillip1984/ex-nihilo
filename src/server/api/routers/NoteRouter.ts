import { noteFormSchema } from "~/types";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const NoteRouter = createTRPCRouter({
  create: protectedProcedure
    .input(noteFormSchema)
    .mutation(async ({ ctx, input }) => {
      const result = await ctx.prisma.note.create({
        data: {
          userId: ctx.session.user.id,
          activityId: input.activityId,
          date: input.date,
          content: input.content,
        },
      });
      return result;
    }),
});
