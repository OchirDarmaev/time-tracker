import { initContract } from "@ts-rest/core";
import { z } from "zod";
import { htmlResponse } from "@/shared/contracts/html_response.js";

const c = initContract();

export const adminCalendarContract = c.router({
  view: {
    method: "GET",
    path: "/admin/calendar",
    query: z.object({
      month: z.string().optional(),
    }),
    headers: z.object({
      "hx-request": z.literal("true").optional(),
    }),
    responses: {
      200: htmlResponse,
      403: z.any(),
    },
  },
  setDayType: {
    method: "POST",
    path: "/admin/calendar/day-type",
    body: z.object({
      date: z.string(),
      day_type: z.enum(["workday", "public_holiday", "weekend"]),
    }),
    responses: {
      200: htmlResponse,
      400: z.any(),
      403: z.any(),
    },
  },
});
