import { Hono } from "hono";
import { requireAuth } from "../auth/middleware";
import AppLayout from "../../lib/layoutes/AppLayout";
import { UsersManagementPage } from "./pages/UsersPage";

const app = new Hono().use(requireAuth).get("/", async (c) => {
  return c.render(
    <AppLayout currentPath={c.req.path}>
      <UsersManagementPage />
    </AppLayout>
  );
});

export default app;
