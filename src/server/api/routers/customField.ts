import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const customFieldRouter = createTRPCRouter({
  getByEntity: publicProcedure
    .input(z.object({
      entityType: z.string(),
      entityId: z.string(),
    }))
    .query(async ({ ctx, input }) => {
      return ctx.db.customField.findMany({
        where: {
          entityType: input.entityType,
          entityId: input.entityId,
        },
        orderBy: { createdAt: "asc" },
      });
    }),

  create: publicProcedure
    .input(z.object({
      name: z.string().min(1),
      fieldType: z.enum(["TEXT", "NUMBER", "DATE", "BOOLEAN", "URL", "EMAIL"]),
      value: z.string(),
      entityType: z.string(),
      entityId: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.customField.create({
        data: input,
      });
    }),

  update: publicProcedure
    .input(z.object({
      id: z.string(),
      name: z.string().min(1).optional(),
      value: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      return ctx.db.customField.update({
        where: { id },
        data,
      });
    }),

  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.customField.delete({
        where: { id: input.id },
      });
    }),
});
