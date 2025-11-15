import { initServer } from "@ts-rest/express";
import { apiContract } from "./contracts/api.js";
import { AuthStubRequest } from "./middleware/auth_stub.js";
import { userModel, UserRole } from "./models/user.js";
import { timeEntryModel } from "./models/time_entry.js";
import { projectModel } from "./models/project.js";
import { ProjectUser, projectUserModel } from "./models/project_user.js";
import {
  formatDate,
  getMonthFromDate,
  minutesToHours,
  getWorkingDaysInMonth,
  parseDate,
} from "./utils/date_utils.js";
import { validateDate, validateMinutes, validateProjectName } from "./utils/validation.js";
import { renderNavBar } from "./utils/layout.js";
import { dirname } from "path";
import { fileURLToPath } from "url";
import { renderWorkerReport } from "./renderWorkerReport.js";
import { renderProjectReport } from "./renderProjectReport.js";
import { renderProjectsPage } from "./renderProjectsPage.js";
import { renderUsersProjectsPage } from "./renderUsersProjectsPage.js";
import { renderProjectWorkers } from "./renderProjectWorkers.js";
import { renderSystemReportsPage } from "./renderSystemReportsPage.js";
import { renderSystemReports } from "./renderSystemReports.js";
import { renderReportsPage } from "./renderReportsPage.js";
import { renderSummary } from "./renderSummary.js";
import { renderEntriesTable } from "./renderEntriesTable.js";
import { renderTimeTrackingPage } from "./renderTimeTrackingPage.js";
import { renderProjectList } from "./views/components/project_list_component.js";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const s = initServer();

export const router = s.router(apiContract, {
  setUser: async ({ body, req, res }) => {
    const authReq = req as unknown as AuthStubRequest;
    const userId = body.user_id;
    if (userId) {
      authReq.session!.userId = userId;
      const user = userModel.getById(userId);
      if (user && user.roles.length > 0) {
        // Set to the first role, or keep current role if user has it
        const currentRole = authReq.session!.userRole as UserRole | undefined;
        if (currentRole && user.roles.includes(currentRole)) {
          authReq.session!.userRole = currentRole;
        } else {
          authReq.session!.userRole = user.roles[0];
        }
      }
      // Save session explicitly to ensure it's persisted
      return new Promise((resolve) => {
        authReq.session!.save(() => {
          const referer = authReq.get("Referer") || "/";
          res.setHeader("Location", referer);
          resolve({
            status: 302,
            body: undefined,
          });
        });
      });
    }
    const referer = authReq.get("Referer") || "/";
    res.setHeader("Location", referer);

    return {
      status: 302,
      body: undefined,
    };
  },

  setRole: async ({ body, req, res }) => {
    const authReq = req as unknown as AuthStubRequest;
    const role = body.role;
    if (role && ["worker", "office-manager", "admin"].includes(role)) {
      const userId = authReq.session!.userId as number | undefined;
      if (userId) {
        const user = userModel.getById(userId);
        // Only set role if user has this role
        if (user && user.roles.includes(role as UserRole)) {
          authReq.session!.userRole = role as UserRole;
        }
      } else {
        authReq.session!.userRole = role as UserRole;
      }
    }
    const referer = authReq.get("Referer") || "/";
    res.setHeader("Location", referer);
    return {
      status: 302,
      body: undefined,
    };
  },

  getNavBar: async ({ query, req }) => {
    const authReq = req as unknown as AuthStubRequest;
    const activeNav = (query?.active_nav as string) || "";
    const html = renderNavBar(authReq, activeNav);
    return {
      status: 200,
      body: html,
    };
  },

  // Root redirect
  root: async ({ req, res }) => {
    const authReq = req as unknown as AuthStubRequest;
    const currentUser = authReq.currentUser;
    if (currentUser) {
      if (currentUser.roles.includes("admin")) {
        res.setHeader("Location", "/admin/projects");
        return {
          status: 302,
          body: undefined,
        };
      } else if (currentUser.roles.includes("office-manager")) {
        res.setHeader("Location", "/manager/reports");
        return {
          status: 302,
          body: undefined,
        };
      } else if (currentUser.roles.includes("worker")) {
        res.setHeader("Location", "/worker/time");
        return {
          status: 302,
          body: undefined,
        };
      }
    }
    res.setHeader("Location", "/");
    return {
      status: 302,
      body: undefined,
    };
  },

  // Worker time routes
  workerTime: async ({ req }) => {
    const authReq = req as unknown as AuthStubRequest;

    if (!authReq.currentUser) {
      return {
        status: 401,
        body: { body: "Unauthorized" },
      };
    }
    if (!authReq.currentUser.roles.includes("worker")) {
      return {
        status: 403,
        body: { body: "Forbidden" },
      };
    }

    // Check if this is an HTMX request - if so, return only the content
    const isHtmxRequest = authReq.headers["hx-request"] === "true";

    if (isHtmxRequest) {
      // Return only the content for HTMX requests
      const content = renderTimeTrackingPage(authReq, false);
      return {
        status: 200,
        body: content,
      };
    } else {
      // Return full page for regular requests
      const html = renderTimeTrackingPage(authReq, true);
      return {
        status: 200,
        body: html,
      };
    }
  },

  workerTimeEntries: async ({ query, req }) => {
    const authReq = req as unknown as AuthStubRequest;

    if (!authReq.currentUser) {
      return {
        status: 401,
        body: { body: "Unauthorized" },
      };
    }
    if (!authReq.currentUser.roles.includes("worker")) {
      return {
        status: 403,
        body: { body: "Forbidden" },
      };
    }

    const currentUser = authReq.currentUser;
    const date = (query?.date as string) || formatDate(new Date());

    if (!validateDate(date)) {
      return {
        status: 400,
        body: { body: "Invalid date" },
      };
    }

    const projects = projectModel.getByUserId(currentUser.id);
    const entries = timeEntryModel.getByUserIdAndDate(currentUser.id, date);
    const html = renderEntriesTable(entries, projects);
    return {
      status: 200,
      body: html,
    };
  },

  createTimeEntry: async ({ body, req }) => {
    const authReq = req as unknown as AuthStubRequest;

    if (!authReq.currentUser) {
      return {
        status: 401,
        body: { body: "Unauthorized" },
      };
    }
    if (!authReq.currentUser.roles.includes("worker")) {
      return {
        status: 403,
        body: { body: "Forbidden" },
      };
    }

    const currentUser = authReq.currentUser;
    const { project_id, date, hours, comment } = body;

    if (!validateDate(date)) {
      return {
        status: 400,
        body: { body: "Invalid date" },
      };
    }

    const minutes = Math.round(parseFloat(hours) * 60);
    if (!validateMinutes(minutes)) {
      return {
        status: 400,
        body: { body: "Invalid hours" },
      };
    }

    const project = projectModel.getById(parseInt(project_id));
    if (!project) {
      return {
        status: 400,
        body: { body: "Invalid project" },
      };
    }

    const userProjects = projectModel.getByUserId(currentUser.id);
    if (!userProjects.find((p) => p.id === project.id)) {
      return {
        status: 403,
        body: { body: "Access denied to this project" },
      };
    }

    timeEntryModel.create(currentUser.id, project.id, date, minutes, comment || null);

    const projects = projectModel.getByUserId(currentUser.id);
    const entries = timeEntryModel.getByUserIdAndDate(currentUser.id, date);
    const html = renderEntriesTable(entries, projects);
    return {
      status: 200,
      body: html,
    };
  },

  deleteTimeEntry: async ({ params, req }) => {
    const authReq = req as unknown as AuthStubRequest;

    if (!authReq.currentUser) {
      return {
        status: 401,
        body: { body: "Unauthorized" },
      };
    }
    if (!authReq.currentUser.roles.includes("worker")) {
      return {
        status: 403,
        body: { body: "Forbidden" },
      };
    }

    const currentUser = authReq.currentUser;
    const entryId = parseInt(params.id);

    const entry = timeEntryModel.getById(entryId);
    if (!entry) {
      return {
        status: 404,
        body: { body: "Entry not found" },
      };
    }

    if (entry.user_id !== currentUser.id) {
      return {
        status: 403,
        body: { body: "Access denied" },
      };
    }

    timeEntryModel.delete(entryId);

    const date = entry.date;
    const projects = projectModel.getByUserId(currentUser.id);
    const entries = timeEntryModel.getByUserIdAndDate(currentUser.id, date);
    const html = renderEntriesTable(entries, projects);
    return {
      status: 200,
      body: html,
    };
  },

  syncTimeEntries: async ({ body, req }) => {
    const authReq = req as unknown as AuthStubRequest;

    if (!authReq.currentUser) {
      return {
        status: 401,
        body: { success: false },
      };
    }
    if (!authReq.currentUser.roles.includes("worker")) {
      return {
        status: 403,
        body: { success: false },
      };
    }

    const currentUser = authReq.currentUser;
    const { date, segments } = body;

    if (!validateDate(date)) {
      return {
        status: 400,
        body: { success: false },
      };
    }

    // Verify user has access to all projects
    const userProjects = projectModel.getByUserId(currentUser.id);
    const projectIds = new Set(userProjects.map((p) => p.id));

    for (const segment of segments) {
      if (!projectIds.has(segment.project_id)) {
        return {
          status: 403,
          body: { success: false },
        };
      }
      if (!validateMinutes(segment.minutes)) {
        return {
          status: 400,
          body: { success: false },
        };
      }
    }

    // Delete all existing entries for this date and user
    const existingEntries = timeEntryModel.getByUserIdAndDate(currentUser.id, date);
    for (const entry of existingEntries) {
      timeEntryModel.delete(entry.id);
    }

    // Create new entries from segments
    for (const segment of segments) {
      timeEntryModel.create(
        currentUser.id,
        segment.project_id,
        date,
        segment.minutes,
        segment.comment || null
      );
    }

    return {
      status: 200,
      body: { success: true },
    };
  },

  workerTimeSummary: async ({ query, req }) => {
    const authReq = req as unknown as AuthStubRequest;

    if (!authReq.currentUser) {
      return {
        status: 401,
        body: { body: "Unauthorized" },
      };
    }
    if (!authReq.currentUser.roles.includes("worker")) {
      return {
        status: 403,
        body: { body: "Forbidden" },
      };
    }

    const currentUser = authReq.currentUser;
    const date = (query?.date as string) || formatDate(new Date());

    if (!validateDate(date)) {
      return {
        status: 400,
        body: { body: "Invalid date" },
      };
    }

    const totalMinutes = timeEntryModel.getTotalMinutesByUserAndDate(currentUser.id, date);
    const totalHours = minutesToHours(totalMinutes);

    const month = getMonthFromDate(date);
    const monthlyTotalMinutes = timeEntryModel.getTotalMinutesByUserAndMonth(currentUser.id, month);
    const monthlyTotalHours = minutesToHours(monthlyTotalMinutes);

    const dateObj = parseDate(date);
    const workingDays = getWorkingDaysInMonth(dateObj.getFullYear(), dateObj.getMonth() + 1);
    const requiredMonthlyHours = workingDays * 8;

    const monthlyWarning = monthlyTotalHours < requiredMonthlyHours;

    const html = renderSummary(totalHours, monthlyTotalHours, requiredMonthlyHours, monthlyWarning);
    return {
      status: 200,
      body: html,
    };
  },

  // Manager reports routes
  managerReports: async ({ req }) => {
    const authReq = req as unknown as AuthStubRequest;

    if (!authReq.currentUser) {
      return {
        status: 401,
        body: undefined,
      };
    }
    if (
      !authReq.currentUser.roles.includes("office-manager") &&
      !authReq.currentUser.roles.includes("admin")
    ) {
      return {
        status: 403,
        body: { body: "Forbidden" },
      };
    }

    const html = renderReportsPage(authReq);
    return {
      status: 200,
      body: html,
    };
  },

  managerReportsWorker: async ({ query, req }) => {
    const authReq = req as unknown as AuthStubRequest;

    if (!authReq.currentUser) {
      return {
        status: 401,
        body: undefined,
      };
    }
    if (
      !authReq.currentUser.roles.includes("office-manager") &&
      !authReq.currentUser.roles.includes("admin")
    ) {
      return {
        status: 403,
        body: { body: "Forbidden" },
      };
    }

    const userId = parseInt(query?.worker_id as string);
    if (!userId) {
      return {
        status: 200,
        body: '<p class="text-gray-500">Select a worker to view reports.</p>',
      };
    }
    const html = renderWorkerReport(userId);
    return {
      status: 200,
      body: html,
    };
  },

  managerReportsProject: async ({ query, req }) => {
    const authReq = req as unknown as AuthStubRequest;

    if (!authReq.currentUser) {
      return {
        status: 401,
        body: undefined,
      };
    }
    if (
      !authReq.currentUser.roles.includes("office-manager") &&
      !authReq.currentUser.roles.includes("admin")
    ) {
      return {
        status: 403,
        body: { body: "Forbidden" },
      };
    }

    const projectId = parseInt(query?.project_id as string);
    if (!projectId) {
      return {
        status: 200,
        body: '<p class="text-gray-500">Select a project to view reports.</p>',
      };
    }
    const html = renderProjectReport(projectId);
    return {
      status: 200,
      body: html,
    };
  },

  // Admin projects routes
  adminProjects: async ({ req }) => {
    const authReq = req as unknown as AuthStubRequest;

    if (!authReq.currentUser) {
      return {
        status: 401,
        body: undefined,
      };
    }
    if (!authReq.currentUser.roles.includes("admin")) {
      return {
        status: 403,
        body: { body: "Forbidden" },
      };
    }

    const html = renderProjectsPage(authReq);
    return {
      status: 200,
      body: html,
    };
  },

  createProject: async ({ body, req }) => {
    const authReq = req as unknown as AuthStubRequest;

    if (!authReq.currentUser) {
      return {
        status: 401,
        body: undefined,
      };
    }
    if (!authReq.currentUser.roles.includes("admin")) {
      return {
        status: 403,
        body: { body: "Forbidden" },
      };
    }

    const { name } = body;

    if (!validateProjectName(name)) {
      return {
        status: 400,
        body: { body: "Invalid project name" },
      };
    }

    try {
      projectModel.create(name.trim());
      const projects = projectModel.getAll(true);
      const html = renderProjectList({
        projects: projects.map((p) => ({
          id: p.id,
          name: p.name,
          suppressed: p.suppressed || false,
        })),
      });
      return {
        status: 200,
        body: html,
      };
    } catch (error) {
      if (error instanceof Error && error.message.includes("UNIQUE constraint")) {
        return {
          status: 400,
          body: { body: "Project name already exists" },
        };
      }
      return {
        status: 500,
        body: { body: "Error creating project" },
      };
    }
  },

  toggleProjectSuppress: async ({ params, req }) => {
    const authReq = req as unknown as AuthStubRequest;

    if (!authReq.currentUser) {
      return {
        status: 401,
        body: undefined,
      };
    }
    if (!authReq.currentUser.roles.includes("admin")) {
      return {
        status: 403,
        body: { body: "Forbidden" },
      };
    }

    const id = parseInt(params.id);
    projectModel.toggleSuppress(id);
    const projects = projectModel.getAll(true);
    const html = renderProjectList({
      projects: projects.map((p) => ({
        id: p.id,
        name: p.name,
        suppressed: p.suppressed || false,
      })),
    });
    return {
      status: 200,
      body: html,
    };
  },

  // Admin users-projects routes
  adminUsersProjects: async ({ req }) => {
    const authReq = req as unknown as AuthStubRequest;

    if (!authReq.currentUser) {
      return {
        status: 401,
        body: undefined,
      };
    }
    if (!authReq.currentUser.roles.includes("admin")) {
      return {
        status: 403,
        body: { body: "Forbidden" },
      };
    }

    const html = renderUsersProjectsPage(authReq);
    return {
      status: 200,
      body: html,
    };
  },

  adminUsersProjectsProject: async ({ query, req }) => {
    const authReq = req as unknown as AuthStubRequest;

    if (!authReq.currentUser) {
      return {
        status: 401,
        body: undefined,
      };
    }
    if (!authReq.currentUser.roles.includes("admin")) {
      return {
        status: 403,
        body: { body: "Forbidden" },
      };
    }

    const projectId = parseInt(query?.project_id as string);
    if (!projectId) {
      return {
        status: 200,
        body: '<p class="text-gray-500">Select a project to manage workers.</p>',
      };
    }
    const html = renderProjectWorkers(projectId);
    return {
      status: 200,
      body: html,
    };
  },

  assignWorkerToProject: async ({ body, req }) => {
    const authReq = req as unknown as AuthStubRequest;

    if (!authReq.currentUser) {
      return {
        status: 401,
        body: undefined,
      };
    }
    if (!authReq.currentUser.roles.includes("admin")) {
      return {
        status: 403,
        body: { body: "Forbidden" },
      };
    }

    const { project_id, user_id } = body;
    const projectId = parseInt(project_id as string);
    const userId = user_id;

    if (!projectId || !userId) {
      return {
        status: 400,
        body: { body: "Invalid project or user ID" },
      };
    }

    try {
      projectUserModel.create(userId, projectId);
      const html = renderProjectWorkers(projectId);
      return {
        status: 200,
        body: html,
      };
    } catch (error) {
      if (error instanceof Error && error.message.includes("UNIQUE constraint")) {
        return {
          status: 400,
          body: { body: "Worker already assigned to this project" },
        };
      }
      return {
        status: 500,
        body: { body: "Error assigning worker" },
      };
    }
  },

  removeWorkerFromProject: async ({ params, req }) => {
    const authReq = req as unknown as AuthStubRequest;

    if (!authReq.currentUser) {
      return {
        status: 401,
        body: undefined,
      };
    }
    if (!authReq.currentUser.roles.includes("admin")) {
      return {
        status: 403,
        body: { body: "Forbidden" },
      };
    }

    const id = parseInt(params.id);

    const allProjects = projectModel.getAll(true);
    let projectUser: ProjectUser | null = null;
    for (const project of allProjects) {
      const projectUsers = projectUserModel.getByProjectId(project.id, true);
      const found = projectUsers.find((pu) => pu.id === id);
      if (found) {
        projectUser = found;
        break;
      }
    }

    if (!projectUser) {
      return {
        status: 404,
        body: { body: "Assignment not found" },
      };
    }

    projectUserModel.delete(id);
    const html = renderProjectWorkers(projectUser.project_id);
    return {
      status: 200,
      body: html,
    };
  },

  // Admin system reports routes
  adminSystemReports: async ({ req }) => {
    const authReq = req as unknown as AuthStubRequest;

    if (!authReq.currentUser) {
      return {
        status: 401,
        body: undefined,
      };
    }
    if (!authReq.currentUser.roles.includes("admin")) {
      return {
        status: 403,
        body: { body: "Forbidden" },
      };
    }

    const html = renderSystemReportsPage(authReq);
    return {
      status: 200,
      body: html,
    };
  },

  adminSystemReportsData: async ({ req }) => {
    const authReq = req as unknown as AuthStubRequest;

    if (!authReq.currentUser) {
      return {
        status: 401,
        body: undefined,
      };
    }
    if (!authReq.currentUser.roles.includes("admin")) {
      return {
        status: 403,
        body: { body: "Forbidden" },
      };
    }

    const html = renderSystemReports();
    return {
      status: 200,
      body: html,
    };
  },
});
