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
    users/
      routes.ts                → HTTP endpoints for this feature
      service.ts               → business logic & use-cases
      templates/               → SSR HTML + HTMX fragments
        profile.html.ts
      components/              → SSR UI components (tsx)
        user-card.tsx
      types.ts                 → feature-specific types & DTOs

    auth/
      routes.ts
      service.ts
      templates/
      components/
      types.ts

    billing/
      routes.ts
      service.ts
      templates/
      components/
      types.ts

  db/                           → schema, migrations, db client
  lib/                          → shared utilities (validation, helpers)
  middlewares/                  → auth, logging, security
  infrastructure/               → SST stacks, bindings, env configs
  types/                        → global/shared types

public/                         → static assets
sst.config.ts                   → infra entrypoint
vite.config.ts                  → Vite + Cloudflare config

```

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

It follows a “**server-powered UI**” philosophy:
**small components, SSR everywhere, HTML as the API.**

A foundation for building fast — and staying fast.
