import { Hono } from "hono";
import * as v from "valibot";
import { sValidator } from "@hono/standard-validator";
import { calendarService } from "./service";
import { CalendarManagement } from "./components/calendar_management";
import { requireAuth } from "../auth/middleware";
import { getMonthFromDate, formatDate } from "../../lib/date_utils";
import { type Calendar } from "../../lib/mock_db";

const app = new Hono()
  .use(requireAuth)
  .get(
    "/",
    sValidator("query", v.object({ month: v.optional(v.string()) })),
    async (c) => {
      const month =
        c.req.valid("query").month || getMonthFromDate(formatDate(new Date()));

      // Get calendar data for the entire year for yearly summary
      const year = new Date(month + "-01").getFullYear();
      const calendarDaysByMonth = new Map<string, Calendar[]>();

      for (let m = 0; m < 12; m++) {
        const monthStr = `${year}-${String(m + 1).padStart(2, "0")}`;
        const days = await calendarService.getByMonth(monthStr);
        calendarDaysByMonth.set(monthStr, days);
      }

      return c.render(
        <CalendarManagement
          month={month}
          calendarDaysByMonth={calendarDaysByMonth}
        />
      );
    }
  )
  .post(
    "/day-type",
    sValidator(
      "form",
      v.object({
        date: v.string(),
        day_type: v.picklist(["workday", "public_holiday", "weekend"]),
      })
    ),
    async (c) => {
      const { date, day_type } = c.req.valid("form");
      await calendarService.createOrUpdate(date, day_type);
      const month = getMonthFromDate(date);

      // Get calendar data for the entire year for yearly summary
      const year = new Date(month + "-01").getFullYear();
      const calendarDaysByMonth = new Map<string, Calendar[]>();

      for (let m = 0; m < 12; m++) {
        const monthStr = `${year}-${String(m + 1).padStart(2, "0")}`;
        const days = await calendarService.getByMonth(monthStr);
        calendarDaysByMonth.set(monthStr, days);
      }

      return c.render(
        <CalendarManagement
          month={month}
          calendarDaysByMonth={calendarDaysByMonth}
        />
      );
    }
  );

export default app;
