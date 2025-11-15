import { initContract } from '@ts-rest/core';
import { z } from 'zod';

const c = initContract();

export const apiContract = c.router({
  // Auth stub routes
  setUser: {
    method: 'POST',
    path: '/auth-stub/set-user',
    body: z.object({ user_id: z.coerce.number() }),
    responses: {
      302: z.any(),
    },
  },
  setRole: {
    method: 'POST',
    path: '/auth-stub/set-role',
    body: z.object({ role: z.string() }),
    responses: {
      302: z.any(),
    },
  },
  
  // Root redirect
  root: {
    method: 'GET',
    path: '/',
    responses: {
      302: z.any(),
    },
  },
  
  // Worker time routes
  workerTime: {
    method: 'GET',
    path: '/worker/time',
    query: c.type<{ date?: string }>(),
    // headers: c.type<{ 'Content-Type': 'text/html' }>(),
    responses: {
      200: z.any(),
    },
  },
  workerTimeEntries: {
    method: 'GET',
    path: '/worker/time/entries',
    query: c.type<{ date: string }>(),
    responses: {
      200: z.any(),
      400: c.type<{ body: string }>(),
    },
  },
  createTimeEntry: {
    method: 'POST',
    path: '/worker/time/entries',
    body: z.object({ project_id: z.string(), date: z.string(), hours: z.string(), comment: z.string().optional() }),
    responses: {
      200: z.any(),
      400: c.type<{ body: string }>(),
      403: c.type<{ body: string }>(),
    },
  },
  deleteTimeEntry: {
    method: 'DELETE',
    path: '/worker/time/entries/:id',
    pathParams: z.object({ id: z.string() }),
    responses: {
      200: z.any(),
      403: c.type<{ body: string }>(),
      404: c.type<{ body: string }>(),
    },
  },
  workerTimeSummary: {
    method: 'GET',
    path: '/worker/time/summary',
    query: c.type<{ date: string }>(),
    responses: {
      200: z.any(),
      400: c.type<{ body: string }>(),
    },
  },
  
  // Manager reports routes
  managerReports: {
    method: 'GET',
    path: '/manager/reports',
    responses: {
      200: z.any(),
    },
  },
  managerReportsWorker: {
    method: 'GET',
    path: '/manager/reports/worker',
    query: c.type<{ worker_id?: string }>(),
    responses: {
      200: z.any(),
    },
  },
  managerReportsProject: {
    method: 'GET',
    path: '/manager/reports/project',
    query: c.type<{ project_id?: string }>(),
    responses: {
      200: z.any(),
    },
  },
  
  // Admin projects routes
  adminProjects: {
    method: 'GET',
    path: '/admin/projects',
    responses: {
      200: z.any(),
    },
  },
  createProject: {
    method: 'POST',
    path: '/admin/projects',
    body: z.object({ name: z.string() }),
    responses: {
      200: z.any(),
      400: c.type<{ body: string }>(),
      500: c.type<{ body: string }>(),
    },
  },
  toggleProjectSuppress: {
    method: 'PATCH',
    path: '/admin/projects/:id/suppress',
    pathParams: z.object({ id: z.string() }),
    body: c.noBody(),
    responses: {
      200: z.any(),
    },
  },
  
  // Admin users-projects routes
  adminUsersProjects: {
    method: 'GET',
    path: '/admin/users-projects',
    responses: {
      200: z.any(),
    },
  },
  adminUsersProjectsProject: {
    method: 'GET',
    path: '/admin/users-projects/project',
    query: c.type<{ project_id?: string }>(),
    responses: {
      200: z.any(),
    },
  },
  assignWorkerToProject: {
    method: 'POST',
    path: '/admin/users-projects',
    body: z.object({ project_id: z.string(), user_id: z.coerce.number() }),
    responses: {
      200: z.any(),
      400: c.type<{ body: string }>(),
      500: c.type<{ body: string }>(),
    },
  },
  removeWorkerFromProject: {
    method: 'DELETE',
    path: '/admin/users-projects/:id',
    pathParams: z.object({ id: z.string() }),
    responses: {
      200: z.any(),
      404: c.type<{ body: string }>(),
    },
  },
  
  // Admin system reports routes
  adminSystemReports: {
    method: 'GET',
    path: '/admin/system-reports',
    responses: {
      200: z.any(),
    },
  },
  adminSystemReportsData: {
    method: 'GET',
    path: '/admin/system-reports/data',
    responses: {
      200: z.any(),
    },
  },
});

