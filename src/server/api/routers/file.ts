import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { unlink } from "fs/promises";
import { join } from "path";

export const fileRouter = createTRPCRouter({
  getAll: publicProcedure
    .input(z.object({
      entityType: z.string().optional(),
      entityId: z.string().optional(),
    }).optional())
    .query(async ({ ctx, input }) => {
      const where = input ? {
        entityType: input.entityType,
        entityId: input.entityId,
      } : undefined;

      return ctx.db.file.findMany({
        where,
        orderBy: { createdAt: "desc" },
      });
    }),

  getByEntity: publicProcedure
    .input(z.object({
      entityType: z.string(),
      entityId: z.string(),
    }))
    .query(async ({ ctx, input }) => {
      return ctx.db.file.findMany({
        where: {
          entityType: input.entityType,
          entityId: input.entityId,
        },
        orderBy: { createdAt: "desc" },
      });
    }),

  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const file = await ctx.db.file.findUnique({
        where: { id: input.id },
      });

      if (file) {
        const filepath = join(process.cwd(), "public", file.url);
        try {
          await unlink(filepath);
        } catch (error) {
          console.error("Error deleting file from filesystem:", error);
        }
      }

      return ctx.db.file.delete({
        where: { id: input.id },
      });
    }),
});
