import { z } from "zod";
import bcrypt from "bcryptjs";
import { createTRPCRouter, publicProcedure, protectedProcedure } from "~/server/api/trpc";

export const userRouter = createTRPCRouter({
  getAll: protectedProcedure
    .input(z.object({
      role: z.enum(["ADMIN", "MANAGER", "SALES_REP", "VIEWER"]).optional(),
      isActive: z.boolean().optional(),
    }).optional())
    .query(async ({ ctx, input }) => {
      const where: {role?: string; isActive?: boolean} = {};
      
      if (input?.role) {
        where.role = input.role;
      }
      
      if (input?.isActive !== undefined) {
        where.isActive = input.isActive;
      }

      const users = await ctx.db.user.findMany({
        where,
        orderBy: { createdAt: "desc" },
      });
      
      return users.map(({ password: _, ...user }) => user);
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const user = await ctx.db.user.findUnique({
        where: { id: input.id },
      });
      
      if (!user) return null;
      
      const { password: _, ...userWithoutPassword } = user;
      return userWithoutPassword;
    }),

  create: protectedProcedure
    .input(z.object({
      email: z.string().email(),
      name: z.string().min(1),
      password: z.string().min(6),
      role: z.enum(["ADMIN", "MANAGER", "SALES_REP", "VIEWER"]).optional(),
      phone: z.string().optional(),
      avatar: z.string().optional(),
      isActive: z.boolean().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const hashedPassword = await bcrypt.hash(input.password, 10);
      
      const user = await ctx.db.user.create({
        data: {
          email: input.email,
          name: input.name,
          password: hashedPassword,
          role: input.role ?? "SALES_REP",
          isActive: input.isActive ?? true,
        },
      });
      
      const { password: _, ...userWithoutPassword } = user;
      return userWithoutPassword;
    }),

  update: protectedProcedure
    .input(z.object({
      id: z.string(),
      email: z.string().email().optional(),
      name: z.string().min(1).optional(),
      password: z.string().min(6).optional(),
      role: z.enum(["ADMIN", "MANAGER", "SALES_REP", "VIEWER"]).optional(),
      phone: z.string().optional(),
      avatar: z.string().optional(),
      isActive: z.boolean().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { id, password, ...data } = input;
      
      const updateData: typeof data & { password?: string } = data;
      
      if (password) {
        updateData.password = await bcrypt.hash(password, 10);
      }
      
      const user = await ctx.db.user.update({
        where: { id },
        data: updateData,
      });
      
      const { password: _, ...userWithoutPassword } = user;
      return userWithoutPassword;
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.user.delete({
        where: { id: input.id },
      });
    }),

  getRoles: publicProcedure
    .query(() => {
      return [
        { value: "ADMIN", label: "Admin", description: "Full system access" },
        { value: "MANAGER", label: "Manager", description: "Team management and reports" },
        { value: "SALES_REP", label: "Sales Rep", description: "Standard CRM access" },
        { value: "VIEWER", label: "Viewer", description: "Read-only access" },
      ];
    }),
});
