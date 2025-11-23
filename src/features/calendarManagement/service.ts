import { mockDb } from "../../lib/mock_db";
import { Calendar } from "./models";

// Calendar Service
export const calendarService = {
  async getByDate(date: string): Promise<Calendar | null> {
    return await mockDb.findCalendarByDate(date);
  },

  async getByMonth(month: string): Promise<Calendar[]> {
    // month is in YYYY-MM format
    const startDate = `${month}-01`;
    const date = new Date(startDate + "T00:00:00");
    const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    const endDate = `${month}-${String(lastDay.getDate()).padStart(2, "0")}`;
    return await mockDb.findCalendarByDateRange(startDate, endDate);
  },

  async createOrUpdate(
    date: string,
    dayType: "workday" | "public_holiday" | "weekend"
  ): Promise<Calendar> {
    const existing = await mockDb.findCalendarByDate(date);
    if (existing) {
      const updated = await mockDb.updateCalendar(existing.id, {
        day_type: dayType,
      });
      if (!updated) {
        throw new Error("Failed to update calendar");
      }
      return updated;
    } else {
      return await mockDb.createCalendar(date, dayType);
    }
  },
};
