import { db } from "./db";
import {
  users,
  projects,
  projectUsers,
  timeEntries,
  calendar,
  sessions,
} from "../db/schema";
import { eq, and, gte, lte } from "drizzle-orm";
import type { Context } from "hono";
import { ContextType } from "..";

export type User = {
  id: number;
  email: string;
  roles: string; // JSON string
  active: number; // 0 or 1
};

export type Project = {
  id: number;
  name: string;
  suppressed: number; // 0 or 1
  color: string;
  isSystem: number; // 0 or 1
};

export type ProjectUser = {
  id: number;
  user_id: number;
  project_id: number;
  suppressed: number; // 0 or 1
};

export type TimeEntry = {
  id: number;
  user_id: number;
  project_id: number;
  date: string;
  hours: number;
  comment: string | null;
};

export type Calendar = {
  id: number;
  date: string;
  day_type: "workday" | "public_holiday" | "weekend";
  updated_at: string;
};

export type Session = {
  session_id: string;
  data: string; // JSON string
  expires_at: number;
};

// Helper functions to convert between schema and API types
function userFromSchema(row: typeof users.$inferSelect): User {
  return {
    id: row.id,
    email: row.email,
    roles: row.roles,
    active: row.active ? 1 : 0,
  };
}

function projectFromSchema(row: typeof projects.$inferSelect): Project {
  return {
    id: row.id,
    name: row.name,
    suppressed: row.suppressed ? 1 : 0,
    color: row.color,
    isSystem: row.isSystem ? 1 : 0,
  };
}

function projectUserFromSchema(
  row: typeof projectUsers.$inferSelect
): ProjectUser {
  return {
    id: row.id,
    user_id: row.userId,
    project_id: row.projectId,
    suppressed: row.suppressed ? 1 : 0,
  };
}

function timeEntryFromSchema(row: typeof timeEntries.$inferSelect): TimeEntry {
  return {
    id: row.id,
    user_id: row.userId,
    project_id: row.projectId,
    date: row.date,
    hours: row.hours,
    comment: row.comment,
  };
}

function calendarFromSchema(row: typeof calendar.$inferSelect): Calendar {
  return {
    id: row.id,
    date: row.date,
    day_type: row.dayType,
    updated_at: row.updatedAt,
  };
}

function sessionFromSchema(row: typeof sessions.$inferSelect): Session {
  return {
    session_id: row.sessionId,
    data: row.data,
    expires_at: row.expiresAt,
  };
}

class Database {
  private getDb(c: Context<ContextType>) {
    return db(c);
  }

  // Users methods
  async findUserById(
    c: Context<ContextType>,
    id: number
  ): Promise<User | null> {
    const result = await this.getDb(c)
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);
    return result.length > 0 ? userFromSchema(result[0]) : null;
  }

  async findUserByEmail(
    c: Context<ContextType>,
    email: string
  ): Promise<User | null> {
    const result = await this.getDb(c)
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    return result.length > 0 ? userFromSchema(result[0]) : null;
  }

  async findAllUsers(c: Context<ContextType>): Promise<User[]> {
    const result = await this.getDb(c).select().from(users);
    return result.map(userFromSchema);
  }

  async createUser(
    c: Context<ContextType>,
    email: string,
    roles: string = '["account"]',
    active: number = 1
  ): Promise<User> {
    const result = await this.getDb(c)
      .insert(users)
      .values({
        email,
        roles,
        active: active === 1,
      })
      .returning();
    return userFromSchema(result[0]);
  }

  async updateUser(
    c: Context<ContextType>,
    id: number,
    updates: Partial<Omit<User, "id">>
  ): Promise<User | null> {
    const updateData: {
      email?: string;
      roles?: string;
      active?: boolean;
    } = {};
    if (updates.email !== undefined) updateData.email = updates.email;
    if (updates.roles !== undefined) updateData.roles = updates.roles;
    if (updates.active !== undefined) updateData.active = updates.active === 1;

    const result = await this.getDb(c)
      .update(users)
      .set(updateData)
      .where(eq(users.id, id))
      .returning();
    return result.length > 0 ? userFromSchema(result[0]) : null;
  }

  async deleteUser(c: Context<ContextType>, id: number): Promise<boolean> {
    const result = await this.getDb(c).delete(users).where(eq(users.id, id));
    return result.meta.changes > 0;
  }

  // Projects methods
  async findProjectById(
    c: Context<ContextType>,
    id: number
  ): Promise<Project | null> {
    const result = await this.getDb(c)
      .select()
      .from(projects)
      .where(eq(projects.id, id))
      .limit(1);
    return result.length > 0 ? projectFromSchema(result[0]) : null;
  }

  async findProjectByName(
    c: Context<ContextType>,
    name: string
  ): Promise<Project | null> {
    const result = await this.getDb(c)
      .select()
      .from(projects)
      .where(eq(projects.name, name))
      .limit(1);
    return result.length > 0 ? projectFromSchema(result[0]) : null;
  }

  async findAllProjects(c: Context<ContextType>): Promise<Project[]> {
    const result = await this.getDb(c).select().from(projects);
    return result.map(projectFromSchema);
  }

  async createProject(
    c: Context<ContextType>,
    name: string,
    suppressed: number = 0,
    color: string = "#14b8a6",
    isSystem: number = 0
  ): Promise<Project> {
    const result = await this.getDb(c)
      .insert(projects)
      .values({
        name,
        suppressed: suppressed === 1,
        color,
        isSystem: isSystem === 1,
      })
      .returning();
    return projectFromSchema(result[0]);
  }

  async updateProject(
    c: Context<ContextType>,
    id: number,
    updates: Partial<Omit<Project, "id">>
  ): Promise<Project | null> {
    const updateData: {
      name?: string;
      suppressed?: boolean;
      color?: string;
      isSystem?: boolean;
    } = {};
    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.suppressed !== undefined)
      updateData.suppressed = updates.suppressed === 1;
    if (updates.color !== undefined) updateData.color = updates.color;
    if (updates.isSystem !== undefined)
      updateData.isSystem = updates.isSystem === 1;

    const result = await this.getDb(c)
      .update(projects)
      .set(updateData)
      .where(eq(projects.id, id))
      .returning();
    return result.length > 0 ? projectFromSchema(result[0]) : null;
  }

  async deleteProject(c: Context<ContextType>, id: number): Promise<boolean> {
    const result = await this.getDb(c)
      .delete(projects)
      .where(eq(projects.id, id));
    return result.meta.changes > 0;
  }

  // ProjectUsers methods
  async findProjectUsersByUserId(
    c: Context<ContextType>,
    userId: number
  ): Promise<ProjectUser[]> {
    const result = await this.getDb(c)
      .select()
      .from(projectUsers)
      .where(
        and(eq(projectUsers.userId, userId), eq(projectUsers.suppressed, false))
      );
    return result.map(projectUserFromSchema);
  }

  async findProjectUsersByProjectId(
    c: Context<ContextType>,
    projectId: number
  ): Promise<ProjectUser[]> {
    const result = await this.getDb(c)
      .select()
      .from(projectUsers)
      .where(
        and(
          eq(projectUsers.projectId, projectId),
          eq(projectUsers.suppressed, false)
        )
      );
    return result.map(projectUserFromSchema);
  }

  async findProjectUser(
    c: Context<ContextType>,
    userId: number,
    projectId: number
  ): Promise<ProjectUser | null> {
    const result = await this.getDb(c)
      .select()
      .from(projectUsers)
      .where(
        and(
          eq(projectUsers.userId, userId),
          eq(projectUsers.projectId, projectId)
        )
      )
      .limit(1);
    return result.length > 0 ? projectUserFromSchema(result[0]) : null;
  }

  async createProjectUser(
    c: Context<ContextType>,
    userId: number,
    projectId: number,
    suppressed: number = 0
  ): Promise<ProjectUser> {
    const result = await this.getDb(c)
      .insert(projectUsers)
      .values({
        userId,
        projectId,
        suppressed: suppressed === 1,
      })
      .returning();
    return projectUserFromSchema(result[0]);
  }

  async updateProjectUser(
    c: Context<ContextType>,
    id: number,
    updates: Partial<Omit<ProjectUser, "id">>
  ): Promise<ProjectUser | null> {
    const updateData: {
      userId?: number;
      projectId?: number;
      suppressed?: boolean;
    } = {};
    if (updates.user_id !== undefined) updateData.userId = updates.user_id;
    if (updates.project_id !== undefined)
      updateData.projectId = updates.project_id;
    if (updates.suppressed !== undefined)
      updateData.suppressed = updates.suppressed === 1;

    const result = await this.getDb(c)
      .update(projectUsers)
      .set(updateData)
      .where(eq(projectUsers.id, id))
      .returning();
    return result.length > 0 ? projectUserFromSchema(result[0]) : null;
  }

  async deleteProjectUser(
    c: Context<ContextType>,
    id: number
  ): Promise<boolean> {
    const result = await this.getDb(c)
      .delete(projectUsers)
      .where(eq(projectUsers.id, id));
    return result.meta.changes > 0;
  }

  async findAllProjectUsers(c: Context<ContextType>): Promise<ProjectUser[]> {
    const result = await this.getDb(c).select().from(projectUsers);
    return result.map(projectUserFromSchema);
  }

  // TimeEntries methods
  async findTimeEntryById(
    c: Context<ContextType>,
    id: number
  ): Promise<TimeEntry | null> {
    const result = await this.getDb(c)
      .select()
      .from(timeEntries)
      .where(eq(timeEntries.id, id))
      .limit(1);
    return result.length > 0 ? timeEntryFromSchema(result[0]) : null;
  }

  async findTimeEntriesByUserId(
    c: Context<ContextType>,
    userId: number
  ): Promise<TimeEntry[]> {
    const result = await this.getDb(c)
      .select()
      .from(timeEntries)
      .where(eq(timeEntries.userId, userId));
    return result.map(timeEntryFromSchema);
  }

  async findTimeEntriesByProjectId(
    c: Context<ContextType>,
    projectId: number
  ): Promise<TimeEntry[]> {
    const result = await this.getDb(c)
      .select()
      .from(timeEntries)
      .where(eq(timeEntries.projectId, projectId));
    return result.map(timeEntryFromSchema);
  }

  async findTimeEntriesByDateRange(
    c: Context<ContextType>,
    startDate: string,
    endDate: string
  ): Promise<TimeEntry[]> {
    const result = await this.getDb(c)
      .select()
      .from(timeEntries)
      .where(
        and(gte(timeEntries.date, startDate), lte(timeEntries.date, endDate))
      );
    return result.map(timeEntryFromSchema);
  }

  async findTimeEntriesByUserAndDateRange(
    c: Context<ContextType>,
    userId: number,
    startDate: string,
    endDate: string
  ): Promise<TimeEntry[]> {
    const result = await this.getDb(c)
      .select()
      .from(timeEntries)
      .where(
        and(
          eq(timeEntries.userId, userId),
          gte(timeEntries.date, startDate),
          lte(timeEntries.date, endDate)
        )
      );
    return result.map(timeEntryFromSchema);
  }

  async createTimeEntry(
    c: Context<ContextType>,
    userId: number,
    projectId: number,
    date: string,
    hours: number,
    comment: string | null = null
  ): Promise<TimeEntry> {
    const result = await this.getDb(c)
      .insert(timeEntries)
      .values({
        userId,
        projectId,
        date,
        hours,
        comment,
      })
      .returning();
    return timeEntryFromSchema(result[0]);
  }

  async updateTimeEntry(
    c: Context<ContextType>,
    id: number,
    updates: Partial<Omit<TimeEntry, "id">>
  ): Promise<TimeEntry | null> {
    const updateData: {
      userId?: number;
      projectId?: number;
      date?: string;
      hours?: number;
      comment?: string | null;
    } = {};
    if (updates.user_id !== undefined) updateData.userId = updates.user_id;
    if (updates.project_id !== undefined)
      updateData.projectId = updates.project_id;
    if (updates.date !== undefined) updateData.date = updates.date;
    if (updates.hours !== undefined) updateData.hours = updates.hours;
    if (updates.comment !== undefined) updateData.comment = updates.comment;

    const result = await this.getDb(c)
      .update(timeEntries)
      .set(updateData)
      .where(eq(timeEntries.id, id))
      .returning();
    return result.length > 0 ? timeEntryFromSchema(result[0]) : null;
  }

  async deleteTimeEntry(c: Context<ContextType>, id: number): Promise<boolean> {
    const result = await this.getDb(c)
      .delete(timeEntries)
      .where(eq(timeEntries.id, id));
    return result.meta.changes > 0;
  }

  async deleteTimeEntriesByUserAndDateRange(
    c: Context<ContextType>,
    userId: number,
    startDate: string,
    endDate: string
  ): Promise<number> {
    const result = await this.getDb(c)
      .delete(timeEntries)
      .where(
        and(
          eq(timeEntries.userId, userId),
          gte(timeEntries.date, startDate),
          lte(timeEntries.date, endDate)
        )
      );
    return result.meta.changes;
  }

  // Calendar methods
  async findCalendarByDate(
    c: Context<ContextType>,
    date: string
  ): Promise<Calendar | null> {
    const result = await this.getDb(c)
      .select()
      .from(calendar)
      .where(eq(calendar.date, date))
      .limit(1);
    return result.length > 0 ? calendarFromSchema(result[0]) : null;
  }

  async findCalendarByDateRange(
    c: Context<ContextType>,
    startDate: string,
    endDate: string
  ): Promise<Calendar[]> {
    const result = await this.getDb(c)
      .select()
      .from(calendar)
      .where(and(gte(calendar.date, startDate), lte(calendar.date, endDate)));
    return result.map(calendarFromSchema);
  }

  async findCalendarByDayType(
    c: Context<ContextType>,
    dayType: "workday" | "public_holiday" | "weekend"
  ): Promise<Calendar[]> {
    const result = await this.getDb(c)
      .select()
      .from(calendar)
      .where(eq(calendar.dayType, dayType));
    return result.map(calendarFromSchema);
  }

  async findAllCalendar(c: Context<ContextType>): Promise<Calendar[]> {
    const result = await this.getDb(c).select().from(calendar);
    return result.map(calendarFromSchema);
  }

  async createCalendar(
    c: Context<ContextType>,
    date: string,
    dayType: "workday" | "public_holiday" | "weekend",
    updatedAt?: string
  ): Promise<Calendar> {
    const result = await this.getDb(c)
      .insert(calendar)
      .values({
        date,
        dayType,
        updatedAt: updatedAt || new Date().toISOString(),
      })
      .returning();
    return calendarFromSchema(result[0]);
  }

  async updateCalendar(
    c: Context<ContextType>,
    id: number,
    updates: Partial<Omit<Calendar, "id">>
  ): Promise<Calendar | null> {
    const updateData: {
      date?: string;
      dayType?: "workday" | "public_holiday" | "weekend";
      updatedAt?: string;
    } = {};
    if (updates.date !== undefined) updateData.date = updates.date;
    if (updates.day_type !== undefined) updateData.dayType = updates.day_type;
    if (updates.updated_at !== undefined)
      updateData.updatedAt = updates.updated_at;

    const result = await this.getDb(c)
      .update(calendar)
      .set(updateData)
      .where(eq(calendar.id, id))
      .returning();
    return result.length > 0 ? calendarFromSchema(result[0]) : null;
  }

  async deleteCalendar(c: Context<ContextType>, id: number): Promise<boolean> {
    const result = await this.getDb(c)
      .delete(calendar)
      .where(eq(calendar.id, id));
    return result.meta.changes > 0;
  }

  // Sessions methods
  async findSessionById(
    c: Context<ContextType>,
    sessionId: string
  ): Promise<Session | null> {
    const result = await this.getDb(c)
      .select()
      .from(sessions)
      .where(eq(sessions.sessionId, sessionId))
      .limit(1);
    if (result.length === 0) return null;
    const session = sessionFromSchema(result[0]);
    // Check if expired
    if (session.expires_at < Date.now()) {
      await this.getDb(c)
        .delete(sessions)
        .where(eq(sessions.sessionId, sessionId));
      return null;
    }
    return session;
  }

  async findAllSessions(c: Context<ContextType>): Promise<Session[]> {
    // Filter out expired sessions
    const now = Date.now();
    await this.getDb(c).delete(sessions).where(lte(sessions.expiresAt, now));
    const result = await this.getDb(c).select().from(sessions);
    return result.map(sessionFromSchema);
  }

  // Join/Query methods
  async getUserProjects(
    c: Context<ContextType>,
    userId: number
  ): Promise<(Project & { suppressed: number })[]> {
    const result = await this.getDb(c)
      .select({
        id: projects.id,
        name: projects.name,
        suppressed: projectUsers.suppressed,
        color: projects.color,
        isSystem: projects.isSystem,
      })
      .from(projectUsers)
      .innerJoin(projects, eq(projectUsers.projectId, projects.id))
      .where(
        and(eq(projectUsers.userId, userId), eq(projectUsers.suppressed, false))
      );
    return result.map((row) => ({
      id: row.id,
      name: row.name,
      suppressed: row.suppressed ? 1 : 0,
      color: row.color,
      isSystem: row.isSystem ? 1 : 0,
    }));
  }

  async getProjectUsers(
    c: Context<ContextType>,
    projectId: number
  ): Promise<(User & { suppressed: number })[]> {
    const result = await this.getDb(c)
      .select({
        id: users.id,
        email: users.email,
        roles: users.roles,
        active: users.active,
        suppressed: projectUsers.suppressed,
      })
      .from(projectUsers)
      .innerJoin(users, eq(projectUsers.userId, users.id))
      .where(
        and(
          eq(projectUsers.projectId, projectId),
          eq(projectUsers.suppressed, false)
        )
      );
    return result.map((row) => ({
      id: row.id,
      email: row.email,
      roles: row.roles,
      active: row.active ? 1 : 0,
      suppressed: row.suppressed ? 1 : 0,
    }));
  }

  async getTimeEntriesWithDetails(
    c: Context<ContextType>,
    userId?: number,
    startDate?: string,
    endDate?: string
  ): Promise<
    (TimeEntry & {
      user: User;
      project: Project;
    })[]
  > {
    const baseQuery = this.getDb(c)
      .select({
        timeEntry: timeEntries,
        user: users,
        project: projects,
      })
      .from(timeEntries)
      .innerJoin(users, eq(timeEntries.userId, users.id))
      .innerJoin(projects, eq(timeEntries.projectId, projects.id));

    const conditions = [];
    if (userId) {
      conditions.push(eq(timeEntries.userId, userId));
    }
    if (startDate && endDate) {
      conditions.push(
        and(gte(timeEntries.date, startDate), lte(timeEntries.date, endDate))
      );
    }

    const result =
      conditions.length > 0
        ? await baseQuery.where(
            conditions.length === 1 ? conditions[0] : and(...conditions)
          )
        : await baseQuery;

    return result.map((row) => ({
      ...timeEntryFromSchema(row.timeEntry),
      user: userFromSchema(row.user),
      project: projectFromSchema(row.project),
    }));
  }
}

export const repo = new Database();
