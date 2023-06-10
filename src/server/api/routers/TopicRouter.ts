import { z } from "zod";

import { topicFormSchema } from "~/types";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const TopicRouter = createTRPCRouter({
  create: protectedProcedure
    .input(topicFormSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      const result = await ctx.prisma.topic.create({
        data: {
          name: input.name,
          description: input.description,
          icon: input.icon,
          color: input.color,
          userId,
        },
      });

      return result;
    }),
  readAll: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;
    const result = await ctx.prisma.topic.findMany({
      where: { userId },
      orderBy: {
        name: "asc",
      },
    });
    return result;
  }),
  readOne: protectedProcedure
    .input(z.object({ id: z.string().cuid() }))
    .query(async ({ ctx, input }) => {
      const topic = await ctx.prisma.topic.findUnique({
        where: { id: input.id },
      });

      return topic;
    }),
  delete: protectedProcedure
    .input(z.object({ id: z.string().cuid() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.topic.delete({
        where: {
          id: input.id,
        },
      });
    }),
});
