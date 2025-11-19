import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const noteRouter = createTRPCRouter({
  getAll: publicProcedure
    .input(z.object({
      entityType: z.string().optional(),
      entityId: z.string().optional(),
    }).optional())
    .query(async ({ ctx, input }) => {
      const where = input ? {
        entityType: input.entityType,
        entityId: input.entityId,
      } : undefined;

      return ctx.db.note.findMany({
        where,
        orderBy: { createdAt: "desc" },
      });
    }),

  getByEntity: publicProcedure
    .input(z.object({
      entityType: z.string(),
      entityId: z.string(),
    }))
    .query(async ({ ctx, input }) => {
      return ctx.db.note.findMany({
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
      entityType: z.string(),
      entityId: z.string(),
      createdBy: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.note.create({
        data: input,
      });
    }),

  update: publicProcedure
    .input(z.object({
      id: z.string(),
      content: z.string().min(1),
    }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.note.update({
        where: { id: input.id },
        data: { content: input.content },
      });
    }),

  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.note.delete({
        where: { id: input.id },
      });
    }),
});
