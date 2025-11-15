import { initContract } from "@ts-rest/core";
import { z } from "zod";

const c = initContract();
const htmlResponse = c.otherResponse({
  contentType: "text/html",
  body: c.type<string>(),
});

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

