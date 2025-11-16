# **Internal Time Reporting Tool — Groomed Specification (POC)**

## **Purpose**

Build a simple internal tool that lets users track daily time across multiple projects, surface warnings when daily/monthly hours are insufficient, and allow office-managers/admins to review time reports.
Authentication is out of scope — the user role and user identity are chosen via “DATA stub” panel.

---

 **User Roles**


| Role               | Capabilities                                                                                  |
| -------------------- | ----------------------------------------------------------------------------------------------- |
| **user**           | Log hours, assign tags/projects, view own monthly/daily totals                                |
| **Office-manager** | See aggregated reports across users/projects                                                  |
| **Admin**          | Add/remove/suppress projects, add/remove/suppress users in projects, view admin-level reports |

---

# **Core User Stories**

User stories have been split into separate feature files in the `/feature` directory:

## **User Stories**

* [Track time per project](./feature/track_time.feature) - Story 1
* [Tag activities per project](./feature/tag_activities.feature) - Story 2
* [Warning for insufficient time](./feature/time_warnings.feature) - Story 3

## **Office-Manager Stories**

* [View reports per user/project](./feature/view_reports.feature) - Story 4

## **Admin Stories**

* [Manage projects](./feature/manage_projects.feature) - Story 5
* [Manage users in projects](./feature/manage_project_users.feature) - Story 6
* [View admin-level report](./feature/admin_reports.feature) - Story 7

---

# **Non-Functional Requirements**

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


# 🗄️ **Data Model (SQLite)**

## **Tables**

### `users`


| id | email  | role                              | active  |
| ---- | -------- | ----------------------------------- | --------- |
| PK | string | enum(user, office-manager, admin) | boolean |

---

### `projects`


| id | name | suppressed |
| ---- | ------ | ------------ |
| PK | text | boolean    |

---

### `project_users`

(many-to-many)


| id | user_id | project_id | suppressed |
| ---- | --------- | ------------ | ------------ |

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
workingDaysInMonth = setedManualyByManager
requiredMonthly = workingDaysInMonth * 8
```

### Working days calculation

Provided by system

---

# 🚀 **MVP Deliverables**

1. DB schema + migrations
2. Express routes:

   * `/accont/dashboard`
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
