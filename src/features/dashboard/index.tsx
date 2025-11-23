import { Hono } from "hono";
import DashboardPage from "./DashboardPage";
import AppLayout from "../../lib/layoutes/AppLayout";
import { requireAuth } from "../auth/middleware";

const app = new Hono()
  .use(requireAuth)

  .get("/", (c) => {
    return c.render(
      <AppLayout currentPath={c.req.path}>
        <DashboardPage />
      </AppLayout>
    );
  });

export default app;
