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
VALUES ('admin@mail.com', '["account", "admin"]', 1);

-- All roles user
INSERT OR IGNORE INTO users (email, roles, active) 
VALUES ('all-roles@mail.com', '["account", "office-manager","admin"]', 1);

-- Projects
INSERT OR IGNORE INTO projects (name, suppressed, color, isSystem) 
VALUES ('jupiter', 0, '#14b8a6', 0);

INSERT OR IGNORE INTO projects (name, suppressed, color, isSystem) 
VALUES ('mars', 0, '#06b6d4', 0);

-- Default vacation and holiday projects (system projects - cannot be removed/suppressed)
INSERT OR IGNORE INTO projects (name, suppressed, color, isSystem) 
VALUES ('Paid Vacation', 0, '#10b981', 1);

INSERT OR IGNORE INTO projects (name, suppressed, color, isSystem) 
VALUES ('Unpaid Vacation', 0, '#f59e0b', 1);

INSERT OR IGNORE INTO projects (name, suppressed, color, isSystem) 
VALUES ('Holiday', 0, '#ef4444', 1);

-- Assign projects to accounts
-- Assign jupiter and mars to account-1@mail.com
INSERT OR IGNORE INTO project_users (user_id, project_id, suppressed)
SELECT u.id, p.id, 0
FROM users u, projects p
WHERE u.email = 'account-1@mail.com' AND p.name IN ('jupiter', 'mars');

-- Assign jupiter and mars to account-2@mail.com
INSERT OR IGNORE INTO project_users (user_id, project_id, suppressed)
SELECT u.id, p.id, 0
FROM users u, projects p
WHERE u.email = 'account-2@mail.com' AND p.name IN ('jupiter', 'mars');

-- Assign jupiter and mars to office-manager@mail.com (has account role)
INSERT OR IGNORE INTO project_users (user_id, project_id, suppressed)
SELECT u.id, p.id, 0
FROM users u, projects p
WHERE u.email = 'office-manager@mail.com' AND p.name IN ('jupiter', 'mars');

-- Assign jupiter and mars to all-roles@mail.com (has account role)
INSERT OR IGNORE INTO project_users (user_id, project_id, suppressed)
SELECT u.id, p.id, 0
FROM users u, projects p
WHERE u.email = 'all-roles@mail.com' AND p.name IN ('jupiter', 'mars');

-- Assign jupiter and mars to admin@mail.com (has account and admin roles)
INSERT OR IGNORE INTO project_users (user_id, project_id, suppressed)
SELECT u.id, p.id, 0
FROM users u, projects p
WHERE u.email = 'admin@mail.com' AND p.name IN ('jupiter', 'mars');

-- Assign default vacation and holiday projects to all users
INSERT OR IGNORE INTO project_users (user_id, project_id, suppressed)
SELECT u.id, p.id, 0
FROM users u, projects p
WHERE p.name IN ('Paid Vacation', 'Unpaid Vacation', 'Holiday');

-- Calendar for November 2025 (arranged in ascending order)
INSERT OR IGNORE INTO calendar (date, day_type) 
VALUES ('2025-11-01', 'weekend'),
       ('2025-11-02', 'weekend'),
       ('2025-11-03', 'workday'),
       ('2025-11-04', 'workday'),
       ('2025-11-05', 'workday'),
       ('2025-11-06', 'workday'),
       ('2025-11-07', 'workday'),
       ('2025-11-08', 'weekend'),
       ('2025-11-09', 'weekend'),
       ('2025-11-10', 'workday'),
       ('2025-11-11', 'workday'),
       ('2025-11-12', 'workday'),
       ('2025-11-13', 'workday'),
       ('2025-11-14', 'public_holiday'),
       ('2025-11-15', 'weekend'),
       ('2025-11-16', 'weekend'),
       ('2025-11-17', 'workday'),
       ('2025-11-18', 'workday'),
       ('2025-11-19', 'workday'),
       ('2025-11-20', 'public_holiday'),
       ('2025-11-21', 'workday'),
       ('2025-11-22', 'weekend'),
       ('2025-11-23', 'weekend'),
       ('2025-11-24', 'workday'),
       ('2025-11-25', 'workday'),
       ('2025-11-26', 'workday'),
       ('2025-11-27', 'workday'),
       ('2025-11-28', 'workday'),
       ('2025-11-29', 'weekend'),
       ('2025-11-30', 'weekend');

