import { mockDb, type Project, type TimeEntry, type Calendar } from "./mock_db";

// Project Model - async wrappers
export const projectModel = {
  getById: async (id: number): Promise<Project | null> => {
    return await mockDb.findProjectById(id);
  },

  getByUserId: async (userId: number): Promise<Project[]> => {
    return await mockDb.getUserProjects(userId);
  },
};

// TimeEntry Model - async wrappers
export const timeEntryModel = {
  getById: async (id: number): Promise<TimeEntry | null> => {
    return await mockDb.findTimeEntryById(id);
  },

  getByUserId: async (userId: number): Promise<TimeEntry[]> => {
    return await mockDb.findTimeEntriesByUserId(userId);
  },

  getByUserIdAndDate: async (
    userId: number,
    date: string
  ): Promise<TimeEntry[]> => {
    return await mockDb.findTimeEntriesByUserAndDateRange(userId, date, date);
  },

  getByUserIdAndMonth: async (
    userId: number,
    month: string
  ): Promise<TimeEntry[]> => {
    // month is in YYYY-MM format
    const startDate = `${month}-01`;
    const date = new Date(startDate + "T00:00:00");
    const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    const endDate = `${month}-${String(lastDay.getDate()).padStart(2, "0")}`;
    return await mockDb.findTimeEntriesByUserAndDateRange(
      userId,
      startDate,
      endDate
    );
  },

  getTotalHoursByUserAndDate: async (
    userId: number,
    date: string
  ): Promise<number> => {
    const entries = await mockDb.findTimeEntriesByUserAndDateRange(
      userId,
      date,
      date
    );
    return entries.reduce((sum, entry) => sum + entry.hours, 0);
  },

  create: async (
    userId: number,
    projectId: number,
    date: string,
    hours: number,
    comment: string | null
  ): Promise<TimeEntry> => {
    return await mockDb.createTimeEntry(
      userId,
      projectId,
      date,
      hours,
      comment
    );
  },

  update: async (
    id: number,
    updates: { hours?: number; comment?: string | null }
  ): Promise<TimeEntry | null> => {
    return await mockDb.updateTimeEntry(id, updates);
  },

  delete: async (id: number): Promise<boolean> => {
    return await mockDb.deleteTimeEntry(id);
  },
};

// Calendar Model - async wrappers
export const calendarModel = {
  getByDate: async (date: string): Promise<Calendar | null> => {
    return await mockDb.findCalendarByDate(date);
  },

  getByMonth: async (month: string): Promise<Calendar[]> => {
    // month is in YYYY-MM format
    const startDate = `${month}-01`;
    const date = new Date(startDate + "T00:00:00");
    const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    const endDate = `${month}-${String(lastDay.getDate()).padStart(2, "0")}`;
    return await mockDb.findCalendarByDateRange(startDate, endDate);
  },
};
