import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const dealRouter = createTRPCRouter({
  getAll: publicProcedure
    .input(z.object({
      stage: z.string().optional(),
      contactId: z.string().optional(),
      companyId: z.string().optional(),
    }).optional())
    .query(async ({ ctx, input }) => {
      return ctx.db.deal.findMany({
        where: {
          stage: input?.stage,
          contactId: input?.contactId,
          companyId: input?.companyId,
        },
        include: {
          contact: true,
          company: true,
        },
        orderBy: { createdAt: "desc" },
      });
    }),

  getByStage: publicProcedure.query(async ({ ctx }) => {
    const stages = ["Lead", "Qualified", "Proposal", "Negotiation", "Closed Won", "Closed Lost"];
    const dealsByStage = await Promise.all(
      stages.map(async (stage) => {
        const deals = await ctx.db.deal.findMany({
          where: { stage },
          include: {
            contact: true,
            company: true,
          },
          orderBy: { createdAt: "desc" },
        });
        return { stage, deals };
      })
    );
    return dealsByStage;
  }),

  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.deal.findUnique({
        where: { id: input.id },
        include: {
          contact: true,
          company: true,
          activities: true,
        },
      });
    }),

  create: publicProcedure
    .input(z.object({
      title: z.string().min(1),
      value: z.number(),
      stage: z.string(),
      probability: z.number().min(0).max(100).default(0),
      contactId: z.string().optional(),
      companyId: z.string().optional(),
      expectedCloseDate: z.date().optional(),
      description: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.deal.create({
        data: input,
      });
    }),

  update: publicProcedure
    .input(z.object({
      id: z.string(),
      title: z.string().min(1).optional(),
      value: z.number().optional(),
      stage: z.string().optional(),
      probability: z.number().min(0).max(100).optional(),
      contactId: z.string().optional().nullable(),
      companyId: z.string().optional().nullable(),
      expectedCloseDate: z.date().optional().nullable(),
      description: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      return ctx.db.deal.update({
        where: { id },
        data,
      });
    }),

  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.deal.delete({
        where: { id: input.id },
      });
    }),

  getStats: publicProcedure.query(async ({ ctx }) => {
    const total = await ctx.db.deal.count();
    const totalValue = await ctx.db.deal.aggregate({
      _sum: { value: true },
    });
    const wonDeals = await ctx.db.deal.count({
      where: { stage: "Closed Won" },
    });
    const wonValue = await ctx.db.deal.aggregate({
      _sum: { value: true },
      where: { stage: "Closed Won" },
    });
    return {
      total,
      totalValue: totalValue._sum.value ?? 0,
      wonDeals,
      wonValue: wonValue._sum.value ?? 0,
    };
  }),

  getMonthlyGrowth: publicProcedure.query(async ({ ctx }) => {
    const now = new Date();
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
    
    const deals = await ctx.db.deal.findMany({
      where: {
        createdAt: {
          gte: sixMonthsAgo,
        },
      },
      orderBy: { createdAt: "asc" },
    });

    const wonDeals = await ctx.db.deal.findMany({
      where: {
        stage: "Closed Won",
        updatedAt: {
          gte: sixMonthsAgo,
        },
      },
      orderBy: { updatedAt: "asc" },
    });

    const monthlyData = [];
    for (let i = 5; i >= 0; i--) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const nextMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      
      const monthDeals = deals.filter(d => {
        const dealDate = new Date(d.createdAt);
        return dealDate >= monthDate && dealDate < nextMonth;
      });

      const monthWonDeals = wonDeals.filter(d => {
        const dealDate = new Date(d.updatedAt);
        return dealDate >= monthDate && dealDate < nextMonth;
      });
      
      monthlyData.push({
        month: monthDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        deals: monthDeals.length,
        revenue: monthWonDeals.reduce((sum, deal) => sum + deal.value, 0),
        wonDeals: monthWonDeals.length,
      });
    }
    
    return monthlyData;
  }),
});
