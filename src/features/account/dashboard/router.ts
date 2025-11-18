import { initServer } from "@ts-rest/express";
import { ClientInferRequest } from "@ts-rest/core";
import { accountDashboardContract } from "./contract.js";
import { AuthContext } from "@/shared/middleware/auth_stub.js";
import { isAuthContext } from "@/shared/middleware/isAuthContext.js";
import { timeEntryModel } from "@/shared/models/time_entry.js";
import { projectModel } from "@/shared/models/project.js";
import { formatDate } from "@/shared/utils/date_utils.js";
import { validateDate, validateMinutes } from "@/shared/utils/validation.js";
import { renderEntriesTable } from "./views/entries_table.js";
import { Dashboard } from "./views/dashboard.js";
import { Layout } from "@/shared/utils/layout.js";

export const REQUIRED_DAILY_HOURS = 8;

const s = initServer();

export const HOLIDAY_PROJECT_NAME = "Holiday";
export const accountTimeRouter = s.router(accountDashboardContract, {
  dashboard: async (req) => {
    if (!isAuthContext(req.req)) {
      return {
        status: 401,
        body: { body: "Unauthorized" },
      };
    }

    if (!req.req.currentUser) {
      return {
        status: 401,
        body: { body: "Unauthorized" },
      };
    }
    if (!req.req.currentUser.roles.includes("account")) {
      return {
        status: 403,
        body: { body: "Forbidden" },
      };
    }
    if (req.headers["hx-request"] === "true") {
      return {
        status: 200,
        body: String(Dashboard(req, req.req)),
      };
    }

    return {
      status: 200,
      body: String(Layout(Dashboard(req, req.req), req.req, "account")),
    };
  },
  accountDashboardEntries: async ({ query, req }) => {
    const authReq = req as unknown as AuthContext;

    if (!authReq.currentUser) {
      return {
        status: 401,
        body: { body: "Unauthorized" },
      };
    }
    if (!authReq.currentUser.roles.includes("account")) {
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
      body: String(html),
    };
  },

  createDashboardEntry: async ({ body, req }) => {
    const authReq = req as unknown as AuthContext;

    if (!authReq.currentUser) {
      return {
        status: 401,
        body: { body: "Unauthorized" },
      };
    }
    if (!authReq.currentUser.roles.includes("account")) {
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

    // Return the full dashboard to update everything
    const dashboardReq: ClientInferRequest<typeof accountDashboardContract.dashboard> = {
      query: { date: String(date) },
      headers: { "hx-request": "true" },
    };

    return {
      status: 200,
      body: String(Dashboard(dashboardReq, authReq)),
    };
  },

  deleteDashboardEntry: async ({ params, req }) => {
    const authReq = req as unknown as AuthContext;

    if (!authReq.currentUser) {
      return {
        status: 401,
        body: { body: "Unauthorized" },
      };
    }
    if (!authReq.currentUser.roles.includes("account")) {
      return {
        status: 403,
        body: { body: "Forbidden" },
      };
    }

    const currentUser = authReq.currentUser;

    const entry = timeEntryModel.getById(params.entryId);
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

    timeEntryModel.delete(params.entryId);

    const date = entry.date;

    // Return the full dashboard to update everything
    const dashboardReq: ClientInferRequest<typeof accountDashboardContract.dashboard> = {
      query: { date: String(date) },
      headers: { "hx-request": "true" },
    };

    return {
      status: 200,
      body: String(Dashboard(dashboardReq, authReq)),
    };
  },
  addDashboardSegment: async ({ body, req }) => {
    const authReq = req as unknown as AuthContext;

    if (!authReq.currentUser) {
      return {
        status: 401,
        body: { body: "Unauthorized" },
      };
    }
    if (!authReq.currentUser.roles.includes("account")) {
      return {
        status: 403,
        body: { body: "Forbidden" },
      };
    }

    const currentUser = authReq.currentUser;
    const { date, project_id, minutes, comment } = body;

    if (!validateDate(date)) {
      return {
        status: 400,
        body: { body: "Invalid date" },
      };
    }

    if (!validateMinutes(minutes)) {
      return {
        status: 400,
        body: { body: "Invalid minutes" },
      };
    }

    // Verify user has access to project
    const userProjects = projectModel.getByUserId(currentUser.id);
    const project = userProjects.find((p) => p.id === project_id);
    if (!project) {
      return {
        status: 403,
        body: { body: "Access denied to this project" },
      };
    }

    // Create the entry
    timeEntryModel.create(currentUser.id, project_id, date, minutes, comment || null);

    // Return the full dashboard to update everything
    const dashboardReq: ClientInferRequest<typeof accountDashboardContract.dashboard> = {
      query: { date: String(date) },
      headers: { "hx-request": "true" },
    };

    return {
      status: 200,
      body: String(Dashboard(dashboardReq, authReq)),
    };
  },
  updateDashboardSegment: async ({ params, body, req }) => {
    const authReq = req as unknown as AuthContext;

    if (!authReq.currentUser) {
      return {
        status: 401,
        body: { body: "Unauthorized" },
      };
    }
    if (!authReq.currentUser.roles.includes("account")) {
      return {
        status: 403,
        body: { body: "Forbidden" },
      };
    }

    const currentUser = authReq.currentUser;
    const entry = timeEntryModel.getById(params.entryId);

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

    // Validate minutes if provided
    if (body.minutes !== undefined && !validateMinutes(body.minutes)) {
      return {
        status: 400,
        body: { body: "Invalid minutes" },
      };
    }

    // Update the entry
    const updated = timeEntryModel.update(params.entryId, {
      minutes: body.minutes,
      comment: body.comment,
    });

    if (!updated) {
      return {
        status: 404,
        body: { body: "Entry not found" },
      };
    }

    // Return the full dashboard to update everything
    const dashboardReq: ClientInferRequest<typeof accountDashboardContract.dashboard> = {
      query: { date: String(entry.date) },
      headers: { "hx-request": "true" },
    };

    return {
      status: 200,
      body: String(Dashboard(dashboardReq, authReq)),
    };
  },

  deleteDashboardSegment: async ({ params, req }) => {
    const authReq = req as unknown as AuthContext;

    if (!authReq.currentUser) {
      return {
        status: 401,
        body: { body: "Unauthorized" },
      };
    }
    if (!authReq.currentUser.roles.includes("account")) {
      return {
        status: 403,
        body: { body: "Forbidden" },
      };
    }

    const currentUser = authReq.currentUser;
    const entry = timeEntryModel.getById(params.entryId);

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

    const date = entry.date;
    timeEntryModel.delete(params.entryId);

    // Return the full dashboard to update everything
    const dashboardReq: ClientInferRequest<typeof accountDashboardContract.dashboard> = {
      query: { date: String(date) },
      headers: { "hx-request": "true" },
    };

    return {
      status: 200,
      body: String(Dashboard(dashboardReq, authReq)),
    };
  },
});
