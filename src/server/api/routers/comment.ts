import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const commentRouter = createTRPCRouter({
  getByEntity: publicProcedure
    .input(z.object({
      entityType: z.enum(["CONTACT", "COMPANY", "DEAL", "ACTIVITY"]),
      entityId: z.string(),
    }))
    .query(async ({ ctx, input }) => {
      return ctx.db.comment.findMany({
        where: {
          entityType: input.entityType,
          entityId: input.entityId,
        },
        orderBy: { createdAt: "desc" },
      });
    }),

  create: publicProcedure
    .input(z.object({
      content: z.string().min(1),
      entityType: z.enum(["CONTACT", "COMPANY", "DEAL", "ACTIVITY"]),
      entityId: z.string(),
      mentions: z.array(z.string()).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const mentions = input.mentions ?? [];
      
      return ctx.db.comment.create({
        data: {
          content: input.content,
          entityType: input.entityType,
          entityId: input.entityId,
          mentions: mentions.join(','),
        },
      });
    }),

  update: publicProcedure
    .input(z.object({
      id: z.string(),
      content: z.string().min(1),
      mentions: z.array(z.string()).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { id, mentions, ...data } = input;
      
      return ctx.db.comment.update({
        where: { id },
        data: {
          ...data,
          ...(mentions ? { mentions: mentions.join(',') } : {}),
        },
      });
    }),

  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.comment.delete({
        where: { id: input.id },
      });
    }),

  extractMentions: publicProcedure
    .input(z.object({ content: z.string() }))
    .query(async ({ input }) => {
      const mentionRegex = /@(\w+)/g;
      const mentions: string[] = [];
      let match;

      while ((match = mentionRegex.exec(input.content)) !== null) {
        mentions.push(match[1]!);
      }

      return mentions;
    }),
});
