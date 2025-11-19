import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const productRouter = createTRPCRouter({
  getAll: publicProcedure
    .input(z.object({
      category: z.string().optional(),
      search: z.string().optional(),
    }).optional())
    .query(async ({ ctx, input }) => {
      const where: {category?: string; OR?: Array<{name?: {contains: string}; sku?: {contains: string}}>} = {};
      
      if (input?.category) {
        where.category = input.category;
      }
      
      if (input?.search) {
        where.OR = [
          { name: { contains: input.search } },
          { sku: { contains: input.search } },
        ];
      }

      return ctx.db.product.findMany({
        where,
        orderBy: { createdAt: "desc" },
      });
    }),

  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.product.findUnique({
        where: { id: input.id },
      });
    }),

  create: publicProcedure
    .input(z.object({
      name: z.string().min(1),
      sku: z.string().min(1),
      description: z.string().optional(),
      price: z.number(),
      cost: z.number().optional(),
      category: z.string().optional(),
      isActive: z.boolean().optional().default(true),
    }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.product.create({
        data: input,
      });
    }),

  update: publicProcedure
    .input(z.object({
      id: z.string(),
      name: z.string().min(1).optional(),
      sku: z.string().min(1).optional(),
      description: z.string().optional(),
      price: z.number().optional(),
      cost: z.number().optional(),
      category: z.string().optional(),
      isActive: z.boolean().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      return ctx.db.product.update({
        where: { id },
        data,
      });
    }),

  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.product.delete({
        where: { id: input.id },
      });
    }),

  getCategories: publicProcedure
    .query(async ({ ctx }) => {
      const products = await ctx.db.product.findMany({
        select: { category: true },
        distinct: ['category'],
      });
      
      return products
        .map((p) => p.category)
        .filter((c): c is string => c !== null && c !== undefined);
    }),
});
