import { initServer } from "@ts-rest/express";
import { featuresContract } from "./contract.js";
import { AuthContext } from "@/shared/middleware/auth_stub.js";
import { isAuthContext } from "@/shared/middleware/isAuthContext.js";
import { Layout } from "@/shared/utils/layout.js";
import { FeaturesListView } from "./views/features_list.js";
import { FeatureView } from "./views/feature_view.js";

const s = initServer();

export const featuresRouter = s.router(featuresContract, {
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

    // Available to all authenticated users
    if (!authReq.currentUser.roles.includes("account")) {
      return {
        status: 403,
        body: { body: "Forbidden" },
      };
    }

    const html = FeaturesListView();

    if (req.headers["hx-request"] === "true") {
      return {
        status: 200,
        body: String(html),
      };
    }

    return {
      status: 200,
      body: String(Layout(html, authReq, "features")),
    };
  },

  view: async ({ params, req }) => {
    const authReq = req as unknown as AuthContext;

    if (!authReq.currentUser) {
      return {
        status: 401,
        body: { body: "Unauthorized" },
      };
    }

    // Available to all authenticated users
    if (!authReq.currentUser.roles.includes("account")) {
      return {
        status: 403,
        body: { body: "Forbidden" },
      };
    }

    const featureName = params.featureName;
    const html = FeatureView(featureName);

    if (!html) {
      return {
        status: 404,
        body: { body: "Feature not found" },
      };
    }

    if (req.headers["hx-request"] === "true") {
      return {
        status: 200,
        body: String(html),
      };
    }

    return {
      status: 200,
      body: String(Layout(html, authReq, "features")),
    };
  },
});
