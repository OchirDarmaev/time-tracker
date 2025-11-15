import { initServer } from "@ts-rest/express";
import { managerContract } from "../contracts/manager_contract.js";
import { AuthStubRequest } from "../middleware/auth_stub.js";
import { renderWorkerReport } from "../renderWorkerReport.js";
import { renderProjectReport } from "../renderProjectReport.js";
import { renderReportsPage } from "../renderReportsPage.js";

const s = initServer();

export const managerRouter = s.router(managerContract, {
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
