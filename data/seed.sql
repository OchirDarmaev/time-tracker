-- Seed data
-- Add users with their roles

-- Accounts
INSERT OR IGNORE INTO users (email, roles, active) 
VALUES ('account-1@mail.com', '["account"]', 1);

INSERT OR IGNORE INTO users (email, roles, active) 
VALUES ('account-2@mail.com', '["account"]', 1);

-- Office Manager (has both account and office-manager roles)
INSERT OR IGNORE INTO users (email, roles, active) 
VALUES ('office-manager@mail.com', '["account","office-manager"]', 1);

-- Admin
INSERT OR IGNORE INTO users (email, roles, active) 
VALUES ('admin@mail.com', '["admin"]', 1);

-- All roles user
INSERT OR IGNORE INTO users (email, roles, active) 
VALUES ('all-roles@mail.com', '["account","office-manager","admin"]', 1);

-- Projects
INSERT OR IGNORE INTO projects (name, suppressed) 
VALUES ('ovanti', 0);

INSERT OR IGNORE INTO projects (name, suppressed) 
VALUES ('generate', 0);

-- Assign projects to accounts
-- Assign ovanti and generate to account-1@mail.com
INSERT OR IGNORE INTO project_users (user_id, project_id, suppressed)
SELECT u.id, p.id, 0
FROM users u, projects p
WHERE u.email = 'account-1@mail.com' AND p.name IN ('ovanti', 'generate');

-- Assign ovanti and generate to account-2@mail.com
INSERT OR IGNORE INTO project_users (user_id, project_id, suppressed)
SELECT u.id, p.id, 0
FROM users u, projects p
WHERE u.email = 'account-2@mail.com' AND p.name IN ('ovanti', 'generate');

-- Assign ovanti and generate to office-manager@mail.com (has account role)
INSERT OR IGNORE INTO project_users (user_id, project_id, suppressed)
SELECT u.id, p.id, 0
FROM users u, projects p
WHERE u.email = 'office-manager@mail.com' AND p.name IN ('ovanti', 'generate');

-- Assign ovanti and generate to all-roles@mail.com (has account role)
INSERT OR IGNORE INTO project_users (user_id, project_id, suppressed)
SELECT u.id, p.id, 0
FROM users u, projects p
WHERE u.email = 'all-roles@mail.com' AND p.name IN ('ovanti', 'generate');

