import { Hono } from "hono";
import DashboardPage from "./components/DashboardPage";
import DashboardLayout from "./components/DashboardLayout";
import { requireAuth } from "../auth/middleware";

const app = new Hono()
  .use(requireAuth)
 
  .get("/", (c) => {
    return c.render(
      <DashboardLayout currentPath={c.req.path}><DashboardPage /></DashboardLayout>);
  });

export default app;
