import { repo, type Project } from "../../lib/repo";
import type { Context } from "hono";
import { ContextType } from "../..";

// Project Service
export const projectService = {
  async getById(c: Context<ContextType>, id: number): Promise<Project | null> {
    return await repo.findProjectById(c, id);
  },

  async getAll(
    c: Context<ContextType>,
    includeSuppressed: boolean = false
  ): Promise<Project[]> {
    const projects = await repo.findAllProjects(c);
    if (includeSuppressed) {
      return projects;
    }
    return projects.filter((p) => p.suppressed === 0);
  },

  async create(
    c: Context<ContextType>,
    name: string,
    color: string,
    isSystem: boolean = false
  ): Promise<Project> {
    // Check if project with same name exists
    const existing = await repo.findProjectByName(c, name);
    if (existing) {
      throw new Error(
        "UNIQUE constraint failed: Project with this name already exists"
      );
    }
    return await repo.createProject(c, name, 0, color, isSystem ? 1 : 0);
  },

  async updateName(
    c: Context<ContextType>,
    id: number,
    name: string
  ): Promise<void> {
    const project = await repo.findProjectById(c, id);
    if (!project) {
      throw new Error("Project not found");
    }
    if (project.isSystem) {
      throw new Error("Cannot modify system projects");
    }
    // Check if another project with same name exists
    const existing = await repo.findProjectByName(c, name);
    if (existing && existing.id !== id) {
      throw new Error(
        "UNIQUE constraint failed: Project with this name already exists"
      );
    }
    await repo.updateProject(c, id, { name });
  },

  async updateColor(
    c: Context<ContextType>,
    id: number,
    color: string
  ): Promise<void> {
    const project = await repo.findProjectById(c, id);
    if (!project) {
      throw new Error("Project not found");
    }
    await repo.updateProject(c, id, { color });
  },

  async updateSuppressed(
    c: Context<ContextType>,
    id: number,
    suppressed: boolean
  ): Promise<void> {
    const project = await repo.findProjectById(c, id);
    if (!project) {
      throw new Error("Project not found");
    }
    if (project.isSystem) {
      throw new Error("Cannot suppress system projects");
    }
    await repo.updateProject(c, id, { suppressed: suppressed ? 1 : 0 });
  },

  async toggleSuppress(c: Context<ContextType>, id: number): Promise<void> {
    const project = await repo.findProjectById(c, id);
    if (!project) {
      throw new Error("Project not found");
    }
    if (project.isSystem) {
      throw new Error("Cannot suppress system projects");
    }
    await repo.updateProject(c, id, {
      suppressed: project.suppressed === 0 ? 1 : 0,
    });
  },
};
