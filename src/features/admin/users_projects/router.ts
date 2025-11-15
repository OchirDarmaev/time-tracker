import { initServer } from "@ts-rest/express";
import { adminUsersProjectsContract } from "./contract.js";
import { AuthStubRequest } from "../../../shared/middleware/auth_stub.js";
import { projectModel } from "../../../shared/models/project.js";
import { ProjectUser, projectUserModel } from "../../../shared/models/project_user.js";
import { renderUsersProjectsPage } from "./views/users_projects_page.js";
import { renderProjectWorkers } from "./views/project_workers.js";

const s = initServer();

export const adminUsersProjectsRouter = s.router(adminUsersProjectsContract, {
  adminUsersProjects: async ({ req }) => {
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

    const html = renderUsersProjectsPage(authReq);
    return {
      status: 200,
      body: html,
    };
  },

  adminUsersProjectsProject: async ({ query, req }) => {
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

    const projectId = parseInt(query?.project_id as string);
    if (!projectId) {
      return {
        status: 200,
        body: '<p class="text-gray-500">Select a project to manage workers.</p>',
      };
    }
    const html = renderProjectWorkers(projectId);
    return {
      status: 200,
      body: html,
    };
  },

  assignWorkerToProject: async ({ body, req }) => {
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

    const { project_id, user_id } = body;
    const projectId = parseInt(project_id as string);
    const userId = user_id;

    if (!projectId || !userId) {
      return {
        status: 400,
        body: { body: "Invalid project or user ID" },
      };
    }

    try {
      projectUserModel.create(userId, projectId);
      const html = renderProjectWorkers(projectId);
      return {
        status: 200,
        body: html,
      };
    } catch (error) {
      if (error instanceof Error && error.message.includes("UNIQUE constraint")) {
        return {
          status: 400,
          body: { body: "Worker already assigned to this project" },
        };
      }
      return {
        status: 500,
        body: { body: "Error assigning worker" },
      };
    }
  },

  removeWorkerFromProject: async ({ params, req }) => {
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

    const allProjects = projectModel.getAll(true);
    let projectUser: ProjectUser | null = null;
    for (const project of allProjects) {
      const projectUsers = projectUserModel.getByProjectId(project.id, true);
      const found = projectUsers.find((pu) => pu.id === id);
      if (found) {
        projectUser = found;
        break;
      }
    }

    if (!projectUser) {
      return {
        status: 404,
        body: { body: "Assignment not found" },
      };
    }

    projectUserModel.delete(id);
    const html = renderProjectWorkers(projectUser.project_id);
    return {
      status: 200,
      body: html,
    };
  },
});
