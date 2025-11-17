import { db } from "@/shared/config/database.js";

export interface ProjectUser {
  id: number;
  user_id: number;
  project_id: number;
  suppressed: boolean;
}

export const projectUserModel = {
  getByProjectId(projectId: number, includeSuppressed = false): ProjectUser[] {
    if (includeSuppressed) {
      return db
        .prepare(
          `
        SELECT pu.* FROM project_users pu
        WHERE pu.project_id = ?
        ORDER BY pu.id
      `
        )
        .all(projectId) as ProjectUser[];
    }
    return db
      .prepare(
        `
      SELECT pu.* FROM project_users pu
      WHERE pu.project_id = ? AND pu.suppressed = 0
      ORDER BY pu.id
    `
      )
      .all(projectId) as ProjectUser[];
  },

  getByUserId(userId: number): ProjectUser[] {
    return db
      .prepare("SELECT * FROM project_users WHERE user_id = ? AND suppressed = 0")
      .all(userId) as ProjectUser[];
  },

  create(userId: number, projectId: number): ProjectUser {
    const result = db
      .prepare("INSERT INTO project_users (user_id, project_id, suppressed) VALUES (?, ?, 0)")
      .run(userId, projectId);
    return db
      .prepare("SELECT * FROM project_users WHERE id = ?")
      .get(result.lastInsertRowid as number) as ProjectUser;
  },

  delete(id: number): void {
    db.prepare("DELETE FROM project_users WHERE id = ?").run(id);
  },

  toggleSuppress(id: number): ProjectUser | undefined {
    db.prepare("UPDATE project_users SET suppressed = NOT suppressed WHERE id = ?").run(id);
    return db.prepare("SELECT * FROM project_users WHERE id = ?").get(id) as
      | ProjectUser
      | undefined;
  },
};
