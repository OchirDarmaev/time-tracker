import { initContract } from "@ts-rest/core";
import { z } from "zod";
import { htmlResponse } from "../../shared/contracts/html_response.js";

const c = initContract();

export const authContract = c.router({
  auth: {
    method: "GET",
    path: "/auth",
    responses: {
      200: htmlResponse,
    },
  },
  setUser: {
    method: "POST",
    path: "/auth-stub/set-user",
    body: z.object({ user_id: z.coerce.number() }),
    responses: {
      302: z.any(),
    },
  },
  setRole: {
    method: "POST",
    path: "/auth-stub/set-role",
    body: z.object({ role: z.string() }),
    responses: {
      302: c.noBody(),
    },
  },
  getNavBar: {
    method: "GET",
    path: "/auth-stub/nav-bar",
    query: z.any(),
    responses: {
      200: htmlResponse,
    },
  },
});
