import { Hono } from "hono";
import { requireAuth } from "../auth/middleware";
import DashboardLayout from "../../lib/layouts/DashboardLayout";
import { CalendarPage } from "./components/CalendarPage";

const app = new Hono().use(requireAuth).get("/", async (c) => {
  return c.render(
    <DashboardLayout currentPath={c.req.path}>
      <CalendarPage />
    </DashboardLayout>
  );
});

export default app;
