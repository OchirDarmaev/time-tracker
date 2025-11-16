import { db } from "../config/database.js";

export interface Project {
  id: number;
  name: string;
  suppressed: boolean;
  color: string;
  isSystem: boolean;
}

interface ProjectRow {
  id: number;
  name: string;
  suppressed: number;
  color: string;
  isSystem: number;
}

function parseProject(row: ProjectRow): Project {
  return {
    id: row.id,
    name: row.name,
    suppressed: Boolean(row.suppressed),
    color: row.color,
    isSystem: Boolean(row.isSystem),
  };
}

export const projectModel = {
  getAll(includeSuppressed = false): Project[] {
    const rows = includeSuppressed
      ? (db.prepare("SELECT * FROM projects ORDER BY name").all() as ProjectRow[])
      : (db
          .prepare("SELECT * FROM projects WHERE suppressed = 0 ORDER BY name")
          .all() as ProjectRow[]);
    return rows.map(parseProject);
  },

  getById(id: number): Project | undefined {
    const row = db.prepare("SELECT * FROM projects WHERE id = ?").get(id) as ProjectRow | undefined;
    return row ? parseProject(row) : undefined;
  },

  create(name: string, color: string = "#14b8a6", isSystem: boolean = false): Project {
    const result = db
      .prepare("INSERT INTO projects (name, suppressed, color, isSystem) VALUES (?, 0, ?, ?)")
      .run(name, color, isSystem ? 1 : 0);
    return this.getById(result.lastInsertRowid as number)!;
  },

  update(id: number, name: string): Project | undefined {
    db.prepare("UPDATE projects SET name = ? WHERE id = ?").run(name, id);
    return this.getById(id);
  },

  toggleSuppress(id: number): Project | undefined {
    const project = this.getById(id);
    if (!project) return undefined;
    // Prevent suppression of system projects
    if (project.isSystem) {
      throw new Error("Cannot suppress system projects");
    }
    db.prepare("UPDATE projects SET suppressed = NOT suppressed WHERE id = ?").run(id);
    return this.getById(id);
  },

  getByUserId(userId: number, includeSuppressed = false): Project[] {
    const rows = includeSuppressed
      ? (db
          .prepare(
            `
        SELECT p.* FROM projects p
        INNER JOIN project_users pu ON p.id = pu.project_id
        WHERE pu.user_id = ? AND pu.suppressed = 0
        ORDER BY p.name
      `
          )
          .all(userId) as ProjectRow[])
      : (db
          .prepare(
            `
      SELECT p.* FROM projects p
      INNER JOIN project_users pu ON p.id = pu.project_id
      WHERE pu.user_id = ? AND pu.suppressed = 0 AND p.suppressed = 0
      ORDER BY p.name
    `
          )
          .all(userId) as ProjectRow[]);
    return rows.map(parseProject);
  },
};
