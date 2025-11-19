import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const searchRouter = createTRPCRouter({
  global: publicProcedure
    .input(z.object({
      query: z.string().min(1),
      limit: z.number().optional().default(10),
    }))
    .query(async ({ ctx, input }) => {
      const { query, limit } = input;

      const [contacts, companies, deals, activities] = await Promise.all([
        ctx.db.contact.findMany({
          where: {
            OR: [
              { firstName: { contains: query } },
              { lastName: { contains: query } },
              { email: { contains: query } },
              { title: { contains: query } },
            ],
          },
          take: limit,
          include: {
            company: true,
          },
        }),
        
        ctx.db.company.findMany({
          where: {
            OR: [
              { name: { contains: query } },
              { industry: { contains: query } },
              { description: { contains: query } },
            ],
          },
          take: limit,
        }),
        
        ctx.db.deal.findMany({
          where: {
            OR: [
              { title: { contains: query } },
              { stage: { contains: query } },
              { description: { contains: query } },
            ],
          },
          take: limit,
          include: {
            contact: true,
            company: true,
          },
        }),
        
        ctx.db.activity.findMany({
          where: {
            OR: [
              { title: { contains: query } },
              { type: { contains: query } },
              { description: { contains: query } },
            ],
          },
          take: limit,
          include: {
            contact: true,
            deal: true,
          },
        }),
      ]);

      return {
        contacts: contacts.map((c) => ({
          ...c,
          type: "contact" as const,
          displayName: `${c.firstName} ${c.lastName}`,
          url: `/contacts/${c.id}`,
        })),
        companies: companies.map((c) => ({
          ...c,
          type: "company" as const,
          displayName: c.name,
          url: `/companies/${c.id}`,
        })),
        deals: deals.map((d) => ({
          ...d,
          type: "deal" as const,
          displayName: d.title,
          url: `/deals/${d.id}`,
        })),
        activities: activities.map((a) => ({
          ...a,
          type: "activity" as const,
          displayName: a.title,
          url: `/activities/${a.id}`,
        })),
      };
    }),

  contacts: publicProcedure
    .input(z.object({
      query: z.string().min(1),
      limit: z.number().optional().default(20),
    }))
    .query(async ({ ctx, input }) => {
      return ctx.db.contact.findMany({
        where: {
          OR: [
            { firstName: { contains: input.query } },
            { lastName: { contains: input.query } },
            { email: { contains: input.query } },
            { title: { contains: input.query } },
          ],
        },
        take: input.limit,
        include: {
          company: true,
        },
      });
    }),

  companies: publicProcedure
    .input(z.object({
      query: z.string().min(1),
      limit: z.number().optional().default(20),
    }))
    .query(async ({ ctx, input }) => {
      return ctx.db.company.findMany({
        where: {
          OR: [
            { name: { contains: input.query } },
            { industry: { contains: input.query } },
            { description: { contains: input.query } },
          ],
        },
        take: input.limit,
      });
    }),

  deals: publicProcedure
    .input(z.object({
      query: z.string().min(1),
      limit: z.number().optional().default(20),
    }))
    .query(async ({ ctx, input }) => {
      return ctx.db.deal.findMany({
        where: {
          OR: [
            { title: { contains: input.query } },
            { stage: { contains: input.query } },
            { description: { contains: input.query } },
          ],
        },
        take: input.limit,
        include: {
          contact: true,
          company: true,
        },
      });
    }),
});
