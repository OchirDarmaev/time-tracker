# 🚀 Project Architecture Overview

_A fast, minimal, scalable foundation for building from POC → MVP → Production_

This project is built to deliver **maximum development speed**, **excellent DX**, and **a simple, predictable architecture** that scales without increasing complexity.
Our core priorities:

- **Fast feature delivery**
- **Minimal infrastructure overhead**
- **Zero-bundle frontend where possible**
- **Cheap global deployment**
- **Clear, maintainable code structure**
- **One-command reproducible environments**

We achieve this with an **edge-native**, **SSR-first**, **HTML-driven** architecture.

---

## 🧩 Technology Stack

### **Frontend Rendering**

- **HTMX**
  Declarative UI interactions without client-side frameworks.
  Turns server routes into interactive components with minimal code.

- **Vite SSR Components**
  Enables small, typed UI components without introducing a SPA.
  Used only when needed — complements HTMX for reusable UI blocks.

- **TailwindCSS**
  Fast styling, predictable design system, no CSS architecture burden.

---

### **Backend / Runtime**

- **Hono**
  Ultra-fast, minimal, type-safe Edge framework.
  Clear routing, validation, and excellent DX.

- **Cloudflare Workers**
  Global, cheap, low-latency execution.
  Perfect for an SSR architecture with many small HTMX interactions.

- **Cloudflare D1 (initial DB)**
  Zero-config SQLite for POC/MVP, replaceable later if needed.

- **Vite + @cloudflare/vite-plugin**
  First-class Edge bundle handling.
  Ensures compatibility between Hono, Workers, and SSR components.

---

### **Infrastructure & Operations**

- **SST**
  One-command environments (dev/stage/prod).
  Simple deployments.
  Scales better than Wrangler for multi-service setups.
  Provides future teammates a predictable infra experience.

---

## 🛠 Why This Architecture Works

### **1. Fast Development**

HTMX + Hono eliminates SPA overhead:
no hydration, no routing framework, no global JS bundle.
Most features are “HTML in → HTML out,” which shortens development cycles.

### **2. Business Logic First**

With SSR-first and type-safe backend routes, we focus on:

- domain logic
- features
- user flows
  Not on build systems or client framework complexity.

### **3. Minimal Cost**

Cloudflare Workers + D1 provide near-zero operational cost and global scale from day one.

### **4. Predictable, Scalable Structure**

The stack naturally supports clear separation of:

```text
src/
  features/                     → main app logic, grouped by features
    auth/
      index.tsx                → Hono routes for auth
      auth-service.ts          → business logic (kebab-case for .ts files)
      types.ts                 → feature-specific types
      components/              → SSR UI components (PascalCase for .tsx files)
        AuthPage.tsx
      middleware.ts            → auth middleware

    projects/
      index.tsx                → Hono routes for projects
      project-service.ts       → business logic
      components/
        ProjectsListPage.tsx
        CreateProjectPage.tsx
        EditProjectPage.tsx

    reports/
      index.tsx
      components/
        ReportsPage.tsx

    dashboard/
      index.tsx
      components/
        DashboardPage.tsx

    # ... other features follow same pattern

  lib/                          → shared utilities
    components/                 → shared UI components (PascalCase)
      NavBar.tsx
    layouts/                   → layout components (PascalCase)
      AppLayout.tsx
      renderer.tsx
    services/                   → shared services (kebab-case)
      {service-name}.ts
    utils/                      → utility functions (kebab-case)
      date-utils.ts
    client.ts                   → Hono client
    models.ts                   → shared models

  static/                       → static assets
    style.css
    theme.js

public/                         → public static assets
sst.config.ts                   → infra entrypoint
vite.config.ts                  → Vite + Cloudflare config
```

**Naming Conventions:**

- **`.tsx` files**: PascalCase (e.g., `AuthPage.tsx`, `ProjectsList.tsx`)
- **`.ts` files**: kebab-case (e.g., `auth-service.ts`, `date-utils.ts`)

Vite SSR Components supplement HTMX when we need reusable or complex UI bits—without committing to a full SPA.

### **5. Future-proof Without Lock-in**

If needed, we can later swap:

- D1 → Turso / Neon
- HTMX templates → more SSR components
- Workers → router-based microservices
  with minimal architectural changes.

---

## 🎯 Summary

This repository is a **lean, high-DX platform** designed for rapid evolution with:

- simple mental models
- minimal code
- strong type safety
- edge-native performance
- low operational costs
- effortless onboarding for teammates

It follows a "**server-powered UI**" philosophy:
**small components, SSR everywhere, HTML as the API.**

A foundation for building fast — and staying fast.

---

## 📄 License

This project is licensed under the **GNU Affero General Public License v3.0 (AGPL-3.0)**.

This means:

- ✅ You are free to use, modify, and distribute this software
- ✅ You can use it for personal and commercial projects
- ⚠️ If you modify the software and run it on a server, you must make your source code available to users

**Commercial Licensing Available**

For commercial use that requires proprietary modifications or deployment without source code disclosure, commercial licenses are available. Please contact ochirdarmaev@gmail.com for commercial licensing inquiries.

See the [LICENSE](LICENSE) file for full details.
