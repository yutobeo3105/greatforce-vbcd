import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { ROLES, RESOURCES, ACTIONS } from "~/lib/permissions/config";

export const permissionRouter = createTRPCRouter({
  getAll: protectedProcedure
    .query(async ({ ctx }) => {
      const permissions = await ctx.db.permission.findMany({
        orderBy: [{ role: "asc" }, { resource: "asc" }, { action: "asc" }],
      });
      
      return permissions;
    }),

  getByRole: protectedProcedure
    .input(z.object({ role: z.string() }))
    .query(async ({ ctx, input }) => {
      const permissions = await ctx.db.permission.findMany({
        where: { role: input.role },
        orderBy: [{ resource: "asc" }, { action: "asc" }],
      });
      
      return permissions;
    }),

  update: protectedProcedure
    .input(z.object({
      id: z.string(),
      enabled: z.boolean(),
    }))
    .mutation(async ({ ctx, input }) => {
      const user = ctx.session.user as any;
      
      if (user.role !== ROLES.ADMIN) {
        throw new Error("Unauthorized: Only admins can update permissions");
      }

      const permission = await ctx.db.permission.update({
        where: { id: input.id },
        data: { enabled: input.enabled },
      });

      return permission;
    }),

  bulkUpdate: protectedProcedure
    .input(z.object({
      updates: z.array(z.object({
        id: z.string(),
        enabled: z.boolean(),
      })),
    }))
    .mutation(async ({ ctx, input }) => {
      const user = ctx.session.user as any;
      
      if (user.role !== ROLES.ADMIN) {
        throw new Error("Unauthorized: Only admins can update permissions");
      }

      await Promise.all(
        input.updates.map(update =>
          ctx.db.permission.update({
            where: { id: update.id },
            data: { enabled: update.enabled },
          })
        )
      );

      return { success: true };
    }),

  getRoles: protectedProcedure
    .query(() => {
      return Object.values(ROLES);
    }),

  getResources: protectedProcedure
    .query(() => {
      return Object.values(RESOURCES);
    }),

  getActions: protectedProcedure
    .query(() => {
      return Object.values(ACTIONS);
    }),
});
