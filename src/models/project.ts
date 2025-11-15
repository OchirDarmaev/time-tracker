import { db } from '../config/database.js';

export interface Project {
  id: number;
  name: string;
  suppressed: boolean;
}

export const projectModel = {
  getAll(includeSuppressed = false): Project[] {
    if (includeSuppressed) {
      return db.prepare('SELECT * FROM projects ORDER BY name').all() as Project[];
    }
    return db.prepare('SELECT * FROM projects WHERE suppressed = 0 ORDER BY name').all() as Project[];
  },

  getById(id: number): Project | undefined {
    return db.prepare('SELECT * FROM projects WHERE id = ?').get(id) as Project | undefined;
  },

  create(name: string): Project {
    const result = db.prepare('INSERT INTO projects (name, suppressed) VALUES (?, 0)').run(name);
    return this.getById(result.lastInsertRowid as number)!;
  },

  update(id: number, name: string): Project | undefined {
    db.prepare('UPDATE projects SET name = ? WHERE id = ?').run(name, id);
    return this.getById(id);
  },

  toggleSuppress(id: number): Project | undefined {
    db.prepare('UPDATE projects SET suppressed = NOT suppressed WHERE id = ?').run(id);
    return this.getById(id);
  },

  getByUserId(userId: number, includeSuppressed = false): Project[] {
    if (includeSuppressed) {
      return db.prepare(`
        SELECT p.* FROM projects p
        INNER JOIN project_users pu ON p.id = pu.project_id
        WHERE pu.user_id = ? AND pu.suppressed = 0
        ORDER BY p.name
      `).all(userId) as Project[];
    }
    return db.prepare(`
      SELECT p.* FROM projects p
      INNER JOIN project_users pu ON p.id = pu.project_id
      WHERE pu.user_id = ? AND pu.suppressed = 0 AND p.suppressed = 0
      ORDER BY p.name
    `).all(userId) as Project[];
  },
};

