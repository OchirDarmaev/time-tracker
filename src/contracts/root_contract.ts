import { initContract } from "@ts-rest/core";
import { z } from "zod";

const c = initContract();

export const rootContract = c.router({
  root: {
    method: "GET",
    path: "/",
    responses: {
      302: z.any(),
    },
  },
});

