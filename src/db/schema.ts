import { sqliteTable, integer, text, real, index, uniqueIndex } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

// Users table
export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  email: text("email").notNull().unique(),
  roles: text("roles").notNull().default('["account"]'),
  active: integer("active", { mode: "boolean" }).notNull().default(true),
});

// Projects table
export const projects = sqliteTable("projects", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull().unique(),
  suppressed: integer("suppressed", { mode: "boolean" }).notNull().default(false),
  color: text("color").notNull().default("#14b8a6"),
  isSystem: integer("isSystem", { mode: "boolean" }).notNull().default(false),
});

// Project users (many-to-many)
export const projectUsers = sqliteTable(
  "project_users",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    projectId: integer("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    suppressed: integer("suppressed", { mode: "boolean" }).notNull().default(false),
  },
  (table) => [
    uniqueIndex("project_users_user_project_unique").on(
      table.userId,
      table.projectId
    ),
  ]
);

// Time entries
export const timeEntries = sqliteTable("time_entries", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  projectId: integer("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  date: text("date").notNull(),
  hours: real("hours").notNull(),
  comment: text("comment"),
});

// Calendar (workday, public_holiday, weekend)
export const calendar = sqliteTable("calendar", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  date: text("date").notNull().unique(),
  dayType: text("day_type")
    .notNull()
    .$type<"workday" | "public_holiday" | "weekend">(),
  updatedAt: text("updated_at")
    .notNull()
    .default(sql`(datetime('now'))`),
});

// Sessions table
export const sessions = sqliteTable("sessions", {
  sessionId: text("session_id").primaryKey(),
  data: text("data").notNull(),
  expiresAt: integer("expires_at").notNull(),
});

// Indexes
export const timeEntriesUserDateIdx = index("idx_time_entries_user_date").on(
  timeEntries.userId,
  timeEntries.date
);

export const timeEntriesProjectDateIdx = index("idx_time_entries_project_date").on(
  timeEntries.projectId,
  timeEntries.date
);

export const projectUsersUserProjectIdx = index("idx_project_users_user_project").on(
  projectUsers.userId,
  projectUsers.projectId
);

export const calendarDateIdx = index("idx_calendar_date").on(calendar.date);

export const calendarTypeIdx = index("idx_calendar_type").on(calendar.dayType);

export const sessionsExpiresAtIdx = index("idx_sessions_expires_at").on(sessions.expiresAt);

