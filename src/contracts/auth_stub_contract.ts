import { initContract } from "@ts-rest/core";
import { z } from "zod";

const c = initContract();
const htmlResponse = c.otherResponse({
  contentType: "text/html",
  body: c.type<string>(),
});

export const authStubContract = c.router({
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
