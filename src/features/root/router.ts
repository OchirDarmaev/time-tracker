import { initServer } from "@ts-rest/express";
import { rootContract } from "./contract.js";
import { AuthStubRequest } from "../../shared/middleware/auth_stub.js";
import { tsSubPath } from "../../shared/utils/paths.js";
import { accountTimeContract } from "../account/time/contract.js";

const s = initServer();

export const rootRouter = s.router(rootContract, {
  root: async ({ req, res }) => {
    const authReq = req as unknown as AuthStubRequest;
    const currentUser = authReq.currentUser;
    if (currentUser) {
      if (currentUser.roles.includes("account")) {
        res.setHeader(
          "Location",
          tsSubPath<typeof accountTimeContract>(accountTimeContract.dashboard.path)
        );
        return {
          status: 302,
          body: undefined,
        };
      }
    }
    res.setHeader("Location", tsSubPath<typeof rootContract>(rootContract.root.path));
    return {
      status: 302,
      body: undefined,
    };
  },
});
