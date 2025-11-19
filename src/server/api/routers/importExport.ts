import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import Papa from "papaparse";

export const importExportRouter = createTRPCRouter({
  exportContacts: publicProcedure
    .input(z.object({
      format: z.enum(["csv", "json"]),
      filters: z.object({
        status: z.string().optional(),
        tags: z.array(z.string()).optional(),
      }).optional(),
    }))
    .query(async ({ ctx, input }) => {
      const where: any = {};
      
      if (input.filters?.status) {
        where.status = input.filters.status;
      }

      const contacts = await ctx.db.contact.findMany({
        where,
        include: {
          company: true,
        },
      });

      const data = contacts.map(c => ({
        id: c.id,
        firstName: c.firstName,
        lastName: c.lastName,
        email: c.email,
        title: c.title,
        status: c.status,
        company: c.company?.name || "",
        tags: c.tags || "",
        createdAt: c.createdAt.toISOString(),
      }));

      if (input.format === "csv") {
        return Papa.unparse(data);
      }

      return JSON.stringify(data, null, 2);
    }),

  exportCompanies: publicProcedure
    .input(z.object({
      format: z.enum(["csv", "json"]),
    }))
    .query(async ({ ctx, input }) => {
      const companies = await ctx.db.company.findMany({
        include: {
          _count: {
            select: { contacts: true, deals: true },
          },
        },
      });

      const data = companies.map(c => ({
        id: c.id,
        name: c.name,
        industry: c.industry || "",
        website: c.website || "",
        contactsCount: c._count.contacts,
        dealsCount: c._count.deals,
        createdAt: c.createdAt.toISOString(),
      }));

      if (input.format === "csv") {
        return Papa.unparse(data);
      }

      return JSON.stringify(data, null, 2);
    }),

  exportDeals: publicProcedure
    .input(z.object({
      format: z.enum(["csv", "json"]),
      filters: z.object({
        stage: z.string().optional(),
      }).optional(),
    }))
    .query(async ({ ctx, input }) => {
      const where: any = {};
      
      if (input.filters?.stage) {
        where.stage = input.filters.stage;
      }

      const deals = await ctx.db.deal.findMany({
        where,
        include: {
          contact: true,
          company: true,
        },
      });

      const data = deals.map(d => ({
        id: d.id,
        title: d.title,
        value: d.value,
        stage: d.stage,
        probability: d.probability,
        expectedCloseDate: d.expectedCloseDate?.toISOString() || "",
        contact: d.contact ? `${d.contact.firstName} ${d.contact.lastName}` : "",
        company: d.company?.name || "",
        createdAt: d.createdAt.toISOString(),
      }));

      if (input.format === "csv") {
        return Papa.unparse(data);
      }

      return JSON.stringify(data, null, 2);
    }),

  importContacts: publicProcedure
    .input(z.object({
      data: z.string(),
      format: z.enum(["csv", "json"]),
    }))
    .mutation(async ({ ctx, input }) => {
      let contacts: any[];

      if (input.format === "csv") {
        const parsed = Papa.parse(input.data, { header: true });
        contacts = parsed.data as any[];
      } else {
        contacts = JSON.parse(input.data);
      }

      const created = [];
      const errors = [];

      for (const contact of contacts) {
        try {
          if (!contact.firstName || !contact.lastName || !contact.email) {
            errors.push({ row: contact, error: "Missing required fields" });
            continue;
          }

          let companyId = null;
          if (contact.company) {
            const company = await ctx.db.company.findFirst({
              where: { name: contact.company },
            });
            companyId = company?.id || null;
          }

          const newContact = await ctx.db.contact.create({
            data: {
              firstName: contact.firstName,
              lastName: contact.lastName,
              email: contact.email,
              phone: contact.phone || null,
              title: contact.jobTitle || null,
              status: contact.status || "ACTIVE",
              companyId,
            },
          });

          created.push(newContact);
        } catch (error: any) {
          errors.push({ row: contact, error: error.message });
        }
      }

      return {
        success: true,
        created: created.length,
        errors: errors.length,
        errorDetails: errors,
      };
    }),

  importCompanies: publicProcedure
    .input(z.object({
      data: z.string(),
      format: z.enum(["csv", "json"]),
    }))
    .mutation(async ({ ctx, input }) => {
      let companies: any[];

      if (input.format === "csv") {
        const parsed = Papa.parse(input.data, { header: true });
        companies = parsed.data as any[];
      } else {
        companies = JSON.parse(input.data);
      }

      const created = [];
      const errors = [];

      for (const company of companies) {
        try {
          if (!company.name) {
            errors.push({ row: company, error: "Missing company name" });
            continue;
          }

          const newCompany = await ctx.db.company.create({
            data: {
              name: company.name,
              industry: company.industry || null,
              website: company.website || null,
            },
          });

          created.push(newCompany);
        } catch (error: any) {
          errors.push({ row: company, error: error.message });
        }
      }

      return {
        success: true,
        created: created.length,
        errors: errors.length,
        errorDetails: errors,
      };
    }),

  importDeals: publicProcedure
    .input(z.object({
      data: z.string(),
      format: z.enum(["csv", "json"]),
    }))
    .mutation(async ({ ctx, input }) => {
      let deals: any[];

      if (input.format === "csv") {
        const parsed = Papa.parse(input.data, { header: true });
        deals = parsed.data as any[];
      } else {
        deals = JSON.parse(input.data);
      }

      const created = [];
      const errors = [];

      for (const deal of deals) {
        try {
          if (!deal.title) {
            errors.push({ row: deal, error: "Missing deal title" });
            continue;
          }

          let contactId = null;
          if (deal.contactEmail) {
            const contact = await ctx.db.contact.findFirst({
              where: { email: deal.contactEmail },
            });
            contactId = contact?.id || null;
          }

          let companyId = null;
          if (deal.company) {
            const company = await ctx.db.company.findFirst({
              where: { name: deal.company },
            });
            companyId = company?.id || null;
          }

          const newDeal = await ctx.db.deal.create({
            data: {
              title: deal.title,
              value: parseFloat(deal.value) || 0,
              stage: deal.stage || "QUALIFICATION",
              probability: parseInt(deal.probability) || 50,
              expectedCloseDate: deal.expectedCloseDate ? new Date(deal.expectedCloseDate) : null,
              contactId,
              companyId,
            },
          });

          created.push(newDeal);
        } catch (error: any) {
          errors.push({ row: deal, error: error.message });
        }
      }

      return {
        success: true,
        created: created.length,
        errors: errors.length,
        errorDetails: errors,
      };
    }),
});
