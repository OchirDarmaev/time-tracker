import { initServer } from "@ts-rest/express";
import { adminSystemReportsContract } from "../contracts/admin_system_reports_contract.js";
import { AuthStubRequest } from "../middleware/auth_stub.js";
import { renderSystemReportsPage } from "../renderSystemReportsPage.js";
import { renderSystemReports } from "../renderSystemReports.js";

const s = initServer();

export const adminSystemReportsRouter = s.router(adminSystemReportsContract, {
  adminSystemReports: async ({ req }) => {
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

    const html = renderSystemReportsPage(authReq);
    return {
      status: 200,
      body: html,
    };
  },

  adminSystemReportsData: async ({ req }) => {
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

    const html = renderSystemReports();
    return {
      status: 200,
      body: html,
    };
  },
});
