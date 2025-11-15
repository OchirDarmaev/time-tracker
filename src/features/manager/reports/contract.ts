import { initContract } from "@ts-rest/core";
import { z } from "zod";
import { htmlResponse } from "../../../shared/contracts/html_response.js";

const c = initContract();

export const managerReportsContract = c.router({
  managerReports: {
    method: "GET",
    path: "/manager/reports",
    responses: {
      200: htmlResponse,
    },
  },
  managerReportsWorker: {
    method: "GET",
    path: "/manager/reports/worker",
    query: z.any(),
    responses: {
      200: htmlResponse,
    },
  },
  managerReportsProject: {
    method: "GET",
    path: "/manager/reports/project",
    query: z.any(),
    responses: {
      200: htmlResponse,
    },
  },
});
