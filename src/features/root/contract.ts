import { initContract } from "@ts-rest/core";
import { htmlResponse } from "@/shared/contracts/html_response";

const c = initContract();

export const rootContract = c.router({
  root: {
    method: "GET",
    path: "/",
    responses: {
      200: htmlResponse,
    },
  },
});
