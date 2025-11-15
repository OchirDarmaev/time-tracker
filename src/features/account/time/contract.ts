import { initContract } from "@ts-rest/core";
import { z } from "zod";
import { htmlResponse } from "../../../shared/contracts/html_response.js";

const c = initContract();

export const accountTimeContract = c.router({
  accountTime: {
    method: "GET",
    path: "/account/time",
    query: z.any(),
    responses: {
      200: htmlResponse,
    },
  },
  accountTimeEntries: {
    method: "GET",
    path: "/account/time/entries",
    query: z.any(),
    responses: {
      200: htmlResponse,
      400: z.any(),
    },
  },
  createTimeEntry: {
    method: "POST",
    path: "/account/time/entries",
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
  deleteTimeEntry: {
    method: "DELETE",
    path: "/account/time/entries/:id",
    pathParams: z.object({ id: z.string() }),
    responses: {
      200: htmlResponse,
      403: z.any(),
      404: z.any(),
    },
  },
  syncTimeEntries: {
    method: "POST",
    path: "/account/time/sync",
    body: z.object({
      date: z.string(),
      segments: z.array(
        z.object({
          project_id: z.number(),
          minutes: z.number(),
          comment: z.string().nullable().optional(),
        })
      ),
    }),
    responses: {
      200: z.object({ success: z.boolean() }),
      400: z.any(),
      403: z.any(),
    },
  },
  accountTimeSummary: {
    method: "GET",
    path: "/account/time/summary",
    query: z.any(),
    responses: {
      200: htmlResponse,
      400: z.any(),
    },
  },
});
