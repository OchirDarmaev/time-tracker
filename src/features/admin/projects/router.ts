import { initServer } from "@ts-rest/express";
import { adminProjectsContract } from "./contract.js";
import { AuthContext } from "@/shared/middleware/auth_stub.js";
import { isAuthContext } from "@/shared/middleware/isAuthContext.js";
import { projectModel } from "@/shared/models/project.js";
import { projectUserModel } from "@/shared/models/project_user.js";
import { userModel } from "@/shared/models/user.js";
import { ProjectsList } from "./views/projects_list.js";
import { EditProject } from "./views/edit_project.js";
import { CreateProject } from "./views/create_project.js";
import { ManageProjectUsers } from "./views/manage_project_users.js";
import { Layout } from "@/shared/utils/layout.js";

const s = initServer();

export const adminProjectsRouter = s.router(adminProjectsContract, {
  list: async (req) => {
    if (!isAuthContext(req.req)) {
      return {
        status: 401,
        body: { body: "Unauthorized" },
      };
    }

    const authReq = req.req as unknown as AuthContext;
    if (!authReq.currentUser) {
      return {
        status: 401,
        body: { body: "Unauthorized" },
      };
    }

    if (!authReq.currentUser.roles.includes("admin")) {
      return {
        status: 403,
        body: { body: "Forbidden" },
      };
    }

    const projects = projectModel.getAll(true);
    const html = ProjectsList(projects);

    if (req.headers["hx-request"] === "true") {
      return {
        status: 200,
        body: String(html),
      };
    }

    return {
      status: 200,
      body: String(Layout(html, authReq, "admin")),
    };
  },

  createPage: async (req) => {
    if (!isAuthContext(req.req)) {
      return {
        status: 401,
        body: { body: "Unauthorized" },
      };
    }

    const authReq = req.req as unknown as AuthContext;
    if (!authReq.currentUser) {
      return {
        status: 401,
        body: { body: "Unauthorized" },
      };
    }

    if (!authReq.currentUser.roles.includes("admin")) {
      return {
        status: 403,
        body: { body: "Forbidden" },
      };
    }

    const html = CreateProject(authReq);

    if (req.headers["hx-request"] === "true") {
      return {
        status: 200,
        body: String(html),
      };
    }

    return {
      status: 200,
      body: String(Layout(html, authReq, "admin")),
    };
  },

  create: async ({ body, req }) => {
    const authReq = req as unknown as AuthContext;

    if (!authReq.currentUser) {
      return {
        status: 401,
        body: { body: "Unauthorized" },
      };
    }

    if (!authReq.currentUser.roles.includes("admin")) {
      return {
        status: 403,
        body: { body: "Forbidden" },
      };
    }

    try {
      const color = body.color && body.color.trim() !== "" ? body.color : "#14b8a6";
      projectModel.create(body.name, color, false);
      const projects = projectModel.getAll(true);
      const html = ProjectsList(projects);
      return {
        status: 200,
        body: String(Layout(html, authReq, "admin")),
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Failed to create project";
      const html = CreateProject(authReq, errorMessage);
      return {
        status: 400,
        body: String(Layout(html, authReq, "admin")),
      };
    }
  },

  updateName: async ({ params, body, req }) => {
    const authReq = req as unknown as AuthContext;

    if (!authReq.currentUser) {
      return {
        status: 401,
        body: { body: "Unauthorized" },
      };
    }

    if (!authReq.currentUser.roles.includes("admin")) {
      return {
        status: 403,
        body: { body: "Forbidden" },
      };
    }

    const project = projectModel.getById(params.id);
    if (!project) {
      return {
        status: 404,
        body: { body: "Project not found" },
      };
    }

    try {
      projectModel.updateName(params.id, body.name);
      const projects = projectModel.getAll(true);
      const html = ProjectsList(projects);
      return {
        status: 200,
        body: String(html),
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Failed to update project";
      if (error instanceof Error && error.message?.includes("system projects")) {
        return {
          status: 400,
          body: { body: errorMessage },
        };
      }
      if (error instanceof Error && error.message?.includes("UNIQUE constraint")) {
        return {
          status: 400,
          body: { body: "Project with this name already exists" },
        };
      }
      return {
        status: 400,
        body: { body: errorMessage },
      };
    }
  },

  updateColor: async ({ params, body, req }) => {
    const authReq = req as unknown as AuthContext;

    if (!authReq.currentUser) {
      return {
        status: 401,
        body: { body: "Unauthorized" },
      };
    }

    if (!authReq.currentUser.roles.includes("admin")) {
      return {
        status: 403,
        body: { body: "Forbidden" },
      };
    }

    const project = projectModel.getById(params.id);
    if (!project) {
      return {
        status: 404,
        body: { body: "Project not found" },
      };
    }

    try {
      projectModel.updateColor(params.id, body.color);
      const projects = projectModel.getAll(true);
      const html = ProjectsList(projects);
      return {
        status: 200,
        body: String(html),
      };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to update project color";
      return {
        status: 400,
        body: { body: errorMessage },
      };
    }
  },

  toggleSuppress: async ({ params, req }) => {
    const authReq = req as unknown as AuthContext;

    if (!authReq.currentUser) {
      return {
        status: 401,
        body: { body: "Unauthorized" },
      };
    }

    if (!authReq.currentUser.roles.includes("admin")) {
      return {
        status: 403,
        body: { body: "Forbidden" },
      };
    }

    const project = projectModel.getById(params.id);
    if (!project) {
      return {
        status: 404,
        body: { body: "Project not found" },
      };
    }

    try {
      projectModel.toggleSuppress(params.id);
      const projects = projectModel.getAll(true);
      const html = ProjectsList(projects);
      return {
        status: 200,
        body: String(html),
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Failed to suppress project";
      if (error instanceof Error && error.message?.includes("system projects")) {
        return {
          status: 400,
          body: { body: errorMessage },
        };
      }
      return {
        status: 400,
        body: { body: errorMessage },
      };
    }
  },

  edit: async (req) => {
    if (!isAuthContext(req.req)) {
      return {
        status: 401,
        body: { body: "Unauthorized" },
      };
    }

    const authReq = req.req as unknown as AuthContext;
    const params = req.params;
    if (!authReq.currentUser) {
      return {
        status: 401,
        body: { body: "Unauthorized" },
      };
    }

    if (!authReq.currentUser.roles.includes("admin")) {
      return {
        status: 403,
        body: { body: "Forbidden" },
      };
    }

    const project = projectModel.getById(params.id);
    if (!project) {
      return {
        status: 404,
        body: { body: "Project not found" },
      };
    }

    if (project.isSystem) {
      return {
        status: 403,
        body: { body: "Cannot edit system projects" },
      };
    }

    const html = EditProject(project, authReq);

    if (req.headers["hx-request"] === "true") {
      return {
        status: 200,
        body: String(html),
      };
    }

    return {
      status: 200,
      body: String(Layout(html, authReq, "admin")),
    };
  },

  update: async ({ params, body, req }) => {
    const authReq = req as unknown as AuthContext;

    if (!authReq.currentUser) {
      return {
        status: 401,
        body: { body: "Unauthorized" },
      };
    }

    if (!authReq.currentUser.roles.includes("admin")) {
      return {
        status: 403,
        body: { body: "Forbidden" },
      };
    }

    const project = projectModel.getById(params.id);
    if (!project) {
      return {
        status: 404,
        body: { body: "Project not found" },
      };
    }

    if (project.isSystem) {
      return {
        status: 403,
        body: { body: "Cannot edit system projects" },
      };
    }

    try {
      projectModel.updateName(params.id, body.name);
      projectModel.updateColor(params.id, body.color);
      // Handle suppressed flag: checkbox sends "true" when checked, nothing when unchecked
      // If undefined, it means unchecked, so set to false
      const suppressed = body.suppressed ?? false;
      projectModel.updateSuppressed(params.id, suppressed);
      const projects = projectModel.getAll(true);
      const html = ProjectsList(projects);
      return {
        status: 200,
        body: String(Layout(html, authReq, "admin")),
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Failed to update project";
      const html = EditProject(project, authReq, errorMessage);
      return {
        status: 400,
        body: String(Layout(html, authReq, "admin")),
      };
    }
  },

  manageUsers: async (req) => {
    if (!isAuthContext(req.req)) {
      return {
        status: 401,
        body: { body: "Unauthorized" },
      };
    }

    const authReq = req.req as unknown as AuthContext;
    if (!authReq.currentUser) {
      return {
        status: 401,
        body: { body: "Unauthorized" },
      };
    }

    if (!authReq.currentUser.roles.includes("admin")) {
      return {
        status: 403,
        body: { body: "Forbidden" },
      };
    }

    const users = userModel.getAll();
    const projects = projectModel.getAll(true);
    const projectUsers = projectUserModel.getAll();
    const html = ManageProjectUsers({ users, projects, projectUsers });

    if (req.headers["hx-request"] === "true") {
      return {
        status: 200,
        body: String(html),
      };
    }

    return {
      status: 200,
      body: String(Layout(html, authReq, "admin")),
    };
  },

  assignUserToProject: async ({ body, req }) => {
    const authReq = req as unknown as AuthContext;

    if (!authReq.currentUser) {
      return {
        status: 401,
        body: { body: "Unauthorized" },
      };
    }

    if (!authReq.currentUser.roles.includes("admin")) {
      return {
        status: 403,
        body: { body: "Forbidden" },
      };
    }

    try {
      // Check if assignment already exists
      const existing = projectUserModel.getByUserAndProject(body.user_id, body.project_id);
      if (existing) {
        // If it exists but is suppressed, restore it (unsuppress)
        if (existing.suppressed) {
          projectUserModel.toggleSuppressByUserAndProject(body.user_id, body.project_id);
        }
      } else {
        // Create new assignment
        projectUserModel.create(body.user_id, body.project_id);
      }

      const users = userModel.getAll();
      const projects = projectModel.getAll(true);
      const projectUsers = projectUserModel.getAll();
      const html = ManageProjectUsers({ users, projects, projectUsers });

      return {
        status: 200,
        body: String(html),
      };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to assign user to project";
      return {
        status: 400,
        body: { body: errorMessage },
      };
    }
  },

  removeUserFromProject: async ({ body, req }) => {
    const authReq = req as unknown as AuthContext;

    if (!authReq.currentUser) {
      return {
        status: 401,
        body: { body: "Unauthorized" },
      };
    }

    if (!authReq.currentUser.roles.includes("admin")) {
      return {
        status: 403,
        body: { body: "Forbidden" },
      };
    }

    try {
      const existing = projectUserModel.getByUserAndProject(body.user_id, body.project_id);
      if (!existing) {
        return {
          status: 400,
          body: { body: "User is not assigned to this project" },
        };
      }

      // Suppress the user instead of deleting
      if (!existing.suppressed) {
        projectUserModel.toggleSuppressByUserAndProject(body.user_id, body.project_id);
      }

      const users = userModel.getAll();
      const projects = projectModel.getAll(true);
      const projectUsers = projectUserModel.getAll();
      const html = ManageProjectUsers({ users, projects, projectUsers });

      return {
        status: 200,
        body: String(html),
      };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to remove user from project";
      return {
        status: 400,
        body: { body: errorMessage },
      };
    }
  },
});
