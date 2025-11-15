-- Seed data
-- Add users with their roles

-- Workers
INSERT OR IGNORE INTO users (email, roles, active) 
VALUES ('worker-1@mail.com', '["worker"]', 1);

INSERT OR IGNORE INTO users (email, roles, active) 
VALUES ('worker-2@mail.com', '["worker"]', 1);

-- Office Manager (has both worker and office-manager roles)
INSERT OR IGNORE INTO users (email, roles, active) 
VALUES ('office-manager@mail.com', '["worker","office-manager"]', 1);

-- Admin
INSERT OR IGNORE INTO users (email, roles, active) 
VALUES ('admin@mail.com', '["admin"]', 1);

-- All roles user
INSERT OR IGNORE INTO users (email, roles, active) 
VALUES ('all-roles@mail.com', '["worker","office-manager","admin"]', 1);

-- Projects
INSERT OR IGNORE INTO projects (name, suppressed) 
VALUES ('ovanti', 0);

INSERT OR IGNORE INTO projects (name, suppressed) 
VALUES ('generate', 0);

-- Assign projects to workers
-- Assign ovanti and generate to worker-1@mail.com
INSERT OR IGNORE INTO project_users (user_id, project_id, suppressed)
SELECT u.id, p.id, 0
FROM users u, projects p
WHERE u.email = 'worker-1@mail.com' AND p.name IN ('ovanti', 'generate');

-- Assign ovanti and generate to worker-2@mail.com
INSERT OR IGNORE INTO project_users (user_id, project_id, suppressed)
SELECT u.id, p.id, 0
FROM users u, projects p
WHERE u.email = 'worker-2@mail.com' AND p.name IN ('ovanti', 'generate');

-- Assign ovanti and generate to office-manager@mail.com (has worker role)
INSERT OR IGNORE INTO project_users (user_id, project_id, suppressed)
SELECT u.id, p.id, 0
FROM users u, projects p
WHERE u.email = 'office-manager@mail.com' AND p.name IN ('ovanti', 'generate');

-- Assign ovanti and generate to all-roles@mail.com (has worker role)
INSERT OR IGNORE INTO project_users (user_id, project_id, suppressed)
SELECT u.id, p.id, 0
FROM users u, projects p
WHERE u.email = 'all-roles@mail.com' AND p.name IN ('ovanti', 'generate');

