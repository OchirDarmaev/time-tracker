import { db } from "@/shared/config/database.js";

export type UserRole = "account" | "office-manager" | "admin";

export interface User {
  id: number;
  email: string;
  roles: UserRole[];
  active: boolean;
}

interface UserRow {
  id: number;
  email: string;
  roles: string;
  active: number;
}

function parseUser(row: UserRow): User {
  let roles: UserRole[] = [];
  try {
    roles = JSON.parse(row.roles);
  } catch {
    // Fallback: if roles is a single string (old format), convert it
    if (typeof row.roles === "string" && !row.roles.startsWith("[")) {
      roles = [row.roles as UserRole];
    }
  }
  return {
    id: row.id,
    email: row.email,
    roles,
    active: Boolean(row.active),
  };
}

export const userModel = {
  getAll(): User[] {
    const rows = db.prepare("SELECT * FROM users ORDER BY email").all() as UserRow[];
    return rows.map(parseUser);
  },

  getById(id: number): User | undefined {
    const row = db.prepare("SELECT * FROM users WHERE id = ?").get(id) as UserRow | undefined;
    return row ? parseUser(row) : undefined;
  },

  getByEmail(email: string): User | undefined {
    const row = db.prepare("SELECT * FROM users WHERE email = ?").get(email) as UserRow | undefined;
    return row ? parseUser(row) : undefined;
  },

  getAccounts(): User[] {
    const rows = db
      .prepare("SELECT * FROM users WHERE active = 1 ORDER BY email")
      .all() as UserRow[];
    return rows.map(parseUser).filter((user) => user.roles.includes("account"));
  },

  create(email: string, roles: UserRole[]): User {
    const rolesJson = JSON.stringify(roles);
    const result = db
      .prepare("INSERT INTO users (email, roles, active) VALUES (?, ?, 1)")
      .run(email, rolesJson);
    return this.getById(result.lastInsertRowid as number)!;
  },
};
