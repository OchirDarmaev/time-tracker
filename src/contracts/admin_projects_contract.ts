import { initContract } from "@ts-rest/core";
import { z } from "zod";

const c = initContract();
const htmlResponse = c.otherResponse({
  contentType: "text/html",
  body: c.type<string>(),
});

export const adminProjectsContract = c.router({
  adminProjects: {
    method: "GET",
    path: "/admin/projects",
    responses: {
      200: htmlResponse,
    },
  },
  createProject: {
    method: "POST",
    path: "/admin/projects",
    body: z.object({ name: z.string() }),
    responses: {
      200: htmlResponse,
      400: z.any(),
      500: z.any(),
    },
  },
  toggleProjectSuppress: {
    method: "PATCH",
    path: "/admin/projects/:id/suppress",
    pathParams: z.object({ id: z.string() }),
    body: c.noBody(),
    responses: {
      200: htmlResponse,
    },
  },
});

