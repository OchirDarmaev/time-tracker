import { Hono } from "hono";
import { DashboardPage } from "./components/dashboard_page";
import { requireAuth } from "./middleware";

const app = new Hono()
  .use("*", requireAuth)
  .get("/", (c) => c.render(<DashboardPage />));

export default app;
