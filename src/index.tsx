import { Hono } from "hono";
import { renderer } from "./lib/layouts/renderer";
import home from "./features/home";
import auth from "./features/auth";
import dashboard from "./features/dashboard";
import quickTimeReport from "./features/quickTimeReport";
import timeTrackingReport from "./features/timeTrackingReport";
import projects from "./features/projects";
import reports from "./features/reports";
import usersManagement from "./features/usersManagement";
import users from "./features/users";
import calendarManagement from "./features/calendarManagement";
import calendar from "./features/calendar";
import { db } from "./lib/db";
import { users as usersTable } from "./db/schema";
import type { Resource } from "sst";



const app = new Hono<{ Bindings: typeof Resource }>()
  .use("/", renderer)
  .use("/auth", renderer)
  .use("/dashboard", renderer)
  .use("/projects", renderer)
  .use("/projects/new", renderer)
  .use("/projects/:id/edit", renderer)
  .use("/calendar", renderer)
  .use("/users", renderer)
  .use("/reports", renderer)
  .route("/", home)
  .route("/auth", auth)
  .route("/dashboard", dashboard)
  .route("/users", users)
  .route("/projects", projects)
  .route("/reports", reports)
  .route("/calendar", calendar)
  .route("/partials/quickTimeReport", quickTimeReport)
  .route("/partials/timeTrackingReport", timeTrackingReport)
  .route("/partials/usersManagement", usersManagement)
  .route("/partials/calendarManagement", calendarManagement)
  .get("/api/db", async (c) => {
    const result = await db(c).select().from(usersTable).all();
    return c.text(JSON.stringify(result));
  });

export default app;

export type AppType = typeof app;
