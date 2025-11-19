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

-- Time entries for account-1@mail.com (first half of November 2025)
-- Delete existing seed data for account-1@mail.com for November 2025 to prevent duplicates
DELETE FROM time_entries
WHERE user_id IN (SELECT id FROM users WHERE email = 'account-1@mail.com')
  AND date >= '2025-11-01' AND date <= '2025-11-14';

-- November 3 (Monday) - Workday
INSERT INTO time_entries (user_id, project_id, date, hours, comment)
SELECT u.id, p.id, '2025-11-03', 5.0, 'Working on jupiter project features #development'
FROM users u, projects p
WHERE u.email = 'account-1@mail.com' AND p.name = 'jupiter';

INSERT INTO time_entries (user_id, project_id, date, hours, comment)
SELECT u.id, p.id, '2025-11-03', 3.0, 'Mars project code review #review'
FROM users u, projects p
WHERE u.email = 'account-1@mail.com' AND p.name = 'mars';

-- November 4 (Tuesday) - Workday
INSERT INTO time_entries (user_id, project_id, date, hours, comment)
SELECT u.id, p.id, '2025-11-04', 4.5, 'Jupiter project implementation'
FROM users u, projects p
WHERE u.email = 'account-1@mail.com' AND p.name = 'jupiter';

INSERT INTO time_entries (user_id, project_id, date, hours, comment)
SELECT u.id, p.id, '2025-11-04', 3.5, 'Mars project bug fixes #bugfix'
FROM users u, projects p
WHERE u.email = 'account-1@mail.com' AND p.name = 'mars';

-- November 5 (Wednesday) - Workday
INSERT INTO time_entries (user_id, project_id, date, hours, comment)
SELECT u.id, p.id, '2025-11-05', 8.0, 'Full day on jupiter project #development'
FROM users u, projects p
WHERE u.email = 'account-1@mail.com' AND p.name = 'jupiter';

-- November 6 (Thursday) - Workday
INSERT INTO time_entries (user_id, project_id, date, hours, comment)
SELECT u.id, p.id, '2025-11-06', 3.0, 'Jupiter project meetings'
FROM users u, projects p
WHERE u.email = 'account-1@mail.com' AND p.name = 'jupiter';

INSERT INTO time_entries (user_id, project_id, date, hours, comment)
SELECT u.id, p.id, '2025-11-06', 5.0, 'Mars project development #development'
FROM users u, projects p
WHERE u.email = 'account-1@mail.com' AND p.name = 'mars';

-- November 7 (Friday) - Workday
INSERT INTO time_entries (user_id, project_id, date, hours, comment)
SELECT u.id, p.id, '2025-11-07', 2.5, 'Jupiter project documentation'
FROM users u, projects p
WHERE u.email = 'account-1@mail.com' AND p.name = 'jupiter';

INSERT INTO time_entries (user_id, project_id, date, hours, comment)
SELECT u.id, p.id, '2025-11-07', 5.5, 'Mars project testing and deployment #testing'
FROM users u, projects p
WHERE u.email = 'account-1@mail.com' AND p.name = 'mars';

-- November 10 (Monday) - Workday
INSERT INTO time_entries (user_id, project_id, date, hours, comment)
SELECT u.id, p.id, '2025-11-10', 6.0, 'Jupiter project new features #development'
FROM users u, projects p
WHERE u.email = 'account-1@mail.com' AND p.name = 'jupiter';

INSERT INTO time_entries (user_id, project_id, date, hours, comment)
SELECT u.id, p.id, '2025-11-10', 2.0, 'Mars project maintenance'
FROM users u, projects p
WHERE u.email = 'account-1@mail.com' AND p.name = 'mars';

-- November 11 (Tuesday) - Workday
INSERT INTO time_entries (user_id, project_id, date, hours, comment)
SELECT u.id, p.id, '2025-11-11', 4.0, 'Jupiter project refactoring #refactoring'
FROM users u, projects p
WHERE u.email = 'account-1@mail.com' AND p.name = 'jupiter';

INSERT INTO time_entries (user_id, project_id, date, hours, comment)
SELECT u.id, p.id, '2025-11-11', 4.0, 'Mars project feature development #development'
FROM users u, projects p
WHERE u.email = 'account-1@mail.com' AND p.name = 'mars';

-- November 12 (Wednesday) - Workday
INSERT INTO time_entries (user_id, project_id, date, hours, comment)
SELECT u.id, p.id, '2025-11-12', 7.5, 'Jupiter project implementation and testing'
FROM users u, projects p
WHERE u.email = 'account-1@mail.com' AND p.name = 'jupiter';

INSERT INTO time_entries (user_id, project_id, date, hours, comment)
SELECT u.id, p.id, '2025-11-12', 0.5, 'Quick mars project fix'
FROM users u, projects p
WHERE u.email = 'account-1@mail.com' AND p.name = 'mars';

-- November 13 (Thursday) - Workday
INSERT INTO time_entries (user_id, project_id, date, hours, comment)
SELECT u.id, p.id, '2025-11-13', 3.5, 'Jupiter project code review #review'
FROM users u, projects p
WHERE u.email = 'account-1@mail.com' AND p.name = 'jupiter';

INSERT INTO time_entries (user_id, project_id, date, hours, comment)
SELECT u.id, p.id, '2025-11-13', 4.5, 'Mars project new module development #development'
FROM users u, projects p
WHERE u.email = 'account-1@mail.com' AND p.name = 'mars';

-- November 14 (Friday) - Public Holiday
INSERT INTO time_entries (user_id, project_id, date, hours, comment)
SELECT u.id, p.id, '2025-11-14', 8.0, 'Public holiday work'
FROM users u, projects p
WHERE u.email = 'account-1@mail.com' AND p.name = 'Holiday';

