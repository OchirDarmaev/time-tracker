# AI Agent Instructions

- Use the generated Hono `client` helpers (e.g., `client.reports.$url()`) for navigation and API paths instead of hand-built strings so URLs stay type-safe.
- Prefer passing query parameters through the `$url({ query: ... })` helpers rather than manual interpolation to preserve typed contracts.
- For any `href`, `hx-get`, `hx-post`, `hx-delete`, or `hx-put` attributes, compose URLs from `client.*.$url()` (including query params) instead of string templates.
- Keep these guidelines in mind for any new code you add or modify anywhere in this repository.
