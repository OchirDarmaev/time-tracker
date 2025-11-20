import { initServer } from "@ts-rest/express";
import { adminProjectsContract } from "./contract.js";
import { AuthContext } from "@/shared/middleware/auth_stub.js";
import { isAuthContext } from "@/shared/middleware/isAuthContext.js";
import { projectModel } from "@/shared/models/project.js";
import { ProjectsList } from "./views/projects_list.js";
import { EditProject } from "./views/edit_project.js";
import { CreateProject } from "./views/create_project.js";
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
    const html = ProjectsList(projects, authReq);

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
      const html = ProjectsList(projects, authReq);
      return {
        status: 200,
        body: String(Layout(html, authReq, "admin")),
      };
    } catch (error: any) {
      let errorMessage = "Failed to create project";
      if (error.message?.includes("UNIQUE constraint")) {
        errorMessage = "Project with this name already exists";
      } else if (error.message) {
        errorMessage = error.message;
      }
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
      const html = ProjectsList(projects, authReq);
      return {
        status: 200,
        body: String(html),
      };
    } catch (error: any) {
      if (error.message?.includes("system projects")) {
        return {
          status: 400,
          body: { body: error.message },
        };
      }
      if (error.message?.includes("UNIQUE constraint")) {
        return {
          status: 400,
          body: { body: "Project with this name already exists" },
        };
      }
      return {
        status: 400,
        body: { body: error.message || "Failed to update project" },
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
      const html = ProjectsList(projects, authReq);
      return {
        status: 200,
        body: String(html),
      };
    } catch (error: any) {
      return {
        status: 400,
        body: { body: error.message || "Failed to update project color" },
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
      const html = ProjectsList(projects, authReq);
      return {
        status: 200,
        body: String(html),
      };
    } catch (error: any) {
      if (error.message?.includes("system projects")) {
        return {
          status: 400,
          body: { body: error.message },
        };
      }
      return {
        status: 400,
        body: { body: error.message || "Failed to suppress project" },
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
      const html = ProjectsList(projects, authReq);
      return {
        status: 200,
        body: String(Layout(html, authReq, "admin")),
      };
    } catch (error: any) {
      let errorMessage = "Failed to update project";
      if (error.message?.includes("system projects")) {
        errorMessage = error.message;
      } else if (error.message?.includes("UNIQUE constraint")) {
        errorMessage = "Project with this name already exists";
      } else if (error.message) {
        errorMessage = error.message;
      }
      const html = EditProject(project, authReq, errorMessage);
      return {
        status: 400,
        body: String(Layout(html, authReq, "admin")),
      };
    }
  },
});
