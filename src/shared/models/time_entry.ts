import { db } from "@/shared/config/database.js";

export interface TimeEntry {
  id: number;
  user_id: number;
  project_id: number;
  date: string;
  minutes: number;
  comment: string | null;
}

export const timeEntryModel = {
  getByUserIdAndDate(userId: number, date: string): TimeEntry[] {
    return db
      .prepare(
        `
      SELECT * FROM time_entries
      WHERE user_id = ? AND date = ?
      ORDER BY id
    `
      )
      .all(userId, date) as TimeEntry[];
  },

  getByUserIdAndMonth(userId: number, month: string): TimeEntry[] {
    return db
      .prepare(
        `
      SELECT * FROM time_entries
      WHERE user_id = ? AND date LIKE ?
      ORDER BY date, id
    `
      )
      .all(userId, `${month}%`) as TimeEntry[];
  },

  getByProjectId(projectId: number, startDate?: string, endDate?: string): TimeEntry[] {
    if (startDate && endDate) {
      return db
        .prepare(
          `
        SELECT * FROM time_entries
        WHERE project_id = ? AND date >= ? AND date <= ?
        ORDER BY date, user_id
      `
        )
        .all(projectId, startDate, endDate) as TimeEntry[];
    }
    return db
      .prepare(
        `
      SELECT * FROM time_entries
      WHERE project_id = ?
      ORDER BY date DESC, user_id
    `
      )
      .all(projectId) as TimeEntry[];
  },

  getByUserId(userId: number, startDate?: string, endDate?: string): TimeEntry[] {
    if (startDate && endDate) {
      return db
        .prepare(
          `
        SELECT * FROM time_entries
        WHERE user_id = ? AND date >= ? AND date <= ?
        ORDER BY date, project_id
      `
        )
        .all(userId, startDate, endDate) as TimeEntry[];
    }
    return db
      .prepare(
        `
      SELECT * FROM time_entries
      WHERE user_id = ?
      ORDER BY date DESC, project_id
    `
      )
      .all(userId) as TimeEntry[];
  },

  create(
    userId: number,
    projectId: number,
    date: string,
    minutes: number,
    comment: string | null
  ): TimeEntry {
    const result = db
      .prepare(
        `
      INSERT INTO time_entries (user_id, project_id, date, minutes, comment)
      VALUES (?, ?, ?, ?, ?)
    `
      )
      .run(userId, projectId, date, minutes, comment);
    return this.getById(result.lastInsertRowid as number)!;
  },

  getById(id: number): TimeEntry | undefined {
    return db.prepare("SELECT * FROM time_entries WHERE id = ?").get(id) as TimeEntry | undefined;
  },

  delete(id: number): void {
    db.prepare("DELETE FROM time_entries WHERE id = ?").run(id);
  },

  update(
    id: number,
    updates: {
      minutes?: number;
      comment?: string | null;
    }
  ): TimeEntry | undefined {
    const entry = this.getById(id);
    if (!entry) {
      return undefined;
    }

    const minutes = updates.minutes !== undefined ? updates.minutes : entry.minutes;
    const comment = updates.comment !== undefined ? updates.comment : entry.comment;

    db.prepare(
      `
      UPDATE time_entries
      SET minutes = ?, comment = ?
      WHERE id = ?
    `
    ).run(minutes, comment, id);

    return this.getById(id);
  },

  getTotalMinutesByUserAndDate(userId: number, date: string): number {
    const result = db
      .prepare(
        `
      SELECT COALESCE(SUM(minutes), 0) as total
      FROM time_entries
      WHERE user_id = ? AND date = ?
    `
      )
      .get(userId, date) as { total: number };
    return result.total;
  },

  getAll(startDate?: string, endDate?: string): TimeEntry[] {
    if (startDate && endDate) {
      return db
        .prepare(
          `
        SELECT * FROM time_entries
        WHERE date >= ? AND date <= ?
        ORDER BY date DESC, user_id
      `
        )
        .all(startDate, endDate) as TimeEntry[];
    }
    return db
      .prepare("SELECT * FROM time_entries ORDER BY date DESC, user_id")
      .all() as TimeEntry[];
  },
};
