# **AGENT.md — Architecture Guide for HTMX + Eta + Express + TypeScript**

## **1. Core Philosophy**

1. Server-driven UI.
2. Feature-first folder structure.
3. Eta = server components.
4. Minimal client JS.
5. Thin controllers → thick services → isolated data layer.
6. Fast SSR → fast UX.
7. DX-first: clarity > cleverness.

---

# **2. Project Structure (Feature-First)**

```
/src
  /users
    controller.ts
    service.ts
    model.ts
    /views
      pages/
      components/
  /orders
    controller.ts
    service.ts
    model.ts
    /views
      pages/
      components/
  /common
    /views
      layouts/
      components/
    /lib
      logger.ts
      http.ts
      validation.ts
  app.ts
```

### **Rules**

* Each domain owns its **controller + service + model + pages + components**.
* `/common` only contains **shared layouts, shared components, utilities**.
* No cross-domain imports of templates or internal services.
* Domain pages can use:

  * their own components
  * common components
  * common layouts
* Never import `/orders/...` inside `/users/...`.

---

# **3. View & Component Architecture (Eta)**

### **Page templates (`views/pages/`)**

Full HTML sections rendered via a layout.
Contain **composition only** — no business logic.

Example:

```eta
<%~ include('../../common/views/layouts/main', { title: 'Users' }) %>

<h1>Users</h1>

<table>
  <% for (const u of it.users) { %>
    <%~ include('../components/user-row', { user: u }) %>
  <% } %>
</table>

<%~ include('../../common/views/components/pagination', it.pagination) %>
```

### **Domain components (`views/components/`)**

* Specific to one domain.
* Can assume domain-specific view models.
* Encapsulate markup for lists, rows, cards, forms.

### **Common components (`/common/views/components/`)**

* Shared UI elements:
  navbar, footer, flash messages, modal shell, pagination, table shell.
* Must accept **generic props** (no domain-specific assumptions).

### **Layouts (`/common/views/layouts/`)**

* Define base frames:
  `main.eta`, `auth.eta`, `blank.eta`.

---

# **4. Server-Side Logic Layering**

### **Controller**

* Validate input.
* Call service.
* Choose template.
* Pass view model.
* No business logic.

### **Service (Domain)**

* All business logic.
* Combine data, apply rules, transformations.
* Independent of HTTP.

### **Model / Repository**

* DB queries or external APIs.
* No business decisions here.

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

* Business logic in controllers.
* Domain mixing (cross imports).
* DOM manipulation to render HTML.
* Writing custom client rendering.
* Template logic explosion (no big if-trees).
* Hidden state stored in DOM.
* God components and mega-util files.
* Mixing SSR with reactive runtime JS.

---

# **11. When the Agent Generates Code**

Always:

* Place new features inside their **domain folder**.
* Add UI via **pages + components**.
* Keep controllers thin, services smart.
* Produce clean Eta templates with small partials.
* Prefer composition over duplication.
* Output English comments + docs.