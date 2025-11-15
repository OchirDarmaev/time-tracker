import { initContract } from "@ts-rest/core";
import { z } from "zod";

const c = initContract();
const htmlResponse = c.otherResponse({
  contentType: "text/html",
  body: c.type<string>(),
});

export const apiContract = c.router({
  // Auth stub routes
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

  // Root redirect
  root: {
    method: "GET",
    path: "/",
    responses: {
      302: z.any(),
    },
  },

  // Worker time routes
  workerTime: {
    method: "GET",
    path: "/worker/time",
    query: z.any(),
    responses: {
      200: htmlResponse,
    },
  },
  workerTimeEntries: {
    method: "GET",
    path: "/worker/time/entries",
    query: z.any(),
    responses: {
      200: htmlResponse,
      400: z.any(),
    },
  },
  createTimeEntry: {
    method: "POST",
    path: "/worker/time/entries",
    body: z.object({
      project_id: z.string(),
      date: z.string(),
      hours: z.string(),
      comment: z.string().optional(),
    }),
    responses: {
      200: htmlResponse,
      400: z.any(),
      403: z.any(),
    },
  },
  deleteTimeEntry: {
    method: "DELETE",
    path: "/worker/time/entries/:id",
    pathParams: z.object({ id: z.string() }),
    responses: {
      200: htmlResponse,
      403: z.any(),
      404: z.any(),
    },
  },
  workerTimeSummary: {
    method: "GET",
    path: "/worker/time/summary",
    query: z.any(),
    responses: {
      200: htmlResponse,
      400: z.any(),
    },
  },

  // Manager reports routes
  managerReports: {
    method: "GET",
    path: "/manager/reports",
    responses: {
      200: htmlResponse,
    },
  },
  managerReportsWorker: {
    method: "GET",
    path: "/manager/reports/worker",
    query: z.any(),
    responses: {
      200: htmlResponse,
    },
  },
  managerReportsProject: {
    method: "GET",
    path: "/manager/reports/project",
    query: z.any(),
    responses: {
      200: htmlResponse,
    },
  },

  // Admin projects routes
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

  // Admin users-projects routes
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

  // Admin system reports routes
  adminSystemReports: {
    method: "GET",
    path: "/admin/system-reports",
    responses: {
      200: htmlResponse,
    },
  },
  adminSystemReportsData: {
    method: "GET",
    path: "/admin/system-reports/data",
    responses: {
      200: htmlResponse,
    },
  },
});
