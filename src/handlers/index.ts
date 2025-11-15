import { initServer } from '@ts-rest/express';
import { apiContract } from '../contracts/api.js';
import { AuthStubRequest } from '../middleware/auth_stub.js';
import { userModel } from '../models/user.js';

import { handleWorkerTimeRoutes } from './worker_time.js';
import { handleManagerReportsRoutes } from './manager_reports.js';
import { handleAdminProjectsRoutes } from './admin_projects.js';
import { handleAdminUsersProjectsRoutes } from './admin_users_projects.js';
import { handleAdminSystemReportsRoutes } from './admin_system_reports.js';

const s = initServer();

export const router = s.router(apiContract, {
  setUser: async ({ body, req, res }) => {
    const authReq = req as unknown as AuthStubRequest;
    const userId = body.user_id;
    if (userId) {
      authReq.session!.userId = userId;
      const user = userModel.getById(userId);
      if (user) {
        authReq.session!.userRole = user.role;
      }
    }
    const referer = authReq.get('Referer') || '/';
    res.redirect(referer);
    
    return {
      status: 302,
      body: undefined,
    };
  },
  
  setRole: async ({ body, req, res }) => {
    const authReq = req as unknown as AuthStubRequest;
    const role = body.role;
    if (role && ['worker', 'office-manager', 'admin'].includes(role)) {
      authReq.session!.userRole = role;
      const userId = authReq.session!.userId as number | undefined;
      if (userId) {
        const user = userModel.getById(userId);
        if (user && user.role !== role) {
          const users = userModel.getAll();
          const userWithRole = users.find(u => u.role === role);
          if (userWithRole) {
            authReq.session!.userId = userWithRole.id;
          }
        }
      }
    }
    const referer = authReq.get('Referer') || '/';
    res.redirect(referer);
      return {
      status: 302,
      body: undefined,
    };
  },
  
  // Root redirect
  root: async ({ req, res }) => {
    const authReq = req as unknown as AuthStubRequest;
    const currentUser = authReq.currentUser;
    if (currentUser) {
      if (currentUser.role === 'worker') {
        res.redirect('/worker/time');
        return {
          status: 302,
          body: undefined,
        };
      } else if (currentUser.role === 'office-manager' || currentUser.role === 'admin') {
        res.redirect('/manager/reports');
        return {
          status: 302,
          body: undefined,
        };
      }
    }
    res.redirect('/');
    return {
      status: 302,
      body: undefined,
    };
  },
  
  // Worker time routes
  workerTime: async ({ query, req }) => {
    return handleWorkerTimeRoutes('index', { query, req: req as unknown as AuthStubRequest });
  },
  
  workerTimeEntries: async ({ query, req }) => {
    return handleWorkerTimeRoutes('entries', { query, req: req as unknown as AuthStubRequest });
  },
  
  createTimeEntry: async ({ body, req }) => {
    return handleWorkerTimeRoutes('createEntry', { body, req: req as unknown as AuthStubRequest });
  },
  
  deleteTimeEntry: async ({ params, req }) => {
    return handleWorkerTimeRoutes('deleteEntry', { params, req: req as unknown as AuthStubRequest });
  },
  
  workerTimeSummary: async ({ query, req }) => {
    return handleWorkerTimeRoutes('summary', { query, req: req as unknown as AuthStubRequest });
  },
  
  // Manager reports routes
  managerReports: async ({ req }) => {
    return handleManagerReportsRoutes('index', { req: req as unknown as AuthStubRequest });
  },
  
  managerReportsWorker: async ({ query, req }) => {
    return handleManagerReportsRoutes('worker', { query, req: req as unknown as AuthStubRequest });
  },
  
  managerReportsProject: async ({ query, req }) => {
    return handleManagerReportsRoutes('project', { query, req: req as unknown as AuthStubRequest });
  },
  
  // Admin projects routes
  adminProjects: async ({ req }) => {
    return handleAdminProjectsRoutes('index', { req: req as unknown as AuthStubRequest });
  },
  
  createProject: async ({ body, req }) => {
    return handleAdminProjectsRoutes('create', { body, req: req as unknown as AuthStubRequest });
  },
  
  toggleProjectSuppress: async ({ params, req }) => {
    return handleAdminProjectsRoutes('toggleSuppress', { params, req: req as unknown as AuthStubRequest });
  },
  
  // Admin users-projects routes
  adminUsersProjects: async ({ req }) => {
    return handleAdminUsersProjectsRoutes('index', { req: req as unknown as AuthStubRequest });
  },
  
  adminUsersProjectsProject: async ({ query, req }) => {
    return handleAdminUsersProjectsRoutes('project', { query, req: req as unknown as AuthStubRequest });
  },
  
  assignWorkerToProject: async ({ body, req }) => {
    return handleAdminUsersProjectsRoutes('assign', { body, req: req as unknown as AuthStubRequest });
  },
  
  removeWorkerFromProject: async ({ params, req }) => {
    return handleAdminUsersProjectsRoutes('remove', { params, req: req as unknown as AuthStubRequest });
  },
  
  // Admin system reports routes
  adminSystemReports: async ({ req }) => {
    return handleAdminSystemReportsRoutes('index', { req: req as unknown as AuthStubRequest });
  },
  
  adminSystemReportsData: async ({ req }) => {
    return handleAdminSystemReportsRoutes('data', { req: req as unknown as AuthStubRequest });
  },
});

