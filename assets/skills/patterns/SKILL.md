---
name: patterns
description: Use when implementing, reviewing, refactoring, or designing software using language, framework, architecture, database, API, and infrastructure patterns
---

# Patterns

## Type

Flexible.

## Purpose

Apply the correct software patterns based on the detected project stack and existing codebase conventions.

## When to use

Use this skill when the task involves:

- implementing code
- reviewing code
- refactoring code
- designing APIs
- changing architecture
- adding database migrations
- working with framework conventions
- enforcing language-specific standards
- improving backend, frontend, infrastructure, or persistence layers

## Workflow

1. Detect the project context:
  - language
  - framework
  - runtime
  - database
  - architecture style
  - package/build tools
  - test framework

2. Load only the relevant reference files.

3. Prefer existing project conventions over generic patterns.

4. Apply the smallest useful pattern.

5. Validate the result against:
  - maintainability
  - idiomatic usage
  - error handling
  - security
  - testability
  - performance

## Reference loading

Load references in this order:

1. Architecture reference
2. Language reference
3. Framework reference
4. Database reference
5. Infrastructure reference

## Reference loading rules

### Architecture

- `reference/api-design-patterns.md`

### Languages

- `reference/java-patterns.md`
- `reference/kotlin-patterns.md`
- `reference/nodejs-backend-patterns.md`
- `reference/python-patterns.md`
- `reference/rust-patterns.md`

### Frameworks

- `reference/laravel-patterns.md`
- `reference/mcp-server-patterns.md`
- `reference/nextjs-turbopack-patterns.md`
- `reference/nuxt4-patterns.md`
- `reference/pytorch-patterns.md`
- `reference/react-patterns.md`
- `reference/springboot-patterns.md`
- `reference/vite-patterns.md`

### Infrastructure

- `reference/postgres-patterns.md`

## Repository Structure

Default to shallow, role-based top-level directories:
- Web projects: `backend/`, `frontend/`, `shared/`
- Non-web projects: `core/`, `shared/`

Rules:
- Never use `apps/` or `packages/` monorepo layouts unless explicitly required
- Keep the top level flat — no nesting apps inside wrapper directories
- Shared code lives in `shared/`, not duplicated across packages

## Rules

- Do not load all references.
- Do not override explicit user instructions.
- Do not introduce abstractions that the project does not need.
- Do not mix framework conventions.
- Do not apply patterns mechanically.
- Always adapt to the current codebase.
- Preserve existing comments and docstrings unrelated to your change, unless the user says otherwise.