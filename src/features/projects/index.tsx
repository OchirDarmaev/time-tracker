import { Hono } from "hono";
import * as v from "valibot";
import { sValidator } from "@hono/standard-validator";
import { projectService } from "./service";
import { CreateProjectPage } from "./components/CreateProjectPage";
import { EditProjectPage } from "./components/EditProjectPage";
import { requireAuth } from "../auth/middleware";
import DashboardLayout from "../../lib/layouts/DashboardLayout";
import { ProjectsListPage } from "./components/ProjectsListPage";

const app = new Hono()
  .use(requireAuth)

  // Projects routes
  .get("/", async (c) => {
    const projects = await projectService.getAll(true);
    return c.render(
      <DashboardLayout currentPath={c.req.path}>
        <ProjectsListPage projects={projects} />
      </DashboardLayout>
    );
  })
  .get("/new", async (c) => {
    return c.render(
      <DashboardLayout currentPath={c.req.path}>
        <CreateProjectPage />
      </DashboardLayout>
    );
  })
  .post(
    "/",
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
        return c.render(<ProjectsListPage projects={projects} />);
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to create project";
        return c.render(<CreateProjectPage errorMessage={errorMessage} />);
      }
    }
  )
  .patch(
    "/:id/name",
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
        return c.render(<ProjectsListPage projects={projects} />);
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to update project";
        return c.text(errorMessage, 400);
      }
    }
  )
  .patch(
    "/:id/color",
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
        return c.render(<ProjectsListPage projects={projects} />);
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
    "/:id/suppress",
    sValidator(
      "param",
      v.object({ id: v.pipe(v.string(), v.transform(Number)) })
    ),
    async (c) => {
      try {
        const { id } = c.req.valid("param");
        await projectService.toggleSuppress(id);
        const projects = await projectService.getAll(true);
        return c.render(<ProjectsListPage projects={projects} />);
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to suppress project";
        return c.text(errorMessage, 400);
      }
    }
  )
  .get(
    "/:id/edit",
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
        <DashboardLayout currentPath={c.req.path}>
          <EditProjectPage project={project} />
        </DashboardLayout>
      );
    }
  )
  .patch(
    "/:id",
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
        return c.render(<ProjectsListPage projects={projects} />);
      } catch (error: unknown) {
        const { id } = c.req.valid("param");
        const project = await projectService.getById(id);
        const errorMessage =
          error instanceof Error ? error.message : "Failed to update project";
        if (project) {
          return c.render(
            <EditProjectPage project={project} errorMessage={errorMessage} />
          );
        }
        return c.text(errorMessage, 400);
      }
    }
  );

export default app;
