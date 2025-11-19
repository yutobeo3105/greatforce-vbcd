import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const quoteRouter = createTRPCRouter({
  getAll: publicProcedure
    .input(z.object({
      status: z.enum(["DRAFT", "SENT", "ACCEPTED", "REJECTED"]).optional(),
    }).optional())
    .query(async ({ ctx, input }) => {
      const where = input?.status ? { status: input.status } : {};
      
      return ctx.db.quote.findMany({
        where,
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });
    }),

  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.quote.findUnique({
        where: { id: input.id },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      });
    }),

  create: publicProcedure
    .input(z.object({
      quoteNumber: z.string().min(1),
      title: z.string().min(1),
      contactId: z.string().optional(),
      companyId: z.string().optional(),
      dealId: z.string().optional(),
      validUntil: z.date().optional(),
      notes: z.string().optional(),
      terms: z.string().optional(),
      status: z.enum(["DRAFT", "SENT", "ACCEPTED", "REJECTED"]).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.quote.create({
        data: {
          ...input,
          status: input.status ?? "DRAFT",
          total: 0,
        },
      });
    }),

  update: publicProcedure
    .input(z.object({
      id: z.string(),
      quoteNumber: z.string().optional(),
      title: z.string().optional(),
      contactId: z.string().optional(),
      companyId: z.string().optional(),
      dealId: z.string().optional(),
      validUntil: z.date().optional(),
      notes: z.string().optional(),
      terms: z.string().optional(),
      status: z.enum(["DRAFT", "SENT", "ACCEPTED", "REJECTED"]).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      return ctx.db.quote.update({
        where: { id },
        data,
      });
    }),

  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.quoteItem.deleteMany({
        where: { quoteId: input.id },
      });
      
      return ctx.db.quote.delete({
        where: { id: input.id },
      });
    }),

  addItem: publicProcedure
    .input(z.object({
      quoteId: z.string(),
      productId: z.string(),
      quantity: z.number().min(1),
      unitPrice: z.number(),
      discount: z.number().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { discount = 0 } = input;
      const subtotal = input.quantity * input.unitPrice;
      const total = subtotal - discount;

      const product = await ctx.db.product.findUnique({
        where: { id: input.productId },
      });

      const item = await ctx.db.quoteItem.create({
        data: {
          quoteId: input.quoteId,
          description: product?.description || product?.name || "Product",
          productId: input.productId,
          quantity: input.quantity,
          unitPrice: input.unitPrice,
          discount,
          total,
        },
      });

      const items = await ctx.db.quoteItem.findMany({
        where: { quoteId: input.quoteId },
      });

      const quoteTotal = items.reduce((sum, i) => sum + i.total, 0);

      await ctx.db.quote.update({
        where: { id: input.quoteId },
        data: { total: quoteTotal },
      });

      return item;
    }),

  updateItem: publicProcedure
    .input(z.object({
      id: z.string(),
      quantity: z.number().min(1).optional(),
      unitPrice: z.number().optional(),
      discount: z.number().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { id, ...updates } = input;
      
      const item = await ctx.db.quoteItem.findUnique({
        where: { id },
      });

      if (!item) throw new Error("Item not found");

      const quantity = updates.quantity ?? item.quantity;
      const unitPrice = updates.unitPrice ?? item.unitPrice;
      const discount = updates.discount ?? item.discount;
      const subtotal = quantity * unitPrice;
      const total = subtotal - discount;

      const updatedItem = await ctx.db.quoteItem.update({
        where: { id },
        data: {
          ...updates,
          total,
        },
      });

      const items = await ctx.db.quoteItem.findMany({
        where: { quoteId: item.quoteId },
      });

      const quoteTotal = items.reduce((sum, i) => sum + i.total, 0);

      await ctx.db.quote.update({
        where: { id: item.quoteId },
        data: { total: quoteTotal },
      });

      return updatedItem;
    }),

  deleteItem: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const item = await ctx.db.quoteItem.findUnique({
        where: { id: input.id },
      });

      if (!item) throw new Error("Item not found");

      await ctx.db.quoteItem.delete({
        where: { id: input.id },
      });

      const items = await ctx.db.quoteItem.findMany({
        where: { quoteId: item.quoteId },
      });

      const quoteTotal = items.reduce((sum, i) => sum + i.total, 0);

      await ctx.db.quote.update({
        where: { id: item.quoteId },
        data: { total: quoteTotal },
      });

      return item;
    }),
});
