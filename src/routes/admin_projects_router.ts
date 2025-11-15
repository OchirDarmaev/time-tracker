import { initServer } from "@ts-rest/express";
import { adminProjectsContract } from "../contracts/admin_projects_contract.js";
import { AuthStubRequest } from "../middleware/auth_stub.js";
import { projectModel } from "../models/project.js";
import { validateProjectName } from "../utils/validation.js";
import { renderProjectsPage } from "../renderProjectsPage.js";
import { renderProjectList } from "../views/components/project_list_component.js";

const s = initServer();

export const adminProjectsRouter = s.router(adminProjectsContract, {
  adminProjects: async ({ req }) => {
    const authReq = req as unknown as AuthStubRequest;

    if (!authReq.currentUser) {
      return {
        status: 401,
        body: undefined,
      };
    }
    if (!authReq.currentUser.roles.includes("admin")) {
      return {
        status: 403,
        body: { body: "Forbidden" },
      };
    }

    const html = renderProjectsPage(authReq);
    return {
      status: 200,
      body: html,
    };
  },

  createProject: async ({ body, req }) => {
    const authReq = req as unknown as AuthStubRequest;

    if (!authReq.currentUser) {
      return {
        status: 401,
        body: undefined,
      };
    }
    if (!authReq.currentUser.roles.includes("admin")) {
      return {
        status: 403,
        body: { body: "Forbidden" },
      };
    }

    const { name } = body;

    if (!validateProjectName(name)) {
      return {
        status: 400,
        body: { body: "Invalid project name" },
      };
    }

    try {
      projectModel.create(name.trim());
      const projects = projectModel.getAll(true);
      const html = renderProjectList({
        projects: projects.map((p) => ({
          id: p.id,
          name: p.name,
          suppressed: p.suppressed || false,
        })),
      });
      return {
        status: 200,
        body: html,
      };
    } catch (error) {
      if (error instanceof Error && error.message.includes("UNIQUE constraint")) {
        return {
          status: 400,
          body: { body: "Project name already exists" },
        };
      }
      return {
        status: 500,
        body: { body: "Error creating project" },
      };
    }
  },

  toggleProjectSuppress: async ({ params, req }) => {
    const authReq = req as unknown as AuthStubRequest;

    if (!authReq.currentUser) {
      return {
        status: 401,
        body: undefined,
      };
    }
    if (!authReq.currentUser.roles.includes("admin")) {
      return {
        status: 403,
        body: { body: "Forbidden" },
      };
    }

    const id = parseInt(params.id);
    projectModel.toggleSuppress(id);
    const projects = projectModel.getAll(true);
    const html = renderProjectList({
      projects: projects.map((p) => ({
        id: p.id,
        name: p.name,
        suppressed: p.suppressed || false,
      })),
    });
    return {
      status: 200,
      body: html,
    };
  },
});
