import { initServer } from "@ts-rest/express";
import { ClientInferRequest } from "@ts-rest/core";
import { accountDashboardContract } from "./contract.js";
import { AuthContext } from "@/shared/middleware/auth_stub.js";
import { checkAuth, checkAuthFromContext } from "@/shared/utils/auth_helpers.js";
import { htmxResponse } from "@/shared/utils/htmx_response.js";
import { timeEntryModel } from "@/shared/models/time_entry.js";
import { projectModel } from "@/shared/models/project.js";
import { formatDate } from "@/shared/utils/date_utils.js";
import { validateDate, validateHours } from "@/shared/utils/validation.js";
import { renderEntriesTable } from "./views/entries_table.js";
import { Dashboard } from "./views/dashboard.js";

export const REQUIRED_DAILY_HOURS = 8;

const s = initServer();

export const HOLIDAY_PROJECT_NAME = "Holiday";
export const accountTimeRouter = s.router(accountDashboardContract, {
  dashboard: async (req) => {
    const authCheck = checkAuth(req, "account");
    if (!authCheck.success) {
      return authCheck.response;
    }

    return htmxResponse(req, Dashboard(req, authCheck.authReq), authCheck.authReq, "account");
  },
  accountDashboardEntries: async ({ query, req }) => {
    const authReq = req as unknown as AuthContext;

    const authError = checkAuthFromContext(authReq, "account");
    if (authError) {
      return authError;
    }

    const currentUser = authReq.currentUser!;
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

    const authError = checkAuthFromContext(authReq, "account");
    if (authError) {
      return authError;
    }

    const currentUser = authReq.currentUser!;
    const { project_id, date, hours, comment } = body;
    let localHours = 0;
    if (!hours) {
      // get all available hours for current user in that day limit 8 hours
      const availableHours = timeEntryModel.getTotalHoursByUserAndDate(currentUser.id, date);
      localHours = Math.max(1, REQUIRED_DAILY_HOURS - availableHours);
    } else {
      localHours = hours;
    }

    const project = projectModel.getById(project_id);
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

    timeEntryModel.create(currentUser.id, project.id, date, localHours, comment || null);

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

    const authError = checkAuthFromContext(authReq, "account");
    if (authError) {
      return authError;
    }

    const currentUser = authReq.currentUser!;

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

    const authError = checkAuthFromContext(authReq, "account");
    if (authError) {
      return authError;
    }

    const currentUser = authReq.currentUser!;
    const { date, project_id, hours, comment } = body;

    let localHours: number;
    if (!hours) {
      // get all available hours for current user in that day limit 8 hours
      const availableHours = timeEntryModel.getTotalHoursByUserAndDate(currentUser.id, date);
      localHours = Math.max(1, REQUIRED_DAILY_HOURS - availableHours);
    } else {
      localHours = hours;
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
    timeEntryModel.create(currentUser.id, project_id, date, localHours, comment || null);

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

    const authError = checkAuthFromContext(authReq, "account");
    if (authError) {
      return authError;
    }

    const currentUser = authReq.currentUser!;
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

    // Validate hours if provided
    if (body.hours !== undefined && !validateHours(body.hours)) {
      return {
        status: 400,
        body: { body: "Invalid hours" },
      };
    }

    // Update the entry
    const updated = timeEntryModel.update(params.entryId, {
      hours: body.hours,
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

    const authError = checkAuthFromContext(authReq, "account");
    if (authError) {
      return authError;
    }

    const currentUser = authReq.currentUser!;
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
