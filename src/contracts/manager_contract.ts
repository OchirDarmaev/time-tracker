import { initContract } from "@ts-rest/core";
import { z } from "zod";

const c = initContract();
const htmlResponse = c.otherResponse({
  contentType: "text/html",
  body: c.type<string>(),
});

export const managerContract = c.router({
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

