import { Hono } from "hono";
import { requireAuth } from "../auth/middleware";
import AppLayout from "../../lib/layoutes/AppLayout";
import { CalendarPage } from "./pages/CalendarPage";

const app = new Hono().use(requireAuth).get("/", async (c) => {
  return c.render(
    <AppLayout currentPath={c.req.path}>
      <CalendarPage />
    </AppLayout>
  );
});

export default app;
