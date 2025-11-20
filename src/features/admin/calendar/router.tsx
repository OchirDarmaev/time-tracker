import { initServer } from "@ts-rest/express";
import { adminCalendarContract } from "./contract.js";
import { AuthContext } from "@/shared/middleware/auth_stub.js";
import { checkAuth, checkAuthFromContext } from "@/shared/utils/auth_helpers.js";
import { htmxResponse } from "@/shared/utils/htmx_response.js";
import { calendarModel } from "@/shared/models/calendar.js";
import { getMonthFromDate, formatDate } from "@/shared/utils/date_utils.js";
import { CalendarManagementView } from "./views/calendar_management.js";

const s = initServer();

export const adminCalendarRouter = s.router(adminCalendarContract, {
  view: async (req) => {
    const authCheck = checkAuth(req, "office-manager", "admin");
    if (!authCheck.success) {
      return authCheck.response;
    }

    const month = (req.query?.month as string) || getMonthFromDate(formatDate(new Date()));
    const html = CalendarManagementView(month, authCheck.authReq);

    return htmxResponse(req, html, authCheck.authReq, "calendar");
  },

  setDayType: async ({ body, req }) => {
    const authReq = req as unknown as AuthContext;

    const authError = checkAuthFromContext(authReq, "office-manager", "admin");
    if (authError) {
      return authError;
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
