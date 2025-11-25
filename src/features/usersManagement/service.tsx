// User Service

import { ContextType } from "../..";
import { repo } from "../../lib/repo";
import { User, ProjectUser, Calendar } from "../calendarManagement/models";
import type { Context } from "hono";

export const userService = {
  async getAll(c: Context<ContextType>): Promise<User[]> {
    return await repo.findAllUsers(c);
  },
};
// ProjectUser Service

export const projectUserService = {
  async getAll(c: Context<ContextType>): Promise<ProjectUser[]> {
    return await repo.findAllProjectUsers(c);
  },

  async getByUserAndProject(
    c: Context<ContextType>,
    userId: number,
    projectId: number
  ): Promise<ProjectUser | null> {
    return await repo.findProjectUser(c, userId, projectId);
  },

  async create(
    c: Context<ContextType>,
    userId: number,
    projectId: number
  ): Promise<ProjectUser> {
    return await repo.createProjectUser(c, userId, projectId, 0);
  },

  async toggleSuppressByUserAndProject(
    c: Context<ContextType>,
    userId: number,
    projectId: number
  ): Promise<void> {
    const existing = await repo.findProjectUser(c, userId, projectId);
    if (!existing) {
      throw new Error("Project user assignment not found");
    }
    await repo.updateProjectUser(c, existing.id, {
      suppressed: existing.suppressed === 0 ? 1 : 0,
    });
  },
};
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
