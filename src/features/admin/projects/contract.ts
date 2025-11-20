import { initContract } from "@ts-rest/core";
import { z } from "zod";
import { htmlResponse } from "@/shared/contracts/html_response.js";

const c = initContract();

export const adminProjectsContract = c.router({
  list: {
    method: "GET",
    path: "/admin/projects",
    headers: z.object({
      "hx-request": z.literal("true").optional(),
    }),
    responses: {
      200: htmlResponse,
      403: z.any(),
    },
  },
  createPage: {
    method: "GET",
    path: "/admin/projects/new",
    headers: z.object({
      "hx-request": z.literal("true").optional(),
    }),
    responses: {
      200: htmlResponse,
      403: z.any(),
    },
  },
  create: {
    method: "POST",
    path: "/admin/projects",
    body: z.object({
      name: z.string().min(1),
      color: z
        .string()
        .regex(/^#[0-9A-Fa-f]{6}$/)
        .optional(),
    }),
    responses: {
      200: htmlResponse,
      400: z.any(),
      403: z.any(),
    },
  },
  updateName: {
    method: "PATCH",
    path: "/admin/projects/:id/name",
    pathParams: z.object({ id: z.coerce.number() }),
    body: z.object({
      name: z.string().min(1),
    }),
    responses: {
      200: htmlResponse,
      400: z.any(),
      403: z.any(),
      404: z.any(),
    },
  },
  updateColor: {
    method: "PATCH",
    path: "/admin/projects/:id/color",
    pathParams: z.object({ id: z.coerce.number() }),
    body: z.object({
      color: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
    }),
    responses: {
      200: htmlResponse,
      400: z.any(),
      403: z.any(),
      404: z.any(),
    },
  },
  toggleSuppress: {
    method: "PATCH",
    path: "/admin/projects/:id/suppress",
    pathParams: z.object({ id: z.coerce.number() }),
    body: z.object({}),
    responses: {
      200: htmlResponse,
      400: z.any(),
      403: z.any(),
      404: z.any(),
    },
  },
  edit: {
    method: "GET",
    path: "/admin/projects/:id/edit",
    pathParams: z.object({ id: z.coerce.number() }),
    headers: z.object({
      "hx-request": z.literal("true").optional(),
    }),
    responses: {
      200: htmlResponse,
      403: z.any(),
      404: z.any(),
    },
  },
  update: {
    method: "PATCH",
    path: "/admin/projects/:id",
    pathParams: z.object({ id: z.coerce.number() }),
    body: z.object({
      name: z.string().min(1),
      color: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
      suppressed: z.coerce.boolean().optional(),
    }),
    responses: {
      200: htmlResponse,
      400: z.any(),
      403: z.any(),
      404: z.any(),
    },
  },
  manageUsers: {
    method: "GET",
    path: "/admin/projects/users",
    headers: z.object({
      "hx-request": z.literal("true").optional(),
    }),
    responses: {
      200: htmlResponse,
      403: z.any(),
    },
  },
  assignUserToProject: {
    method: "POST",
    path: "/admin/projects/users/assign",
    body: z.object({
      user_id: z.coerce.number(),
      project_id: z.coerce.number(),
    }),
    responses: {
      200: htmlResponse,
      400: z.any(),
      403: z.any(),
    },
  },
  removeUserFromProject: {
    method: "PATCH",
    path: "/admin/projects/users/remove",
    body: z.object({
      user_id: z.coerce.number(),
      project_id: z.coerce.number(),
    }),
    responses: {
      200: htmlResponse,
      400: z.any(),
      403: z.any(),
    },
  },
});
