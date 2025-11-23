import { Hono } from "hono";
import * as v from "valibot";
import { sValidator } from "@hono/standard-validator";
import { projectService } from "./service";
import { calendarService } from "./service";
import { ProjectsList } from "./pages/projects_list";
import { CreateProject } from "./pages/create_project";
import { EditProject } from "./pages/edit_project";
import { CalendarManagement } from "./components/calendar_management";
import { requireAuth } from "../auth/middleware";
import { getMonthFromDate, formatDate } from "../../lib/date_utils";
import AppLayout from "../../lib/layoutes/AppLayout";
import { type Calendar } from "../../lib/mock_db";

const app = new Hono()
  .use(requireAuth)

  // Projects routes
  .get("/projects", async (c) => {
    const projects = await projectService.getAll(true);
    return c.render(
      <AppLayout currentPath={c.req.path}>
        <ProjectsList projects={projects} />
      </AppLayout>
    );
  })
  .get("/projects/new", async (c) => {
    return c.render(
      <AppLayout currentPath={c.req.path}>
        <CreateProject />
      </AppLayout>
    );
  })
  .post(
    "/projects",
    sValidator(
      "form",
      v.object({
        name: v.string(),
        color: v.optional(v.pipe(v.string(), v.regex(/^#[0-9A-Fa-f]{6}$/))),
      })
    ),
    async (c) => {
      try {
        const { name, color } = c.req.valid("form");
        const projectColor = color && color.trim() !== "" ? color : "#14b8a6";
        await projectService.create(name, projectColor, false);
        const projects = await projectService.getAll(true);
        return c.render(<ProjectsList projects={projects} />);
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to create project";
        return c.render(<CreateProject errorMessage={errorMessage} />);
      }
    }
  )
  .patch(
    "/projects/:id/name",
    sValidator(
      "param",
      v.object({ id: v.pipe(v.string(), v.transform(Number)) })
    ),
    sValidator("form", v.object({ name: v.string() })),
    async (c) => {
      try {
        const { id } = c.req.valid("param");
        const { name } = c.req.valid("form");
        await projectService.updateName(id, name);
        const projects = await projectService.getAll(true);
        return c.render(<ProjectsList projects={projects} />);
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to update project";
        return c.text(errorMessage, 400);
      }
    }
  )
  .patch(
    "/projects/:id/color",
    sValidator(
      "param",
      v.object({ id: v.pipe(v.string(), v.transform(Number)) })
    ),
    sValidator(
      "form",
      v.object({ color: v.pipe(v.string(), v.regex(/^#[0-9A-Fa-f]{6}$/)) })
    ),
    async (c) => {
      try {
        const { id } = c.req.valid("param");
        const { color } = c.req.valid("form");
        await projectService.updateColor(id, color);
        const projects = await projectService.getAll(true);
        return c.render(<ProjectsList projects={projects} />);
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Failed to update project color";
        return c.text(errorMessage, 400);
      }
    }
  )
  .patch(
    "/projects/:id/suppress",
    sValidator(
      "param",
      v.object({ id: v.pipe(v.string(), v.transform(Number)) })
    ),
    async (c) => {
      try {
        const { id } = c.req.valid("param");
        await projectService.toggleSuppress(id);
        const projects = await projectService.getAll(true);
        return c.render(<ProjectsList projects={projects} />);
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to suppress project";
        return c.text(errorMessage, 400);
      }
    }
  )
  .get(
    "/projects/:id/edit",
    sValidator(
      "param",
      v.object({ id: v.pipe(v.string(), v.transform(Number)) })
    ),
    async (c) => {
      const { id } = c.req.valid("param");
      const project = await projectService.getById(id);
      if (!project) {
        return c.text("Project not found", 404);
      }
      if (project.isSystem) {
        return c.text("Cannot edit system projects", 403);
      }
      return c.render(
        <AppLayout currentPath={c.req.path}>
          <EditProject project={project} />
        </AppLayout>
      );
    }
  )
  .patch(
    "/projects/:id",
    sValidator(
      "param",
      v.object({ id: v.pipe(v.string(), v.transform(Number)) })
    ),
    sValidator(
      "form",
      v.object({
        name: v.string(),
        color: v.pipe(v.string(), v.regex(/^#[0-9A-Fa-f]{6}$/)),
        suppressed: v.optional(
          v.pipe(
            v.string(),
            v.transform((val) => val === "true")
          )
        ),
      })
    ),
    async (c) => {
      try {
        const { id } = c.req.valid("param");
        const { name, color, suppressed } = c.req.valid("form");
        await projectService.updateName(id, name);
        await projectService.updateColor(id, color);
        if (suppressed !== undefined) {
          await projectService.updateSuppressed(id, suppressed);
        }
        const projects = await projectService.getAll(true);
        return c.render(<ProjectsList projects={projects} />);
      } catch (error: unknown) {
        const { id } = c.req.valid("param");
        const project = await projectService.getById(id);
        const errorMessage =
          error instanceof Error ? error.message : "Failed to update project";
        if (project) {
          return c.render(
            <EditProject project={project} errorMessage={errorMessage} />
          );
        }
        return c.text(errorMessage, 400);
      }
    }
  )
  // Calendar routes
  .get("/calendar", async (c) => {
    return c.render(
      <AppLayout currentPath={c.req.path}>
        <div
          hx-get="/admin/partials/calendar"
          hx-swap="outerHTML"
          hx-trigger="load"
        ></div>
      </AppLayout>
    );
  })
  .get(
    "/partials/calendar",
    sValidator("query", v.object({ month: v.optional(v.string()) })),
    async (c) => {
      const month =
        c.req.valid("query").month || getMonthFromDate(formatDate(new Date()));

      // Get calendar data for the entire year for yearly summary
      const year = new Date(month + "-01").getFullYear();
      const calendarDaysByMonth = new Map<string, Calendar[]>();

      for (let m = 0; m < 12; m++) {
        const monthStr = `${year}-${String(m + 1).padStart(2, "0")}`;
        const days = await calendarService.getByMonth(monthStr);
        calendarDaysByMonth.set(monthStr, days);
      }

      return c.render(
        <CalendarManagement
          month={month}
          calendarDaysByMonth={calendarDaysByMonth}
        />
      );
    }
  )
  .post(
    "/partials/calendar/day-type",
    sValidator(
      "form",
      v.object({
        date: v.string(),
        day_type: v.picklist(["workday", "public_holiday", "weekend"]),
      })
    ),
    async (c) => {
      const { date, day_type } = c.req.valid("form");
      await calendarService.createOrUpdate(date, day_type);
      const month = getMonthFromDate(date);

      // Get calendar data for the entire year for yearly summary
      const year = new Date(month + "-01").getFullYear();
      const calendarDaysByMonth = new Map<string, Calendar[]>();

      for (let m = 0; m < 12; m++) {
        const monthStr = `${year}-${String(m + 1).padStart(2, "0")}`;
        const days = await calendarService.getByMonth(monthStr);
        calendarDaysByMonth.set(monthStr, days);
      }

      return c.render(
        <CalendarManagement
          month={month}
          calendarDaysByMonth={calendarDaysByMonth}
        />
      );
    }
  );

export default app;
