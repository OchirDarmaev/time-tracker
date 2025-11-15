import { initServer } from "@ts-rest/express";
import { managerReportsContract } from "./contract.js";
import { AuthStubRequest } from "../../../shared/middleware/auth_stub.js";
import { renderWorkerReport } from "./views/worker_report.js";
import { renderProjectReport } from "./views/project_report.js";
import { renderReportsPage } from "./views/reports_page.js";

const s = initServer();

export const managerReportsRouter = s.router(managerReportsContract, {
  managerReports: async ({ req }) => {
    const authReq = req as unknown as AuthStubRequest;

    if (!authReq.currentUser) {
      return {
        status: 401,
        body: undefined,
      };
    }
    if (
      !authReq.currentUser.roles.includes("office-manager") &&
      !authReq.currentUser.roles.includes("admin")
    ) {
      return {
        status: 403,
        body: { body: "Forbidden" },
      };
    }

    const html = renderReportsPage(authReq);
    return {
      status: 200,
      body: html,
    };
  },

  managerReportsWorker: async ({ query, req }) => {
    const authReq = req as unknown as AuthStubRequest;

    if (!authReq.currentUser) {
      return {
        status: 401,
        body: undefined,
      };
    }
    if (
      !authReq.currentUser.roles.includes("office-manager") &&
      !authReq.currentUser.roles.includes("admin")
    ) {
      return {
        status: 403,
        body: { body: "Forbidden" },
      };
    }

    const userId = parseInt(query?.worker_id as string);
    if (!userId) {
      return {
        status: 200,
        body: '<p class="text-gray-500">Select a worker to view reports.</p>',
      };
    }
    const html = renderWorkerReport(userId);
    return {
      status: 200,
      body: html,
    };
  },

  managerReportsProject: async ({ query, req }) => {
    const authReq = req as unknown as AuthStubRequest;

    if (!authReq.currentUser) {
      return {
        status: 401,
        body: undefined,
      };
    }
    if (
      !authReq.currentUser.roles.includes("office-manager") &&
      !authReq.currentUser.roles.includes("admin")
    ) {
      return {
        status: 403,
        body: { body: "Forbidden" },
      };
    }

    const projectId = parseInt(query?.project_id as string);
    if (!projectId) {
      return {
        status: 200,
        body: '<p class="text-gray-500">Select a project to view reports.</p>',
      };
    }
    const html = renderProjectReport(projectId);
    return {
      status: 200,
      body: html,
    };
  },
});
