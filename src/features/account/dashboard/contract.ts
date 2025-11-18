import { initContract } from "@ts-rest/core";
import { z } from "zod";
import { htmlResponse } from "@/shared/contracts/html_response.js";

const c = initContract();

export const accountDashboardContract = c.router({
  dashboard: {
    method: "GET",
    path: "/account/dashboard",
    headers: z.object({
      "hx-request": z.literal("true").optional(),
    }),
    query: z.object({
      date: z.string().date().optional(),
    }),
    responses: {
      200: htmlResponse,
    },
  },
  accountDashboardEntries: {
    method: "GET",
    path: "/account/dashboard/entries",
    query: z.any(),
    responses: {
      200: htmlResponse,
      400: z.any(),
    },
  },
  createDashboardEntry: {
    method: "POST",
    path: "/account/dashboard/entries",
    body: z.object({
      project_id: z.string(),
      date: z.string(),
      hours: z.string(),
      comment: z.string().optional(),
    }),
    responses: {
      200: htmlResponse,
      400: z.any(),
      403: z.any(),
    },
  },
  deleteDashboardEntry: {
    method: "DELETE",
    path: "/account/dashboard/entries/:entryId",
    pathParams: z.object({ entryId: z.coerce.number() }),
    responses: {
      200: htmlResponse,
      403: z.any(),
      404: z.any(),
    },
  },
  addDashboardSegment: {
    method: "POST",
    path: "/account/dashboard/segments",
    body: z.object({
      date: z.string().date(),
      project_id: z.coerce.number(),
      minutes: z.coerce.number().min(0),
      comment: z.string().optional(),
    }),
    responses: {
      200: htmlResponse,
      400: z.any(),
      403: z.any(),
    },
  },
  updateDashboardSegment: {
    method: "PATCH",
    path: "/account/dashboard/segments/:entryId",
    pathParams: z.object({ entryId: z.coerce.number() }),
    body: z.object({
      minutes: z.coerce.number().min(0).optional(),
      comment: z.string().optional(),
    }),
    responses: {
      200: htmlResponse,
      400: z.any(),
      403: z.any(),
      404: z.any(),
    },
  },
  deleteDashboardSegment: {
    method: "DELETE",
    path: "/account/dashboard/segments/:entryId",
    pathParams: z.object({ entryId: z.coerce.number() }),
    responses: {
      200: htmlResponse,
      403: z.any(),
      404: z.any(),
    },
  },
});
