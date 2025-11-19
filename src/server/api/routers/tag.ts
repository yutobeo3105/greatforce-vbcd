import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const tagRouter = createTRPCRouter({
  getAll: publicProcedure
    .input(z.object({
      entityType: z.string().optional(),
      entityId: z.string().optional(),
      name: z.string().optional(),
    }).optional())
    .query(async ({ ctx, input }) => {
      const where = input ? {
        entityType: input.entityType,
        entityId: input.entityId,
        name: input.name ? { contains: input.name } : undefined,
      } : undefined;

      return ctx.db.tag.findMany({
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
      return ctx.db.tag.findMany({
        where: {
          entityType: input.entityType,
          entityId: input.entityId,
        },
        orderBy: { createdAt: "desc" },
      });
    }),

  getUniqueTags: publicProcedure
    .input(z.object({
      entityType: z.string().optional(),
    }).optional())
    .query(async ({ ctx, input }) => {
      const tags = await ctx.db.tag.findMany({
        where: input?.entityType ? { entityType: input.entityType } : undefined,
        distinct: ['name'],
        select: {
          name: true,
          color: true,
        },
      });
      
      return tags;
    }),

  create: publicProcedure
    .input(z.object({
      name: z.string().min(1),
      color: z.string().optional(),
      entityType: z.string(),
      entityId: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.tag.create({
        data: input,
      });
    }),

  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.tag.delete({
        where: { id: input.id },
      });
    }),

  deleteByEntity: publicProcedure
    .input(z.object({
      entityType: z.string(),
      entityId: z.string(),
      name: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.tag.deleteMany({
        where: {
          entityType: input.entityType,
          entityId: input.entityId,
          name: input.name,
        },
      });
    }),
});
