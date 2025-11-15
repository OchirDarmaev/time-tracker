import { initContract } from "@ts-rest/core";
import { z } from "zod";
import { htmlResponse } from "../../../shared/contracts/html_response.js";

const c = initContract();

export const adminUsersProjectsContract = c.router({
  adminUsersProjects: {
    method: "GET",
    path: "/admin/users-projects",
    responses: {
      200: htmlResponse,
    },
  },
  adminUsersProjectsProject: {
    method: "GET",
    path: "/admin/users-projects/project",
    query: z.object({ project_id: z.string().optional() }),
    responses: {
      200: htmlResponse,
    },
  },
  assignWorkerToProject: {
    method: "POST",
    path: "/admin/users-projects",
    body: z.object({ project_id: z.string(), user_id: z.coerce.number() }),
    responses: {
      200: htmlResponse,
      400: z.any(),
      500: z.any(),
    },
  },
  removeWorkerFromProject: {
    method: "DELETE",
    path: "/admin/users-projects/:id",
    pathParams: z.object({ id: z.string() }),
    responses: {
      200: htmlResponse,
      404: z.any(),
    },
  },
});
