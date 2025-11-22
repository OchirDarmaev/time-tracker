import { Hono } from "hono";
import { renderer } from "./lib/renderer";
import home from "./features/home";
import auth from "./features/auth";
import dashboard from "./features/dashboard";
import quickTimeReport from "./features/quickTimeReport";
const app = new Hono()
  .use("/", renderer)
  .use("/auth", renderer)
  .use("/dashboard", renderer)
  .route("/", home)
  .route("/auth", auth)
  .route("/dashboard", dashboard)
  .route("/partials/quickTimeReport", quickTimeReport);

export default app;

export type AppType = typeof app;
