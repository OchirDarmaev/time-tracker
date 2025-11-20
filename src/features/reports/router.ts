import { initServer } from "@ts-rest/express";
import { reportsContract } from "./contract.js";
import { AuthContext } from "@/shared/middleware/auth_stub.js";
import { isAuthContext } from "@/shared/middleware/isAuthContext.js";
import { Layout } from "@/shared/utils/layout.js";
import { getMonthFromDate, formatDate } from "@/shared/utils/date_utils.js";
import { ReportView } from "./views/report_view.js";

const s = initServer();

export const reportsRouter = s.router(reportsContract, {
  view: async (req) => {
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

    const month = (req.query?.month as string) || getMonthFromDate(formatDate(new Date()));
    const html = ReportView(month, authReq);

    if (req.headers["hx-request"] === "true") {
      return {
        status: 200,
        body: String(html),
      };
    }

    return {
      status: 200,
      body: String(Layout(html, authReq, "reports")),
    };
  },
});
