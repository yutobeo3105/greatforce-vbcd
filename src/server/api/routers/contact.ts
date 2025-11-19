import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const contactRouter = createTRPCRouter({
  getAll: publicProcedure
    .input(z.object({
      search: z.string().optional(),
      companyId: z.string().optional(),
    }).optional())
    .query(async ({ ctx, input }) => {
      const where = input ? {
        OR: input.search ? [
          { firstName: { contains: input.search } },
          { lastName: { contains: input.search } },
          { email: { contains: input.search } },
        ] : undefined,
        companyId: input.companyId,
      } : undefined;

      return ctx.db.contact.findMany({
        where,
        include: {
          company: true,
        },
        orderBy: { createdAt: "desc" },
      });
    }),

  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.contact.findUnique({
        where: { id: input.id },
        include: {
          company: true,
          activities: true,
          deals: true,
        },
      });
    }),

  create: publicProcedure
    .input(z.object({
      firstName: z.string().min(1),
      lastName: z.string().min(1),
      email: z.string().email(),
      phone: z.string().optional(),
      title: z.string().optional(),
      companyId: z.string().optional(),
      tags: z.string().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.contact.create({
        data: input,
      });
    }),

  update: publicProcedure
    .input(z.object({
      id: z.string(),
      firstName: z.string().min(1).optional(),
      lastName: z.string().min(1).optional(),
      email: z.string().email().optional(),
      phone: z.string().optional(),
      title: z.string().optional(),
      companyId: z.string().optional().nullable(),
      tags: z.string().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      return ctx.db.contact.update({
        where: { id },
        data,
      });
    }),

  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.contact.delete({
        where: { id: input.id },
      });
    }),

  getStats: publicProcedure.query(async ({ ctx }) => {
    const total = await ctx.db.contact.count();
    const recentCount = await ctx.db.contact.count({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        },
      },
    });
    return { total, recentCount };
  }),
});
