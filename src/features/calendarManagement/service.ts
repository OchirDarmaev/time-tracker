import { ContextType } from "../..";
import { repo } from "../../lib/repo";
import { Calendar } from "./models";
import type { Context } from "hono";

// Calendar Service
export const calendarService = {
  async getByDate(
    c: Context<ContextType>,
    date: string
  ): Promise<Calendar | null> {
    return await repo.findCalendarByDate(c, date);
  },

  async getByMonth(
    c: Context<ContextType>,
    month: string
  ): Promise<Calendar[]> {
    // month is in YYYY-MM format
    const startDate = `${month}-01`;
    const date = new Date(startDate + "T00:00:00");
    const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    const endDate = `${month}-${String(lastDay.getDate()).padStart(2, "0")}`;
    return await repo.findCalendarByDateRange(c, startDate, endDate);
  },

  async createOrUpdate(
    c: Context<ContextType>,
    date: string,
    dayType: "workday" | "public_holiday" | "weekend"
  ): Promise<Calendar> {
    const existing = await repo.findCalendarByDate(c, date);
    if (existing) {
      const updated = await repo.updateCalendar(c, existing.id, {
        day_type: dayType,
      });
      if (!updated) {
        throw new Error("Failed to update calendar");
      }
      return updated;
    } else {
      return await repo.createCalendar(c, date, dayType);
    }
  },
};
