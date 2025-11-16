import { initServer } from "@ts-rest/express";
import { rootContract } from "./contract.js";
import { AuthContext } from "../../shared/middleware/auth_stub.js";
import { tsBuildUrl } from "../../shared/utils/paths.js";
import { accountDashboardContract } from "../account/dashboard/contract.js";

const s = initServer();

export const rootRouter = s.router(rootContract, {
  root: async ({ req, res }) => {
    const authReq = req as unknown as AuthContext;
    const currentUser = authReq.currentUser;
    if (currentUser) {
      if (currentUser.roles.includes("account")) {
        res.setHeader("Location", tsBuildUrl(accountDashboardContract.dashboard, {}));
        return {
          status: 302,
          body: undefined,
        };
      }
    }
    res.setHeader("Location", tsBuildUrl(rootContract.root, {}));
    return {
      status: 302,
      body: undefined,
    };
  },
});
