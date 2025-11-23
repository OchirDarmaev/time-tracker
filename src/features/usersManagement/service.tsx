// User Service

import { mockDb } from "../../lib/mock_db";
import { User, ProjectUser, Calendar } from "../calendarManagement/models";

export const userService = {
  async getAll(): Promise<User[]> {
    return await mockDb.findAllUsers();
  },
};
// ProjectUser Service

export const projectUserService = {
  async getAll(): Promise<ProjectUser[]> {
    return await mockDb.findAllProjectUsers();
  },

  async getByUserAndProject(
    userId: number,
    projectId: number
  ): Promise<ProjectUser | null> {
    return await mockDb.findProjectUser(userId, projectId);
  },

  async create(userId: number, projectId: number): Promise<ProjectUser> {
    return await mockDb.createProjectUser(userId, projectId, 0);
  },

  async toggleSuppressByUserAndProject(
    userId: number,
    projectId: number
  ): Promise<void> {
    const existing = await mockDb.findProjectUser(userId, projectId);
    if (!existing) {
      throw new Error("Project user assignment not found");
    }
    await mockDb.updateProjectUser(existing.id, {
      suppressed: existing.suppressed === 0 ? 1 : 0,
    });
  },
};
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
