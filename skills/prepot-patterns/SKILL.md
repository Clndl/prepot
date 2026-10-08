---
name: prepot-patterns
description: "Applies the stack's language, framework, database, and infrastructure patterns. Use when implementing, refactoring, or designing code; building or polishing web UI; structuring React components; writing schema or data migrations; or adding a Spring Boot entity layer or a React feature or component."
---

# Patterns

## Workflow

1. Identify the stack the change touches (language, framework, database, infrastructure).
2. Load only the reference(s) for that stack, usually one or two. Never load them all.
3. Prefer existing project conventions over generic patterns; apply the smallest useful pattern.
4. Check the result for idiomatic usage, error handling, security, testability, and performance.

## References

- **Architecture:** [api-design](references/api-design-patterns.md)
- **Languages:** [java](references/java-patterns.md) · [kotlin](references/kotlin-patterns.md) · [nodejs-backend](references/nodejs-backend-patterns.md) · [python](references/python-patterns.md) · [rust](references/rust-patterns.md)
- **Frameworks:** [laravel](references/laravel-patterns.md) · [mcp-server](references/mcp-server-patterns.md) · [nextjs-turbopack](references/nextjs-turbopack-patterns.md) · [nuxt4](references/nuxt4-patterns.md) · [pytorch](references/pytorch-patterns.md) · [react](references/react-patterns.md) · [springboot](references/springboot-patterns.md) · [vite](references/vite-patterns.md)
- **React composition:** [react-composition](references/react-composition.md) (rule files in `references/react-composition/`)
- **Web UI design and on-page SEO:** [frontend-design](references/frontend-design.md)
- **Data and infrastructure:** [postgres](references/postgres-patterns.md) · [database-migrations](references/database-migrations.md) · [docker](references/docker-patterns.md)
- **Stack recipes**, for the matching stack only: [create-feature-layer](references/create-feature-layer.md) (Spring Boot entity, Model to Controller) · [create-ui-feature](references/create-ui-feature.md) (React/TS/MUI, Interface → Service → Page) · [create-component](references/create-component.md) (React/MUI component)

## Repository structure

When creating a project layout, default to shallow, role-based top-level directories:
`backend/`, `frontend/`, `shared/` for web projects; `core/`, `shared/` otherwise. No
`apps/` or `packages/` monorepo layout unless explicitly required, no apps nested in
wrapper directories, shared code only in `shared/`.

## Rules

- Do not override explicit user instructions.
- Do not introduce abstractions the project does not need, or mix framework conventions.
- Adapt to the current codebase; do not apply patterns mechanically.
- Preserve existing comments and docstrings unrelated to your change, unless the user says otherwise.

## Done when

The change follows the loaded reference(s) and the project's existing conventions, with no
mixed framework conventions.
