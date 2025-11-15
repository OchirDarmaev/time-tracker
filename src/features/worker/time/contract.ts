import { initContract } from "@ts-rest/core";
import { z } from "zod";
import { htmlResponse } from "../../../shared/contracts/html_response.js";

const c = initContract();

export const workerTimeContract = c.router({
  workerTime: {
    method: "GET",
    path: "/worker/time",
    query: z.any(),
    responses: {
      200: htmlResponse,
    },
  },
  workerTimeEntries: {
    method: "GET",
    path: "/worker/time/entries",
    query: z.any(),
    responses: {
      200: htmlResponse,
      400: z.any(),
    },
  },
  createTimeEntry: {
    method: "POST",
    path: "/worker/time/entries",
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
    path: "/worker/time/entries/:id",
    pathParams: z.object({ id: z.string() }),
    responses: {
      200: htmlResponse,
      403: z.any(),
      404: z.any(),
    },
  },
  syncTimeEntries: {
    method: "POST",
    path: "/worker/time/sync",
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
  workerTimeSummary: {
    method: "GET",
    path: "/worker/time/summary",
    query: z.any(),
    responses: {
      200: htmlResponse,
      400: z.any(),
    },
  },
});
