import { initContract } from "@ts-rest/core";
import { htmlResponse } from "../../../shared/contracts/html_response.js";

const c = initContract();

export const adminSystemReportsContract = c.router({
  adminSystemReports: {
    method: "GET",
    path: "/admin/system-reports",
    responses: {
      200: htmlResponse,
    },
  },
  adminSystemReportsData: {
    method: "GET",
    path: "/admin/system-reports/data",
    responses: {
      200: htmlResponse,
    },
  },
});
