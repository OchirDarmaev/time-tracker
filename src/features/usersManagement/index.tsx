import { Hono } from "hono";
import * as v from "valibot";
import { sValidator } from "@hono/standard-validator";

import { requireAuth } from "../auth/middleware";
import {
  userService,
  projectService,
  projectUserService,
} from "../admin/service";
import { UsersManagement } from "./components/UsersManagement";

const app = new Hono()
  .use(requireAuth)
  .get("/", async (c) => {
    const users = await userService.getAll();
    const projects = await projectService.getAll(true);
    const projectUsers = await projectUserService.getAll();
    return c.render(
      <UsersManagement
        users={users}
        projects={projects}
        projectUsers={projectUsers}
      />
    );
  })
  .post(
    "/assign",
    sValidator(
      "form",
      v.object({
        user_id: v.pipe(v.string(), v.transform(Number)),
        project_id: v.pipe(v.string(), v.transform(Number)),
      })
    ),
    async (c) => {
      try {
        const { user_id, project_id } = c.req.valid("form");
        const existing = await projectUserService.getByUserAndProject(
          user_id,
          project_id
        );
        if (existing) {
          if (existing.suppressed === 1) {
            await projectUserService.toggleSuppressByUserAndProject(
              user_id,
              project_id
            );
          }
        } else {
          await projectUserService.create(user_id, project_id);
        }
        const users = await userService.getAll();
        const projects = await projectService.getAll(true);
        const projectUsers = await projectUserService.getAll();
        return c.render(
          <UsersManagement
            users={users}
            projects={projects}
            projectUsers={projectUsers}
          />
        );
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Failed to assign user to project";
        return c.text(errorMessage, 400);
      }
    }
  )
  .post(
    "/remove",
    sValidator(
      "form",
      v.object({
        user_id: v.pipe(v.string(), v.transform(Number)),
        project_id: v.pipe(v.string(), v.transform(Number)),
      })
    ),
    async (c) => {
      try {
        const { user_id, project_id } = c.req.valid("form");
        const existing = await projectUserService.getByUserAndProject(
          user_id,
          project_id
        );
        if (!existing) {
          return c.text("User is not assigned to this project", 400);
        }
        if (existing.suppressed === 0) {
          await projectUserService.toggleSuppressByUserAndProject(
            user_id,
            project_id
          );
        }
        const users = await userService.getAll();
        const projects = await projectService.getAll(true);
        const projectUsers = await projectUserService.getAll();
        return c.render(
          <UsersManagement
            users={users}
            projects={projects}
            projectUsers={projectUsers}
          />
        );
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Failed to remove user from project";
        return c.text(errorMessage, 400);
      }
    }
  );

export default app;
