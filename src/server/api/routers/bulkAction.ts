import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const bulkActionRouter = createTRPCRouter({
  bulkDeleteContacts: publicProcedure
    .input(z.object({
      ids: z.array(z.string()),
    }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.contact.deleteMany({
        where: {
          id: {
            in: input.ids,
          },
        },
      });

      return {
        success: true,
        deleted: input.ids.length,
      };
    }),

  bulkUpdateContactStatus: publicProcedure
    .input(z.object({
      ids: z.array(z.string()),
      status: z.enum(["ACTIVE", "INACTIVE", "ARCHIVED"]),
    }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.contact.updateMany({
        where: {
          id: {
            in: input.ids,
          },
        },
        data: {
          status: input.status,
        },
      });

      return {
        success: true,
        updated: input.ids.length,
      };
    }),

  bulkDeleteCompanies: publicProcedure
    .input(z.object({
      ids: z.array(z.string()),
    }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.company.deleteMany({
        where: {
          id: {
            in: input.ids,
          },
        },
      });

      return {
        success: true,
        deleted: input.ids.length,
      };
    }),

  bulkDeleteDeals: publicProcedure
    .input(z.object({
      ids: z.array(z.string()),
    }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.deal.deleteMany({
        where: {
          id: {
            in: input.ids,
          },
        },
      });

      return {
        success: true,
        deleted: input.ids.length,
      };
    }),

  bulkUpdateDealStage: publicProcedure
    .input(z.object({
      ids: z.array(z.string()),
      stage: z.enum(["LEAD", "QUALIFICATION", "PROPOSAL", "NEGOTIATION", "CLOSED_WON", "CLOSED_LOST"]),
    }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.deal.updateMany({
        where: {
          id: {
            in: input.ids,
          },
        },
        data: {
          stage: input.stage,
        },
      });

      return {
        success: true,
        updated: input.ids.length,
      };
    }),

  bulkDeleteProducts: publicProcedure
    .input(z.object({
      ids: z.array(z.string()),
    }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.product.deleteMany({
        where: {
          id: {
            in: input.ids,
          },
        },
      });

      return {
        success: true,
        deleted: input.ids.length,
      };
    }),

  bulkUpdateProductStatus: publicProcedure
    .input(z.object({
      ids: z.array(z.string()),
      active: z.boolean(),
    }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.product.updateMany({
        where: {
          id: {
            in: input.ids,
          },
        },
        data: {
          isActive: input.active,
        },
      });

      return {
        success: true,
        updated: input.ids.length,
      };
    }),

  bulkDeleteQuotes: publicProcedure
    .input(z.object({
      ids: z.array(z.string()),
    }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.quote.deleteMany({
        where: {
          id: {
            in: input.ids,
          },
        },
      });

      return {
        success: true,
        deleted: input.ids.length,
      };
    }),

  bulkUpdateQuoteStatus: publicProcedure
    .input(z.object({
      ids: z.array(z.string()),
      status: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.quote.updateMany({
        where: {
          id: {
            in: input.ids,
          },
        },
        data: {
          status: input.status,
        },
      });

      return {
        success: true,
        updated: input.ids.length,
      };
    }),

  bulkDeleteUsers: publicProcedure
    .input(z.object({
      ids: z.array(z.string()),
    }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.user.deleteMany({
        where: {
          id: {
            in: input.ids,
          },
        },
      });

      return {
        success: true,
        deleted: input.ids.length,
      };
    }),

  bulkUpdateUserStatus: publicProcedure
    .input(z.object({
      ids: z.array(z.string()),
      active: z.boolean(),
    }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.user.updateMany({
        where: {
          id: {
            in: input.ids,
          },
        },
        data: {
          isActive: input.active,
        },
      });

      return {
        success: true,
        updated: input.ids.length,
      };
    }),
});
