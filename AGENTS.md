# AI Agent Instructions

## Code Style & Naming Conventions

- **`.tsx` files**: Use **PascalCase** (e.g., `AuthPage.tsx`, `ProjectsList.tsx`, `CreateProject.tsx`)
- **`.ts` files**: Use **kebab-case** (e.g., `auth-service.ts`, `project-service.ts`, `date-utils.ts`)
- Use the generated Hono `client` helpers (e.g., `client.reports.$url()`) for navigation and API paths instead of hand-built strings so URLs stay type-safe.
- Prefer passing query parameters through the `$url({ query: ... })` helpers rather than manual interpolation to preserve typed contracts.

## File Structure

The codebase follows a feature-based structure:

```text
src/
  features/                    # Feature modules (one per domain)
    {feature-name}/
      index.tsx                # Hono routes for this feature
      {feature}-service.ts    # Business logic (if needed)
      types.ts                 # Feature-specific types (if needed)
      components/              # UI components (all .tsx files)
        {Feature}Page.tsx      # Main page components (PascalCase)
        {ComponentName}.tsx    # Other components (PascalCase)
      middleware.ts            # Feature-specific middleware (if needed)

  lib/                         # Shared utilities
    components/                # Shared UI components
      {ComponentName}.tsx      # PascalCase
    layouts/                  # Layout components
      {LayoutName}.tsx         # PascalCase
    services/                  # Shared services (if needed)
      {service-name}.ts        # kebab-case
    utils/                     # Utility functions
      {util-name}.ts           # kebab-case
    {util-name}.ts             # kebab-case for root-level utils
    client.ts                  # Hono client
    models.ts                  # Shared models

  static/                      # Static assets
    style.css
    theme.js
```

### Key Principles

1. **Features are self-contained**: Each feature has its own routes, services, components, and types
2. **Consistent naming**: `.tsx` = PascalCase, `.ts` = kebab-case
3. **Components in `components/`**: All UI components go in a `components/` subdirectory
4. **Routes in `index.tsx`**: Each feature's routes are defined in its `index.tsx`
5. **Shared code in `lib/`**: Reusable utilities, components, and services live in `lib/`

Keep these guidelines in mind for any new code you add or modify anywhere in this repository.
