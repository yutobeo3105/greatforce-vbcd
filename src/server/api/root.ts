import { contactRouter } from "~/server/api/routers/contact";
import { companyRouter } from "~/server/api/routers/company";
import { dealRouter } from "~/server/api/routers/deal";
import { activityRouter } from "~/server/api/routers/activity";
import { noteRouter } from "~/server/api/routers/note";
import { tagRouter } from "~/server/api/routers/tag";
import { fileRouter } from "~/server/api/routers/file";
import { searchRouter } from "~/server/api/routers/search";
import { customFieldRouter } from "~/server/api/routers/customField";
import { emailTemplateRouter } from "~/server/api/routers/emailTemplate";
import { productRouter } from "~/server/api/routers/product";
import { quoteRouter } from "~/server/api/routers/quote";
import { commentRouter } from "~/server/api/routers/comment";
import { userRouter } from "~/server/api/routers/user";
import { importExportRouter } from "~/server/api/routers/importExport";
import { bulkActionRouter } from "~/server/api/routers/bulkAction";
import { permissionRouter } from "~/server/api/routers/permission";
import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";

export const appRouter = createTRPCRouter({
  contact: contactRouter,
  company: companyRouter,
  deal: dealRouter,
  activity: activityRouter,
  note: noteRouter,
  tag: tagRouter,
  file: fileRouter,
  search: searchRouter,
  customField: customFieldRouter,
  emailTemplate: emailTemplateRouter,
  product: productRouter,
  quote: quoteRouter,
  comment: commentRouter,
  user: userRouter,
  importExport: importExportRouter,
  bulkAction: bulkActionRouter,
  permission: permissionRouter,
});

export type AppRouter = typeof appRouter;

export const createCaller = createCallerFactory(appRouter);
