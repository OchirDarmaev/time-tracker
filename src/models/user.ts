import { db } from '../config/database.js';

export type UserRole = 'worker' | 'office-manager' | 'admin';

export interface User {
  id: number;
  email: string;
  role: UserRole;
  active: boolean;
}

export const userModel = {
  getAll(): User[] {
    return db.prepare('SELECT * FROM users ORDER BY email').all() as User[];
  },

  getById(id: number): User | undefined {
    return db.prepare('SELECT * FROM users WHERE id = ?').get(id) as User | undefined;
  },

  getByEmail(email: string): User | undefined {
    return db.prepare('SELECT * FROM users WHERE email = ?').get(email) as User | undefined;
  },

  getWorkers(): User[] {
    return db.prepare("SELECT * FROM users WHERE role = 'worker' AND active = 1 ORDER BY email").all() as User[];
  },
};

