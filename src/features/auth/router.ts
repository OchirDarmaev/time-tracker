import { initServer } from "@ts-rest/express";
import { authContract } from "./contract.js";
import { AuthStubRequest } from "../../shared/middleware/auth_stub.js";
import { userModel, UserRole } from "../../shared/models/user.js";
import { renderNavBar } from "../../shared/utils/layout.js";

const s = initServer();

export const authRouter = s.router(authContract, {
  setUser: async ({ body, req, res }) => {
    const authReq = req as unknown as AuthStubRequest;
    const userId = body.user_id;
    if (userId) {
      authReq.session!.userId = userId;
      const user = userModel.getById(userId);
      if (user && user.roles.length > 0) {
        // Set to the first role, or keep current role if user has it
        const currentRole = authReq.session!.userRole as UserRole | undefined;
        if (currentRole && user.roles.includes(currentRole)) {
          authReq.session!.userRole = currentRole;
        } else {
          authReq.session!.userRole = user.roles[0];
        }
      }
      // Save session explicitly to ensure it's persisted
      return new Promise((resolve) => {
        authReq.session!.save(() => {
          const referer = authReq.get("Referer") || "/";
          res.setHeader("Location", referer);
          resolve({
            status: 302,
            body: undefined,
          });
        });
      });
    }
    const referer = authReq.get("Referer") || "/";
    res.setHeader("Location", referer);

    return {
      status: 302,
      body: undefined,
    };
  },

  setRole: async ({ body, req, res }) => {
    const authReq = req as unknown as AuthStubRequest;
    const role = body.role;
    if (role && ["worker", "office-manager", "admin"].includes(role)) {
      const userId = authReq.session!.userId as number | undefined;
      if (userId) {
        const user = userModel.getById(userId);
        // Only set role if user has this role
        if (user && user.roles.includes(role as UserRole)) {
          authReq.session!.userRole = role as UserRole;
        }
      } else {
        authReq.session!.userRole = role as UserRole;
      }
    }
    const referer = authReq.get("Referer") || "/";
    res.setHeader("Location", referer);
    return {
      status: 302,
      body: undefined,
    };
  },

  getNavBar: async ({ query, req }) => {
    const authReq = req as unknown as AuthStubRequest;
    const activeNav = (query?.active_nav as string) || "";
    const html = renderNavBar(authReq, activeNav);
    return {
      status: 200,
      body: html,
    };
  },
});
