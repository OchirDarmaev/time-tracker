import { initContract } from "@ts-rest/core";
import { htmlResponse } from "@/shared/contracts/html_response";
import z from "zod";

const c = initContract();

export const rootContract = c.router({
  root: {
    method: "GET",
    path: "/",
    responses: {
      200: htmlResponse,
    },
  },
  toggleTheme: {
    method: "POST",
    path: "/theme/toggle",
    body: c.noBody(),
    responses: {
      204: z.undefined(),
    },
  },
});
