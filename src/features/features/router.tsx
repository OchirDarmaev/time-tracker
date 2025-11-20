import { initServer } from "@ts-rest/express";
import { featuresContract } from "./contract.js";
import { AuthContext } from "@/shared/middleware/auth_stub.js";
import { checkAuth, checkAuthFromContext } from "@/shared/utils/auth_helpers.js";
import { htmxResponse } from "@/shared/utils/htmx_response.js";
import { FeaturesListView } from "./views/features_list.js";
import { FeatureView } from "./views/feature_view.js";

const s = initServer();

export const featuresRouter = s.router(featuresContract, {
  list: async (req) => {
    const authCheck = checkAuth(req, "account");
    if (!authCheck.success) {
      return authCheck.response;
    }

    const html = FeaturesListView();

    return htmxResponse(req, html, authCheck.authReq, "features");
  },

  view: async ({ params, req }) => {
    const authReq = req as unknown as AuthContext;

    const authError = checkAuthFromContext(authReq, "account");
    if (authError) {
      return authError;
    }

    const featureName = params.featureName;
    const html = FeatureView(featureName);

    if (!html) {
      return {
        status: 404,
        body: { body: "Feature not found" },
      };
    }

    return htmxResponse(req, html, authReq, "features");
  },
});
