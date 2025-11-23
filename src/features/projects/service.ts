import { mockDb, type Project } from "../../lib/mock_db";

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
