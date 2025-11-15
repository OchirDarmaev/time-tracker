# Internal Time Reporting Tool

A simple internal tool for tracking daily time across multiple projects with role-based access (Worker, Office-manager, Admin).

## Tech Stack

- Node.js 22
- Express
- HTMX
- Tailwind CSS 4
- TypeScript
- SQLite (better-sqlite3)
- Yarn v4

## Setup

1. Install dependencies:
```bash
yarn install
```

2. Run migrations and seed data:
```bash
yarn dev
```

The database will be initialized automatically on first run.

## Usage

1. Start the development server:
```bash
yarn dev
```

2. Open http://localhost:3000

3. Use the DATA stub panel at the top to select user and role (no real authentication).

## User Roles

- **Worker**: Track time, view own reports
- **Office-manager**: View aggregated reports across workers/projects
- **Admin**: Manage projects, assign workers, view system-wide reports

