import { Hono } from "hono";
import { renderer } from "./lib/renderer";
import home from "./features/home";
import auth from "./features/auth";
import dashboard from "./features/dashboard";
import quickTimeReport from "./features/quickTimeReport";
import admin from "./features/admin";
import reports from "./features/reports";
const app = new Hono()
  .use("/", renderer)
  .use("/auth", renderer)
  .use("/dashboard", renderer)
  .use("/admin/projects", renderer)
  .use("/admin/calendar", renderer)
  .use("/reports", renderer)
  .route("/", home)
  .route("/auth", auth)
  .route("/dashboard", dashboard)
  .route("/partials/quickTimeReport", quickTimeReport)
  .route("/admin", admin)
  .route("/reports", reports);

export default app;

export type AppType = typeof app;
