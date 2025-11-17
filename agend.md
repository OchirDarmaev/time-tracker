# **AGENT.md — Architecture Guide for HTMX + Express + TypeScript**

## **1. Core Philosophy**

1. Server-driven UI.
2. Feature-first folder structure.
3. TypeScript functions return HTML strings (server components).
4. Minimal client JS.
5. Thin controllers → thick services → isolated data layer.
6. Fast SSR → fast UX.
7. DX-first: clarity > cleverness.

---

# **2. Project Structure (Feature-First)**

```text
/src
  /features
    /account
      /dashboard
        contract.ts
        router.ts
        /views
          entries_table.ts
          summary.ts
          time_tracking_page.ts
      /controller
      /model
      /service
      /views
        /components
        /pages
    /auth
      contract.ts
      router.ts
      /views
        /components
        /pages
        renderAuth.ts
    /root
      contract.ts
      router.ts
      /views
        /pages
        render-root.ts
  /shared
    /config
      database.ts
    /contracts
      html_response.ts
    /middleware
      auth_stub.ts
      isAuthContext.ts
    /models
      calendar.ts
      project_user.ts
      project.ts
      public_holiday.ts
      time_entry.ts
      user.ts
    /types
      session.d.ts
    /utils
      date_utils.ts
      html.ts
      layout.ts
      paths.ts
      validation.ts
      web_components.ts
    /views
      /components
        monthly_calendar_component.ts
        time_slider_component.ts
        time_summary_component.ts
      /layouts
        base.html
  /common
    /config
    /contracts
    /lib
    /middleware
    /models
    /types
    /utils
    /views
      /components
      /layouts
  /db
    schema.sql
  /styles
    input.css
  server.ts
  sandbox.ts
```

### **Rules**

* Each feature owns its **contract + router + views (pages + components)**.
* `/shared` contains **shared models, utilities, views, middleware, config, contracts, types** used across features.
* `/common` is reserved for **common layouts, common components, utilities** (currently minimal usage).
* No cross-feature imports of templates or internal services.
* Feature pages can use:

  * their own components
  * shared components
  * shared layouts
  * common components
  * common layouts
* Never import `/features/auth/...` inside `/features/account/...`.
* Features can have sub-features (e.g., `/account/dashboard/`).
* All database models are in `/shared/models/`.
* All shared utilities are in `/shared/utils/`.

---

# **3. View & Component Architecture**

### **Page templates (`views/pages/` or `views/*.ts`)**

TypeScript functions that return HTML strings.
Full HTML sections rendered via a layout.
Contain **composition only** — no business logic.

Example:

```typescript
export function renderUsersPage(users: User[]): string {
  return html`
    <h1>Users</h1>
    <table>
      ${users.map(u => renderUserRow(u)).join('')}
    </table>
    ${renderPagination(pagination)}
  `;
}
```

### **Feature components (`views/components/`)**

* TypeScript functions that return HTML strings.
* Specific to one feature.
* Can assume feature-specific view models.
* Encapsulate markup for lists, rows, cards, forms.

### **Shared components (`/shared/views/components/`)**

* TypeScript functions that return HTML strings.
* Shared UI elements:
  monthly calendar, time slider, time summary, etc.
* Must accept **generic props** (no feature-specific assumptions).

### **Common components (`/common/views/components/`)**

* TypeScript functions that return HTML strings.
* Common UI elements (currently minimal usage):
  navbar, footer, flash messages, modal shell, pagination, table shell.
* Must accept **generic props** (no feature-specific assumptions).

### **Layouts (`/shared/views/layouts/` or `/common/views/layouts/`)**

* TypeScript functions or HTML files that define base frames:
  `base.html`, `auth.html`, `blank.html`.
* Currently using `/shared/views/layouts/base.html`.

---

# **4. Server-Side Logic Layering**

### **Router (Feature Router)**

* Uses `@ts-rest/express` for type-safe routing.
* Validate input (query params, body, params).
* Call models/services.
* Choose template/view function.
* Pass view model.
* Handle authentication/authorization checks.
* Return HTML strings or JSON responses.
* No business logic.

### **Contract (ts-rest Contract)**

* Defines API endpoints with Zod schemas.
* Type-safe request/response contracts.
* Located in feature folder: `contract.ts`.

### **Service (Feature Service - Optional)**

* All business logic (if needed).
* Combine data, apply rules, transformations.
* Independent of HTTP.
* Currently minimal usage - logic often in router.

### **Model / Repository (`/shared/models/`)**

* DB queries using `better-sqlite3`.
* All database models are in `/shared/models/`.
* No business decisions here.
* Pure data access layer.

---

# **5. Interaction Model (HTMX Only)**

HTMX handles:

* form submission
* partial updates
* pagination
* filtering
* CRUD interactions

Server is the **source of truth**.
HTML is the **projection of state**.

### **Allowed JS**

Only tiny enhancements:

* focus
* clipboard
* auto-resize
* simple event handlers

### **Forbidden JS**

* No client-side state management.
* No custom mini-frameworks.
* No DOM templating.
* No “React-like” reactivity.
* No building HTML strings manually.

---

# **6. Componentization Rules**

### **Split a component when:**

* reused in 2+ places
* page >150 LOC
* logical section is isolated
* UI responsibility is clear
* it simplifies reasoning
* it enables caching

### **Inline when:**

* tiny (1-3 lines)
* used once
* provides no structure benefit

---

# **7. Performance Guidelines**

* Enable gzip/br compression.
* Avoid sync Node APIs (block event loop).
* Use Promise.all for parallel fetching.
* Cache expensive HTML/data (memory or Redis).
* Optimize DB queries (no N+1).
* Use PM2/cluster for multi-core scalability.
* Keep client JS very small.

SSR is your performance superpower → protect it.

---

# **8. UX Guidelines**

* Fast TTFB & FCP (use SSR efficiently).
* Instant-feel interactions via HTMX partial updates.
* Use loading indicators or skeletons for long ops.
* Semantic, accessible HTML.
* Graceful error handling (no crashing templates).
* Responsive by default.

UX Rule: **fast, predictable, consistent**.

---

# **9. DX Guidelines**

* Code style: ESLint + Prettier.
* Types everywhere (DTOs, ViewModels).
* Small, focused PRs.
* Mandatory code reviews.
* Clear English docs.
* Local dev: nodemon, simple scripts.
* CI: lint → typecheck → tests.
* Structured logs (Pino/Winston).

DX Rule: **readability > abstraction**.

---

# **10. Hard Anti-Patterns**

* Business logic in routers (should be in services if complex).
* Feature mixing (cross imports between features).
* DOM manipulation to render HTML.
* Writing custom client rendering.
* Template logic explosion (no big if-trees).
* Hidden state stored in DOM.
* God components and mega-util files.
* Mixing SSR with reactive runtime JS.

---

# **11. When the Agent Generates Code**

Always:

* Place new features inside `/src/features/` folder.
* Create `contract.ts` and `router.ts` for each feature.
* Add UI via **views (pages + components)**.
* Keep routers thin, services smart (if needed).
* Use shared models from `/shared/models/`.
* Use shared utilities from `/shared/utils/`.
* Produce clean TypeScript view functions with small, reusable components.
* Prefer composition over duplication.
* Output English comments + docs.
* Use `@ts-rest/express` for type-safe routing.
* Follow snake_case for file names (e.g., `time_tracking_page.ts`).

# **12. Technology Stack**

* **Runtime**: Node.js 22+
* **Framework**: Express 5.1.0
* **Type Safety**: TypeScript 5.3+
* **API Contracts**: @ts-rest/express with Zod
* **Database**: SQLite (better-sqlite3)
* **Styling**: Tailwind CSS 4
* **UI Interactions**: HTMX
* **Package Manager**: Yarn v4
* **Session**: express-session
* **Build**: TypeScript compiler + PostCSS

# **13. Key Patterns**

* **Contracts**: Define endpoints with Zod schemas in `contract.ts`.
* **Routers**: Implement contract handlers in `router.ts` using `initServer()`.
* **Views**: TypeScript functions returning HTML strings.
* **Models**: Database access layer in `/shared/models/`.
* **Middleware**: Authentication/authorization in `/shared/middleware/`.
* **Layouts**: Base HTML templates in `/shared/views/layouts/`.
* **HTMX**: Server-driven partial updates, no client-side state management.
