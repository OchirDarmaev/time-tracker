import { db } from "@/shared/config/database.js";

export interface PublicHoliday {
  id: number;
  date: string;
  name: string | null;
}

export const publicHolidayModel = {
  getAll(): PublicHoliday[] {
    return db.prepare("SELECT * FROM public_holidays ORDER BY date").all() as PublicHoliday[];
  },

  getByDate(date: string): PublicHoliday | undefined {
    return db.prepare("SELECT * FROM public_holidays WHERE date = ?").get(date) as
      | PublicHoliday
      | undefined;
  },

  getByMonth(month: string): PublicHoliday[] {
    return db
      .prepare("SELECT * FROM public_holidays WHERE date LIKE ? ORDER BY date")
      .all(`${month}%`) as PublicHoliday[];
  },

  getByDateRange(startDate: string, endDate: string): PublicHoliday[] {
    return db
      .prepare("SELECT * FROM public_holidays WHERE date >= ? AND date <= ? ORDER BY date")
      .all(startDate, endDate) as PublicHoliday[];
  },

  create(date: string, name: string | null = null): PublicHoliday {
    const result = db
      .prepare("INSERT INTO public_holidays (date, name) VALUES (?, ?)")
      .run(date, name);
    return this.getById(result.lastInsertRowid as number)!;
  },

  getById(id: number): PublicHoliday | undefined {
    return db.prepare("SELECT * FROM public_holidays WHERE id = ?").get(id) as
      | PublicHoliday
      | undefined;
  },

  delete(id: number): void {
    db.prepare("DELETE FROM public_holidays WHERE id = ?").run(id);
  },

  deleteByDate(date: string): void {
    db.prepare("DELETE FROM public_holidays WHERE date = ?").run(date);
  },
};
