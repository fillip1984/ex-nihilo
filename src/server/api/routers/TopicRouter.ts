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
      select: {
        id: true,
        name: true,
        description: true,
        icon: true,
        color: true,
        _count: {
          select: {
            routines: true,
          },
        },
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
  update: protectedProcedure
    .input(topicFormSchema)
    .mutation(async ({ ctx, input }) => {
      if (!input.id) {
        throw new Error("unable to update topic without id");
      }

      const result = await ctx.prisma.topic.update({
        where: { id: input.id },
        data: {
          name: input.name,
          description: input.description,
          icon: input.icon,
          color: input.color,
        },
      });

      return result;
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
