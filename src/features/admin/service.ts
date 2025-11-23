import {
  mockDb,
  type Project,
  type User,
  type ProjectUser,
  type Calendar,
} from "../../lib/mock_db";

// Project Service
export const projectService = {
  async getById(id: number): Promise<Project | null> {
    return await mockDb.findProjectById(id);
  },

  async getAll(includeSuppressed: boolean = false): Promise<Project[]> {
    const projects = await mockDb.findAllProjects();
    if (includeSuppressed) {
      return projects;
    }
    return projects.filter((p) => p.suppressed === 0);
  },

  async create(
    name: string,
    color: string,
    isSystem: boolean = false
  ): Promise<Project> {
    // Check if project with same name exists
    const existing = await mockDb.findProjectByName(name);
    if (existing) {
      throw new Error(
        "UNIQUE constraint failed: Project with this name already exists"
      );
    }
    return await mockDb.createProject(name, 0, color, isSystem ? 1 : 0);
  },

  async updateName(id: number, name: string): Promise<void> {
    const project = await mockDb.findProjectById(id);
    if (!project) {
      throw new Error("Project not found");
    }
    if (project.isSystem) {
      throw new Error("Cannot modify system projects");
    }
    // Check if another project with same name exists
    const existing = await mockDb.findProjectByName(name);
    if (existing && existing.id !== id) {
      throw new Error(
        "UNIQUE constraint failed: Project with this name already exists"
      );
    }
    await mockDb.updateProject(id, { name });
  },

  async updateColor(id: number, color: string): Promise<void> {
    const project = await mockDb.findProjectById(id);
    if (!project) {
      throw new Error("Project not found");
    }
    await mockDb.updateProject(id, { color });
  },

  async updateSuppressed(id: number, suppressed: boolean): Promise<void> {
    const project = await mockDb.findProjectById(id);
    if (!project) {
      throw new Error("Project not found");
    }
    if (project.isSystem) {
      throw new Error("Cannot suppress system projects");
    }
    await mockDb.updateProject(id, { suppressed: suppressed ? 1 : 0 });
  },

  async toggleSuppress(id: number): Promise<void> {
    const project = await mockDb.findProjectById(id);
    if (!project) {
      throw new Error("Project not found");
    }
    if (project.isSystem) {
      throw new Error("Cannot suppress system projects");
    }
    await mockDb.updateProject(id, {
      suppressed: project.suppressed === 0 ? 1 : 0,
    });
  },
};

// User Service
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
