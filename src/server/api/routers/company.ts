import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const companyRouter = createTRPCRouter({
  getAll: publicProcedure
    .input(z.object({
      search: z.string().optional(),
    }).optional())
    .query(async ({ ctx, input }) => {
      const where = input?.search ? {
        OR: [
          { name: { contains: input.search } },
          { industry: { contains: input.search } },
        ],
      } : undefined;

      return ctx.db.company.findMany({
        where,
        include: {
          _count: {
            select: { contacts: true, deals: true },
          },
        },
        orderBy: { createdAt: "desc" },
      });
    }),

  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.company.findUnique({
        where: { id: input.id },
        include: {
          contacts: true,
          deals: true,
        },
      });
    }),

  create: publicProcedure
    .input(z.object({
      name: z.string().min(1),
      website: z.string().optional(),
      industry: z.string().optional(),
      size: z.string().optional(),
      description: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.company.create({
        data: input,
      });
    }),

  update: publicProcedure
    .input(z.object({
      id: z.string(),
      name: z.string().min(1).optional(),
      website: z.string().optional(),
      industry: z.string().optional(),
      size: z.string().optional(),
      description: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      return ctx.db.company.update({
        where: { id },
        data,
      });
    }),

  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.company.delete({
        where: { id: input.id },
      });
    }),

  getStats: publicProcedure.query(async ({ ctx }) => {
    const total = await ctx.db.company.count();
    return { total };
  }),
});
