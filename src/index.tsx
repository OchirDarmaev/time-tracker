import { Hono } from "hono";
import { renderer } from "./lib/layoutes/renderer";
import home from "./features/home";
import auth from "./features/auth";
import dashboard from "./features/dashboard";
import quickTimeReport from "./features/quickTimeReport";
import timeTrackingReport from "./features/timeTrackingReport";
import admin from "./features/admin";
import reports from "./features/reports";
import usersManagement from "./features/usersManagement";
import users from "./features/users";
const app = new Hono()
  .use("/", renderer)
  .use("/auth", renderer)
  .use("/dashboard", renderer)
  .use("/admin/projects", renderer)
  .use("/admin/calendar", renderer)
  .use("/users", renderer)
  .use("/reports", renderer)
  .route("/", home)
  .route("/auth", auth)
  .route("/dashboard", dashboard)
  .route("/users", users)
  .route("/partials/quickTimeReport", quickTimeReport)
  .route("/partials/timeTrackingReport", timeTrackingReport)
  .route("/partials/usersManagement", usersManagement)
  .route("/admin", admin)
  .route("/reports", reports);

export default app;

export type AppType = typeof app;
