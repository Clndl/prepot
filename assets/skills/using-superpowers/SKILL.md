---
name: using-superpowers
description: Use when starting any conversation - how to find and reach for the right skill proactively, without over-loading.
---

<SUBAGENT-STOP>
If you were dispatched as a subagent to execute a specific task, skip this skill.
</SUBAGENT-STOP>

# Using Skills

## The Rule

Reach for a skill **proactively when the task matches its trigger** in the map below — that
is the point of having skills. But invoke the *right* one, not every plausible one "just in
case". Over-invoking wastes tokens; under-invoking wastes the skills. Use the map to route.

No ceremony: don't narrate "Announce: using X", and only create per-step todos when a skill
genuinely has a multi-step checklist worth tracking.

## Instruction Priority

1. **User instructions** (CLAUDE.md, AGENTS.md, RULES.md, direct requests) — highest.
2. **Skills** — override default behavior where they conflict.
3. **Default system prompt** — lowest.

If user instructions conflict with a skill, follow the user.

## Skill Map (route to these proactively)

**Process — decide *how* to approach (use first):**
| Trigger | Skill |
|---|---|
| New / ambiguous feature, design with trade-offs | `brainstorming` |
| Non-trivial implementation needs a plan | `implementation-plan` |
| Execute an approved plan in a separate session | `executing-plans` |
| Execute a plan task-by-task via fresh subagents | `subagent-driven-development` |
| 2+ independent tasks to run in parallel | `dispatching-parallel-agents` |
| Verify a change actually works | `verification-loop` |
| Processing code-review feedback | `receiving-code-review` |
| Long / multi-agent task needing context hand-off | `context-manager` |

**Implementation — guide execution:**
| Trigger | Skill |
|---|---|
| Language / framework / architecture / DB / API patterns | `patterns` |
| React component composition | `react-composition-patterns` |
| Web UI visual design / aesthetics / on-page SEO | `frontend-design` |
| Schema or data migration | `database-migrations` |
| Writing or improving docs | `documentation-expert` |

**Product / delivery:**
| Trigger | Skill |
|---|---|
| Backlog, stories, sprint planning | `backlog-agent` |
| Refine a vague request into a task | `feature-request-refiner` |
| Run an existing sprint | `executing-sprints` |
| Persist technical decisions across sessions | `project-memory` |
| Long-form articles / guides | `article-writing` |

Process skills run before implementation skills: "Let's build X" → `brainstorming` then the
relevant implementation skills; "fix this bug" → debug, then domain skills. Planning is
`implementation-plan` (conditional trigger; skips trivial/investigatory work).

## Exploration

Prefer the **codebase-memory-mcp** tools (`search_graph`, `trace_path`, `get_architecture`,
`search_code`, `get_code_snippet`) over broad grep/`Explore` fan-out when the repo is indexed —
the graph answers structural questions at a fraction of the token cost. Fall back to grep/glob
only when the index is unavailable or the query is trivial.

## Artifacts & output

An *artifact* is a standalone file you write for the user (report, analysis, plan, walkthrough,
task list, diff). Decide before writing:

- **Write an artifact for:** extensive reports / analysis summaries; tables, diagrams, or
  formatted data; information you'll update over time (task lists, logs); code changes presented
  as diffs.
- **Answer inline (no artifact) for:** simple one-off answers; asking a question or requesting
  input; anything that fits in a short paragraph. Scratch scripts / throwaway data go in `./tmp/`, never the chat.

After creating or updating an artifact, do **not** re-summarize its contents in your reply —
point the user to it and surface only the key open questions or decisions needing their input.
