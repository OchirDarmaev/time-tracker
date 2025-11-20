import { initContract } from "@ts-rest/core";
import { z } from "zod";
import { htmlResponse } from "@/shared/contracts/html_response.js";

const c = initContract();

export const featuresContract = c.router({
  list: {
    method: "GET",
    path: "/features",
    headers: z.object({
      "hx-request": z.literal("true").optional(),
    }),
    responses: {
      200: htmlResponse,
    },
  },
  view: {
    method: "GET",
    path: "/features/:featureName",
    headers: z.object({
      "hx-request": z.literal("true").optional(),
    }),
    pathParams: z.object({
      featureName: z.string(),
    }),
    responses: {
      200: htmlResponse,
      404: z.any(),
    },
  },
});
