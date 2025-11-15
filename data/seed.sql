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

