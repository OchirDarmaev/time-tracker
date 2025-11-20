import { initContract } from "@ts-rest/core";
import { z } from "zod";
import { htmlResponse } from "@/shared/contracts/html_response.js";

const c = initContract();

export const reportsContract = c.router({
  view: {
    method: "GET",
    path: "/reports",
    headers: z.object({
      "hx-request": z.literal("true").optional(),
    }),
    query: z.object({
      month: z.string().optional(),
    }),
    responses: {
      200: htmlResponse,
    },
  },
});
