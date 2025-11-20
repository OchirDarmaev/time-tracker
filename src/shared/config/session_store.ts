import { Store, SessionData } from "express-session";
import Database from "better-sqlite3";
import { db } from "./database.js";

export class SqliteSessionStore extends Store {
  private db: Database.Database;
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor() {
    super();
    this.db = db;
    this.initializeTable();
    // Clean up expired sessions every hour
    this.cleanupInterval = setInterval(
      () => {
        this.cleanupExpiredSessions();
      },
      60 * 60 * 1000
    );
  }

  private initializeTable() {
    // Table should already exist from schema, but ensure it's there
    this.db
      .prepare(
        `CREATE TABLE IF NOT EXISTS sessions (
      session_id TEXT PRIMARY KEY,
      data TEXT NOT NULL,
      expires_at INTEGER NOT NULL
    )`
      )
      .run();

    this.db
      .prepare("CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at)")
      .run();
  }

  private cleanupExpiredSessions() {
    const now = Date.now();
    this.db.prepare("DELETE FROM sessions WHERE expires_at < ?").run(now);
  }

  get(sid: string, callback: (err?: Error | null, session?: SessionData | null) => void): void {
    try {
      const row = this.db
        .prepare("SELECT data, expires_at FROM sessions WHERE session_id = ?")
        .get(sid) as { data: string; expires_at: number } | undefined;

      if (!row) {
        return callback(null, null);
      }

      // Check if session has expired
      if (row.expires_at < Date.now()) {
        this.destroy(sid, callback);
        return;
      }

      const session = JSON.parse(row.data);
      callback(null, session);
    } catch (error) {
      callback(error as Error);
    }
  }

  set(sid: string, session: SessionData, callback?: (err?: Error) => void): void {
    try {
      const expiresAt = session.cookie?.expires
        ? new Date(session.cookie.expires).getTime()
        : Date.now() + 24 * 60 * 60 * 1000; // Default 24 hours

      const data = JSON.stringify(session);

      this.db
        .prepare("INSERT OR REPLACE INTO sessions (session_id, data, expires_at) VALUES (?, ?, ?)")
        .run(sid, data, expiresAt);

      callback?.();
    } catch (error) {
      callback?.(error as Error);
    }
  }

  destroy(sid: string, callback?: (err?: Error) => void): void {
    try {
      this.db.prepare("DELETE FROM sessions WHERE session_id = ?").run(sid);
      callback?.();
    } catch (error) {
      callback?.(error as Error);
    }
  }

  all(callback: (err?: Error | null, obj?: { [sid: string]: SessionData } | null) => void): void {
    try {
      const rows = this.db
        .prepare("SELECT session_id, data FROM sessions WHERE expires_at > ?")
        .all(Date.now()) as Array<{ session_id: string; data: string }>;

      const sessions: { [sid: string]: SessionData } = {};
      for (const row of rows) {
        sessions[row.session_id] = JSON.parse(row.data);
      }

      callback(null, sessions);
    } catch (error) {
      callback(error as Error);
    }
  }

  length(callback: (err?: Error | null, length?: number) => void): void {
    try {
      const row = this.db
        .prepare("SELECT COUNT(*) as count FROM sessions WHERE expires_at > ?")
        .get(Date.now()) as { count: number } | undefined;

      callback(null, row?.count || 0);
    } catch (error) {
      callback(error as Error);
    }
  }

  clear(callback?: (err?: Error) => void): void {
    try {
      this.db.prepare("DELETE FROM sessions").run();
      callback?.();
    } catch (error) {
      callback?.(error as Error);
    }
  }

  touch(sid: string, session: SessionData, callback?: (err?: Error) => void): void {
    // Update the session's expiration time
    this.set(sid, session, callback);
  }

  // Cleanup on close
  close(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }
}
