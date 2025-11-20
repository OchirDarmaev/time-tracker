import { initServer } from "@ts-rest/express";
import { reportsContract } from "./contract.js";
import { checkAuth } from "@/shared/utils/auth_helpers.js";
import { htmxResponse } from "@/shared/utils/htmx_response.js";
import { getMonthFromDate, formatDate } from "@/shared/utils/date_utils.js";
import { ReportView } from "./views/report_view.js";

const s = initServer();

export const reportsRouter = s.router(reportsContract, {
  view: async (req) => {
    const authCheck = checkAuth(req, "account");
    if (!authCheck.success) {
      return authCheck.response;
    }

    const month = (req.query?.month as string) || getMonthFromDate(formatDate(new Date()));
    const html = ReportView(month, authCheck.authReq);

    return htmxResponse(req, html, authCheck.authReq, "reports");
  },
});
