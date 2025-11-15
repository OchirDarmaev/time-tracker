import { initServer } from "@ts-rest/express";
import { rootContract } from "./contract.js";
import { AuthStubRequest } from "../../shared/middleware/auth_stub.js";

const s = initServer();

export const rootRouter = s.router(rootContract, {
  root: async ({ req, res }) => {
    const authReq = req as unknown as AuthStubRequest;
    const currentUser = authReq.currentUser;
    if (currentUser) {
      if (currentUser.roles.includes("admin")) {
        res.setHeader("Location", "/admin/projects");
        return {
          status: 302,
          body: undefined,
        };
      } else if (currentUser.roles.includes("office-manager")) {
        res.setHeader("Location", "/manager/reports");
        return {
          status: 302,
          body: undefined,
        };
      } else if (currentUser.roles.includes("account")) {
        res.setHeader("Location", "/account/time");
        return {
          status: 302,
          body: undefined,
        };
      }
    }
    res.setHeader("Location", "/");
    return {
      status: 302,
      body: undefined,
    };
  },
});
