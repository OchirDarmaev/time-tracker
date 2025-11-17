import { db } from "@/shared/config/database.js";

export type DayType = "workday" | "public_holiday" | "weekend";

export interface CalendarDay {
  id: number;
  date: string;
  day_type: DayType;
}

export const calendarModel = {
  getAll(): CalendarDay[] {
    return db.prepare("SELECT * FROM calendar ORDER BY date").all() as CalendarDay[];
  },

  getByDate(date: string): CalendarDay | undefined {
    return db.prepare("SELECT * FROM calendar WHERE date = ?").get(date) as CalendarDay | undefined;
  },

  getByMonth(month: string): CalendarDay[] {
    return db
      .prepare("SELECT * FROM calendar WHERE date LIKE ? ORDER BY date")
      .all(`${month}%`) as CalendarDay[];
  },

  getByDateRange(startDate: string, endDate: string): CalendarDay[] {
    return db
      .prepare("SELECT * FROM calendar WHERE date >= ? AND date <= ? ORDER BY date")
      .all(startDate, endDate) as CalendarDay[];
  },

  getByType(dayType: DayType): CalendarDay[] {
    return db
      .prepare("SELECT * FROM calendar WHERE day_type = ? ORDER BY date")
      .all(dayType) as CalendarDay[];
  },

  create(date: string, dayType: DayType): CalendarDay {
    const result = db
      .prepare("INSERT INTO calendar (date, day_type) VALUES (?, ?)")
      .run(date, dayType);
    return this.getById(result.lastInsertRowid as number)!;
  },

  update(date: string, dayType: DayType): CalendarDay | undefined {
    db.prepare("UPDATE calendar SET day_type = ?, updated_at = datetime('now') WHERE date = ?").run(
      dayType,
      date
    );
    return this.getByDate(date);
  },

  getById(id: number): CalendarDay | undefined {
    return db.prepare("SELECT * FROM calendar WHERE id = ?").get(id) as CalendarDay | undefined;
  },

  delete(id: number): void {
    db.prepare("DELETE FROM calendar WHERE id = ?").run(id);
  },

  deleteByDate(date: string): void {
    db.prepare("DELETE FROM calendar WHERE date = ?").run(date);
  },
};
