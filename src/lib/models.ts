import { repo, type Project, type TimeEntry, type Calendar } from "./repo";
import type { Context } from "hono";
import { ContextType } from "..";

// Project Model - async wrappers
export const projectModel = {
  getById: async (
    c: Context<ContextType>,
    id: number
  ): Promise<Project | null> => {
    return await repo.findProjectById(c, id);
  },

  getByUserId: async (
    c: Context<ContextType>,
    userId: number
  ): Promise<Project[]> => {
    return await repo.getUserProjects(c, userId);
  },
};

// TimeEntry Model - async wrappers
export const timeEntryModel = {
  getById: async (
    c: Context<ContextType>,
    id: number
  ): Promise<TimeEntry | null> => {
    return await repo.findTimeEntryById(c, id);
  },

  getByUserId: async (
    c: Context<ContextType>,
    userId: number
  ): Promise<TimeEntry[]> => {
    return await repo.findTimeEntriesByUserId(c, userId);
  },

  getByUserIdAndDate: async (
    c: Context<ContextType>,
    userId: number,
    date: string
  ): Promise<TimeEntry[]> => {
    return await repo.findTimeEntriesByUserAndDateRange(c, userId, date, date);
  },

  getByUserIdAndMonth: async (
    c: Context<ContextType>,
    userId: number,
    month: string
  ): Promise<TimeEntry[]> => {
    // month is in YYYY-MM format
    const startDate = `${month}-01`;
    const date = new Date(startDate + "T00:00:00");
    const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    const endDate = `${month}-${String(lastDay.getDate()).padStart(2, "0")}`;
    return await repo.findTimeEntriesByUserAndDateRange(
      c,
      userId,
      startDate,
      endDate
    );
  },

  getTotalHoursByUserAndDate: async (
    c: Context<ContextType>,
    userId: number,
    date: string
  ): Promise<number> => {
    const entries = await repo.findTimeEntriesByUserAndDateRange(
      c,
      userId,
      date,
      date
    );
    return entries.reduce((sum, entry) => sum + entry.hours, 0);
  },

  create: async (
    c: Context<ContextType>,
    userId: number,
    projectId: number,
    date: string,
    hours: number,
    comment: string | null
  ): Promise<TimeEntry> => {
    return await repo.createTimeEntry(
      c,
      userId,
      projectId,
      date,
      hours,
      comment
    );
  },

  update: async (
    c: Context<ContextType>,
    id: number,
    updates: { hours?: number; comment?: string | null }
  ): Promise<TimeEntry | null> => {
    return await repo.updateTimeEntry(c, id, updates);
  },

  delete: async (c: Context<ContextType>, id: number): Promise<boolean> => {
    return await repo.deleteTimeEntry(c, id);
  },
};

// Calendar Model - async wrappers
export const calendarModel = {
  getByDate: async (
    c: Context<ContextType>,
    date: string
  ): Promise<Calendar | null> => {
    return await repo.findCalendarByDate(c, date);
  },

  getByMonth: async (
    c: Context<ContextType>,
    month: string
  ): Promise<Calendar[]> => {
    // month is in YYYY-MM format
    const startDate = `${month}-01`;
    const date = new Date(startDate + "T00:00:00");
    const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    const endDate = `${month}-${String(lastDay.getDate()).padStart(2, "0")}`;
    return await repo.findCalendarByDateRange(c, startDate, endDate);
  },
};
