import { initServer } from "@ts-rest/express";
import { accountTimeContract } from "./contract.js";
import { AuthStubRequest } from "../../../shared/middleware/auth_stub.js";
import { timeEntryModel } from "../../../shared/models/time_entry.js";
import { projectModel } from "../../../shared/models/project.js";
import {
  formatDate,
  getMonthFromDate,
  minutesToHours,
  getWorkingDaysInMonth,
  parseDate,
} from "../../../shared/utils/date_utils.js";
import { validateDate, validateMinutes } from "../../../shared/utils/validation.js";
import { renderSummary } from "./views/summary.js";
import { renderEntriesTable } from "./views/entries_table.js";
import { renderTimeTrackingPage } from "./views/time_tracking_page.js";

const s = initServer();

export const accountTimeRouter = s.router(accountTimeContract, {
  accountTime: async ({ req }) => {
    const authReq = req as unknown as AuthStubRequest;

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

  accountTimeEntries: async ({ query, req }) => {
    const authReq = req as unknown as AuthStubRequest;

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
    if (!authReq.currentUser.roles.includes("account")) {
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
    if (!authReq.currentUser.roles.includes("account")) {
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

  accountTimeSummary: async ({ query, req }) => {
    const authReq = req as unknown as AuthStubRequest;

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

    const totalMinutes = timeEntryModel.getTotalMinutesByUserAndDate(currentUser.id, date);
    const totalHours = minutesToHours(totalMinutes);

    const month = getMonthFromDate(date);
    const monthlyTotalMinutes = timeEntryModel.getTotalMinutesByUserAndMonth(currentUser.id, month);
    const monthlyTotalHours = minutesToHours(monthlyTotalMinutes);

    const dateObj = parseDate(date);
    const workingDays = getWorkingDaysInMonth(dateObj.getFullYear(), dateObj.getMonth() + 1);
    const requiredMonthlyHours = workingDays * 8;

    const monthlyWarning = monthlyTotalHours < requiredMonthlyHours;
    const monthlyOverLimit = monthlyTotalHours > requiredMonthlyHours;

    const html = renderSummary(
      totalHours,
      monthlyTotalHours,
      requiredMonthlyHours,
      monthlyWarning,
      monthlyOverLimit
    );
    return {
      status: 200,
      body: html,
    };
  },
});
