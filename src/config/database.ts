import Database from 'better-sqlite3';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = join(__dirname, '../../data/timetrack.db');
export const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Run migrations
export function initializeDatabase() {
  const schemaPath = join(__dirname, '../db/schema.sql');
  const seedPath = join(__dirname, '../../data/seed.sql');
  
  const schema = readFileSync(schemaPath, 'utf-8');
  db.exec(schema);
  
  const seed = readFileSync(seedPath, 'utf-8');
  db.exec(seed);
}

