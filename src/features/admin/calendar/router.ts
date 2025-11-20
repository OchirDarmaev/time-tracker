import { initServer } from "@ts-rest/express";
import { adminCalendarContract } from "./contract.js";
import { AuthContext } from "@/shared/middleware/auth_stub.js";
import { isAuthContext } from "@/shared/middleware/isAuthContext.js";
import { calendarModel } from "@/shared/models/calendar.js";
import { Layout } from "@/shared/utils/layout.js";
import { getMonthFromDate, formatDate } from "@/shared/utils/date_utils.js";
import { CalendarManagementView } from "./views/calendar_management.js";

const s = initServer();

export const adminCalendarRouter = s.router(adminCalendarContract, {
  view: async (req) => {
    if (!isAuthContext(req.req)) {
      return {
        status: 401,
        body: { body: "Unauthorized" },
      };
    }

    const authReq = req.req as unknown as AuthContext;
    if (!authReq.currentUser) {
      return {
        status: 401,
        body: { body: "Unauthorized" },
      };
    }

    // Check if user has manager or admin role
    const hasManagerRole =
      authReq.currentUser.roles.includes("office-manager") ||
      authReq.currentUser.roles.includes("admin");

    if (!hasManagerRole) {
      return {
        status: 403,
        body: { body: "Forbidden" },
      };
    }

    const month = (req.query?.month as string) || getMonthFromDate(formatDate(new Date()));
    const html = CalendarManagementView(month, authReq);

    if (req.headers["hx-request"] === "true") {
      return {
        status: 200,
        body: String(html),
      };
    }

    return {
      status: 200,
      body: String(Layout(html, authReq, "calendar")),
    };
  },

  setDayType: async ({ body, req }) => {
    const authReq = req as unknown as AuthContext;

    if (!authReq.currentUser) {
      return {
        status: 401,
        body: { body: "Unauthorized" },
      };
    }

    const hasManagerRole =
      authReq.currentUser.roles.includes("office-manager") ||
      authReq.currentUser.roles.includes("admin");

    if (!hasManagerRole) {
      return {
        status: 403,
        body: { body: "Forbidden" },
      };
    }

    try {
      const { date, day_type } = body;

      const existing = calendarModel.getByDate(date);
      if (existing) {
        calendarModel.update(date, day_type);
      } else {
        calendarModel.create(date, day_type);
      }

      const month = getMonthFromDate(date);
      const html = CalendarManagementView(month, authReq);
      return {
        status: 200,
        body: String(html),
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Failed to set day type";
      return {
        status: 400,
        body: { body: errorMessage },
      };
    }
  },
});
