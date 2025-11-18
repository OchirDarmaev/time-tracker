import { initServer } from "@ts-rest/express";
import { accountDashboardContract } from "./contract.js";
import { AuthContext } from "@/shared/middleware/auth_stub.js";
import { isAuthContext } from "@/shared/middleware/isAuthContext.js";
import { timeEntryModel } from "@/shared/models/time_entry.js";
import { projectModel } from "@/shared/models/project.js";
import { formatDate, minutesToHours } from "@/shared/utils/date_utils.js";
import { validateDate, validateMinutes } from "@/shared/utils/validation.js";
import { renderEntriesTable } from "./views/entries_table.js";
import { Dashboard } from "./views/dashboard.js";
import { Layout } from "@/shared/utils/layout.js";
import { renderTimeSlider } from "@/features/account/dashboard/components/render-time-slider.js";
import { tsBuildUrl } from "../../../shared/utils/paths.js";

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

    const projects = projectModel.getByUserId(currentUser.id);
    const entries = timeEntryModel.getByUserIdAndDate(currentUser.id, date);
    const html = renderEntriesTable(entries, projects);
    return {
      status: 200,
      body: String(html),
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
    const projects = projectModel.getByUserId(currentUser.id);
    const entries = timeEntryModel.getByUserIdAndDate(currentUser.id, date);
    const html = renderEntriesTable(entries, projects);
    return {
      status: 200,
      body: String(html),
    };
  },

  syncDashboardEntries: async ({ body, req }) => {
    const authReq = req as unknown as AuthContext;

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
    const {
      date,
      segments,
      // planned_hours
    } = body;

    if (!validateDate(date)) {
      return {
        status: 400,
        body: { success: false },
      };
    }

    // Verify user has access to all projects
    const userProjects = projectModel.getByUserId(currentUser.id);
    const projectIds = new Set(userProjects.map((p) => p.id));

    if (segments) {
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
    }

    // Delete all existing entries for this date and user
    const existingEntries = timeEntryModel.getByUserIdAndDate(currentUser.id, date);
    for (const entry of existingEntries) {
      timeEntryModel.delete(entry.id);
    }

    if (segments) {
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
    }
    // Re-fetch entries and projects to render updated slider
    const entries = timeEntryModel.getByUserIdAndDate(currentUser.id, date);
    const projects = projectModel.getByUserId(currentUser.id);
    const totalMinutes = timeEntryModel.getTotalMinutesByUserAndDate(currentUser.id, date);
    const totalHours = minutesToHours(totalMinutes);
    const sliderTotalHours = Math.max(totalHours, REQUIRED_DAILY_HOURS);

    const segmentsForSlider = entries.map((entry) => ({
      project_id: entry.project_id,
      minutes: entry.minutes,
      comment: entry.comment || null,
    }));

    const html = renderTimeSlider({
      totalHours: sliderTotalHours,
      segments: segmentsForSlider,
      projects,
      date,
      syncUrl: tsBuildUrl(accountDashboardContract.syncDashboardEntries, {}),
    });

    return {
      status: 200,
      body: String(html),
    };
  },
  timeSlider: async ({ query, req }) => {
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
    const totalMinutes = timeEntryModel.getTotalMinutesByUserAndDate(currentUser.id, date);
    const totalHours = minutesToHours(totalMinutes);
    const sliderTotalHours = Math.max(totalHours, REQUIRED_DAILY_HOURS);

    const segments = entries.map((entry) => ({
      project_id: entry.project_id,
      minutes: entry.minutes,
      comment: entry.comment || null,
    }));

    const html = renderTimeSlider({
      totalHours: sliderTotalHours,
      segments: segments,
      projects: projects.map((p) => ({
        id: p.id,
        name: p.name,
        suppressed: p.suppressed || false,
        color: p.color,
        isSystem: p.isSystem || false,
      })),
      date: date,
      syncUrl: tsBuildUrl(accountDashboardContract.syncDashboardEntries, {}),
    });

    return {
      status: 200,
      body: String(html),
    };
  },
});
