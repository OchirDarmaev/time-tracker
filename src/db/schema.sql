-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE,
    roles TEXT NOT NULL DEFAULT '["worker"]',
    active INTEGER NOT NULL DEFAULT 1
);

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    suppressed INTEGER NOT NULL DEFAULT 0
);

-- Project users (many-to-many)
CREATE TABLE IF NOT EXISTS project_users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    project_id INTEGER NOT NULL,
    suppressed INTEGER NOT NULL DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    UNIQUE(user_id, project_id)
);

-- Time entries
CREATE TABLE IF NOT EXISTS time_entries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    project_id INTEGER NOT NULL,
    date TEXT NOT NULL,
    minutes INTEGER NOT NULL,
    comment TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_time_entries_user_date ON time_entries(user_id, date);
CREATE INDEX IF NOT EXISTS idx_time_entries_project_date ON time_entries(project_id, date);
CREATE INDEX IF NOT EXISTS idx_project_users_user_project ON project_users(user_id, project_id);

