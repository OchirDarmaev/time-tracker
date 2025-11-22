import { mockDb, type Project, type User, type ProjectUser, type Calendar } from "../../lib/mock_db";

// Project Model - sync wrappers for admin (matching legacy interface)
export const projectModel = {
  getById: (id: number): Project | null => {
    // Note: This is sync, but mockDb is async. We'll need to handle this differently
    // For now, we'll make the router async and use await
    return null; // Will be handled in service
  },

  getAll: (includeSuppressed: boolean = false): Project[] => {
    return []; // Will be handled in service
  },

  create: (name: string, color: string, isSystem: boolean): Project => {
    throw new Error("Use async service method");
  },

  updateName: (id: number, name: string): void => {
    throw new Error("Use async service method");
  },

  updateColor: (id: number, color: string): void => {
    throw new Error("Use async service method");
  },

  updateSuppressed: (id: number, suppressed: boolean): void => {
    throw new Error("Use async service method");
  },

  toggleSuppress: (id: number): void => {
    throw new Error("Use async service method");
  },
};

// User Model
export const userModel = {
  getAll: (): User[] => {
    return []; // Will be handled in service
  },
};

// ProjectUser Model
export const projectUserModel = {
  getAll: (): ProjectUser[] => {
    return []; // Will be handled in service
  },

  getByUserAndProject: (userId: number, projectId: number): ProjectUser | null => {
    return null; // Will be handled in service
  },

  create: (userId: number, projectId: number): ProjectUser => {
    throw new Error("Use async service method");
  },

  toggleSuppressByUserAndProject: (userId: number, projectId: number): void => {
    throw new Error("Use async service method");
  },
};

// Calendar Model
export const calendarModel = {
  getByDate: (date: string): Calendar | null => {
    return null; // Will be handled in service
  },

  getByMonth: (month: string): Calendar[] => {
    return []; // Will be handled in service
  },

  create: (date: string, dayType: "workday" | "public_holiday" | "weekend"): Calendar => {
    throw new Error("Use async service method");
  },

  update: (date: string, dayType: "workday" | "public_holiday" | "weekend"): void => {
    throw new Error("Use async service method");
  },
};

export type { Project, User, ProjectUser, Calendar };

