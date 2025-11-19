import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const activityRouter = createTRPCRouter({
  getAll: publicProcedure
    .input(z.object({
      completed: z.boolean().optional(),
      contactId: z.string().optional(),
      dealId: z.string().optional(),
    }).optional())
    .query(async ({ ctx, input }) => {
      return ctx.db.activity.findMany({
        where: {
          completed: input?.completed,
          contactId: input?.contactId,
          dealId: input?.dealId,
        },
        include: {
          contact: true,
          deal: true,
        },
        orderBy: { dueDate: "asc" },
      });
    }),

  getUpcoming: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.activity.findMany({
      where: {
        completed: false,
        dueDate: {
          gte: new Date(),
        },
      },
      include: {
        contact: true,
        deal: true,
      },
      orderBy: { dueDate: "asc" },
      take: 10,
    });
  }),

  getOverdue: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.activity.findMany({
      where: {
        completed: false,
        dueDate: {
          lt: new Date(),
        },
      },
      include: {
        contact: true,
        deal: true,
      },
      orderBy: { dueDate: "asc" },
    });
  }),

  create: publicProcedure
    .input(z.object({
      type: z.string(),
      title: z.string().min(1),
      description: z.string().optional(),
      dueDate: z.date().optional(),
      contactId: z.string().optional(),
      dealId: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.activity.create({
        data: input,
      });
    }),

  update: publicProcedure
    .input(z.object({
      id: z.string(),
      type: z.string().optional(),
      title: z.string().min(1).optional(),
      description: z.string().optional(),
      dueDate: z.date().optional().nullable(),
      completed: z.boolean().optional(),
      contactId: z.string().optional().nullable(),
      dealId: z.string().optional().nullable(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      return ctx.db.activity.update({
        where: { id },
        data,
      });
    }),

  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.activity.delete({
        where: { id: input.id },
      });
    }),

  toggleComplete: publicProcedure
    .input(z.object({
      id: z.string(),
      completed: z.boolean(),
    }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.activity.update({
        where: { id: input.id },
        data: { completed: input.completed },
      });
    }),

  getStats: publicProcedure.query(async ({ ctx }) => {
    const total = await ctx.db.activity.count();
    const completed = await ctx.db.activity.count({
      where: { completed: true },
    });
    const overdue = await ctx.db.activity.count({
      where: {
        completed: false,
        dueDate: {
          lt: new Date(),
        },
      },
    });
    
    return {
      total,
      completed,
      overdue,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
    };
  }),
});
