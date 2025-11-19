import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const emailTemplateRouter = createTRPCRouter({
  getAll: publicProcedure
    .input(z.object({
      category: z.string().optional(),
    }).optional())
    .query(async ({ ctx, input }) => {
      const where = input?.category ? { category: input.category } : undefined;
      
      return ctx.db.emailTemplate.findMany({
        where,
        orderBy: { createdAt: "desc" },
      });
    }),

  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.emailTemplate.findUnique({
        where: { id: input.id },
      });
    }),

  create: publicProcedure
    .input(z.object({
      name: z.string().min(1),
      subject: z.string().min(1),
      body: z.string().min(1),
      category: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.emailTemplate.create({
        data: input,
      });
    }),

  update: publicProcedure
    .input(z.object({
      id: z.string(),
      name: z.string().min(1).optional(),
      subject: z.string().min(1).optional(),
      body: z.string().min(1).optional(),
      category: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      return ctx.db.emailTemplate.update({
        where: { id },
        data,
      });
    }),

  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.emailTemplate.delete({
        where: { id: input.id },
      });
    }),

  preview: publicProcedure
    .input(z.object({
      templateId: z.string(),
      variables: z.record(z.string()),
    }))
    .query(async ({ ctx, input }) => {
      const template = await ctx.db.emailTemplate.findUnique({
        where: { id: input.templateId },
      });

      if (!template) {
        throw new Error("Template not found");
      }

      let subject = template.subject;
      let body = template.body;

      Object.entries(input.variables).forEach(([key, value]) => {
        const regex = new RegExp(`{{${key}}}`, "g");
        subject = subject.replace(regex, value);
        body = body.replace(regex, value);
      });

      return {
        subject,
        body,
      };
    }),
});
