import { Hono } from "hono";
import { jsxRenderer } from "hono/jsx-renderer";
import { DashboardPage } from "./components/dashboard_page";
import { DashboardLayout } from "./components/dashboard_layout";
import { requireAuth } from "../auth/middleware";

const app = new Hono()
  .use(requireAuth)
  .use(
    "*",
    jsxRenderer(({ children, Layout }, c) => {
      return (
        <Layout>
          <DashboardLayout currentPath={c.req.path}>{children}</DashboardLayout>
        </Layout>
      );
    })
  )
  .get("/", (c) => {
    return c.render(<DashboardPage />);
  });

export default app;
