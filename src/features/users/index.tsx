import { Hono } from "hono";
import { requireAuth } from "../auth/middleware";
import DashboardLayout from "../../lib/layouts/DashboardLayout";
import { UsersManagementPage } from "./components/UsersManagementPage";

const app = new Hono().use(requireAuth).get("/", async (c) => {
  return c.render(
    <DashboardLayout currentPath={c.req.path}>
      <UsersManagementPage />
    </DashboardLayout>
  );
});

export default app;
