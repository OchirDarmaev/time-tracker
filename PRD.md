# 📝 **Internal Time Reporting Tool — Groomed Specification (POC)**

## 🎯 **Purpose**

Build a simple internal tool that lets users track daily time across multiple projects, surface warnings when daily/monthly hours are insufficient, and allow office-managers/admins to review time reports.
Authentication is out of scope — the user role and user identity are chosen via “DATA stub” panel.

---

# 👥 **User Roles**

| Role               | Capabilities                                                                                    |
| ------------------ | ----------------------------------------------------------------------------------------------- |
| **user**         | Log hours, assign tags/projects, view own monthly/daily totals                                  |
| **Office-manager** | See aggregated reports across users/projects                                                  |
| **Admin**          | Add/remove/suppress projects, add/remove/suppress users in projects, view admin-level reports |

---

# 📌 **Core User Stories**

## 👤 **user Stories**

### 1. Track time per project

> **As a user**
> I need to track time for a working day across multiple projects
> **so that** I can reach 8 hours total per day.

**Acceptance Criteria:**

* user can enter entries like:

  * Project: *jupiter*
  * Duration: *0.5 h* (or 30 min)
  * Comment/tags: `#infra #setup`
* user can add multiple entries per day.
* UI shows running total for the selected day.

> **As a user**
> When I track time
> I want to see all days of current month with with hours in one row view

> **As a user**
> When I track time
> I want to easy navigate to day in range of month with one click

> **As a user**
> When I track time
> I want to see status of full filling of each day with hours



---

### 2. Tag activities per project

> **As a user**
> When I track time, I need tags to associate activity to project
> **so that** activities are categorized.

**Acceptance Criteria:**

* Comment field supports hashtags (e.g., `#jupiter #meeting`).
* System extracts tags implicitly from text or stores raw comment as-is.
* Tag filtering/searching is optional at POC stage.

---

### 3. Warning for insufficient time

> **As a user**
> I need to see a warning if my report does not cover 8 hours per day
> **or 8 × number of working days in the current month**
> **so that** I know where I am behind.

**Acceptance Criteria:**

* Daily total < 8 → red warning.
* Monthly total < (workingDays × 8) → yellow warning.
* Working days = weekdays minus weekends; holidays optional.

---

## 🧾 **Office-Manager Stories**

### 4. View reports per user/project

> **As an office-manager**
> I need to see the time tracking report of each user by project
> **so that** I understand project workloads and team utilization.

**Acceptance Criteria:**

* Select user → see breakdown by project/day.
* Select project → see list of users + hours.
* Export (optional in POC).

---

## 🛠️ **Admin Stories**

### 5. Manage projects

> **As an admin**
> I want to add/remove/mark-suppress projects
> **so that** users can track time against valid project list.

**Acceptance Criteria:**

* Create project
* Rename/edit
* Soft-suppress (hidden but history preserved)
* Hard delete (optional — POC: no)

---

### 6. Manage users in projects

> **As an admin**
> I want to add/remove/mark-suppress users **in projects**
> **so that** only relevant users appear for each project.

**Acceptance Criteria:**

* Assign user → project
* Remove user → project
* Mark user inactive (soft suppression)

---

### 7. View admin-level report

> **As an admin**
> I want to see the global system-wide reporting
> **so that** I can check utilization across all projects.

**Acceptance Criteria:**

* Aggregated view:

  * Projects → total hours by all users
  * users → total hours by project
* Possible CSV export

---

# 🧩 **Non-Functional Requirements**

* **No authentication** — use DATA stub panel:

  * current user selector

* **Database:** SQLite (Node native)

* **Stack:**

  * Node 22
  * Express
  * HTMX (no SPA)
  * Tailwind 4
  * TypeScript
  * yarn v4

* **Performance:** small dataset, no issues expected.

* **Data Integrity:** editing past days allowed; deletion optional.

---

# 🖥️ **MVP UI Structure**

## 🧪 Top bar: DATA Stub

* Current user (dropdown)

  * [user1@mail.com](mailto:user1@mail.com)
  * [user2@mail.com](mailto:user2@mail.com)
  * [user3@mail.com](mailto:user3@mail.com)
  * [office-manager@mail.com](mailto:office-manager@mail.com)
  * [admin@mail.com](mailto:admin@mail.com)
* Role selector: user / office-manager / admin
* Projects list: *jupiter, mars* (initial seed)

---

## 🧍 user UI

### Page: "My Time Tracking"

* Date picker
* Table of entries:

  * Project (select)
  * Hours (number or 0.5 steps)
  * Comment (with tags)
* Button: "Add Entry"
* Daily summary
* Warning indicators:

  * Daily hours < 8 → ❗ red
  * Monthly hours < target → ⚠️ yellow

---

## 🧑‍💼 Office-Manager UI

### Page: "Reports"

* Select user → Table by day and project
* Select Project → Table by user and day
* Summary totals

---

## 🛡️ Admin UI

### Page: "Manage Projects"

* List projects

  * Active / Suppressed
  * Button: Add project
  * Button: Suppress

### Page: "Manage users in Projects"

* For each project:

  * users assigned
  * Add/remove users

### Page: "System Reports"

* Global totals:

  * Hours per user
  * Hours per project
  * Hours per month

---

# 🗄️ **Data Model (SQLite)**

## **Tables**

### `users`

| id | email  | role                                | active  |
| -- | ------ | ----------------------------------- | ------- |
| PK | string | enum(user, office-manager, admin) | boolean |

---

### `projects`

| id | name | suppressed |
| -- | ---- | ---------- |
| PK | text | boolean    |

---

### `project_users`

(many-to-many)

| id | user_id | project_id | suppressed |
| -- | ------- | ---------- | ---------- |

---

### `time_entries`

| id | user_id | project_id | date | minutes | comment |
| PK | FK | FK | YYYY-MM-DD | int | text |

---

# 🔄 **Key Logic**

### Daily required hours

`requiredDaily = 8`

### Monthly required hours

```
requiredMonthly = workingDaysInMonth * 8
```

### Working days calculation

Count weekdays (Mon-Fri) of current month.

---

# 🚀 **MVP Deliverables**

1. DB schema + migrations
2. Express routes:

   * `/user/time`
   * `/manager/reports`
   * `/admin/projects`
   * `/admin/users-projects`
3. UI layouts with HTMX
4. Warnings logic
5. CRUD: projects, users-in-projects, time entries
6. Stub-panel to simulate auth

---

# 🔮 **Out of Scope (confirmed)**

* Real authentication / SSO
* Payroll integration
* Invoicing
* Mobile version
* Tag autocomplete
* API integrations
