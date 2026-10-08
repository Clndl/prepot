---
name: prepot-memory
description: "Keeps project knowledge across sessions: decisions, ADRs, conventions, API contracts, feature history, hand-offs between agents or sessions, and structural code queries through the codebase knowledge graph (callers, call chains, impact, dead code). Use when something should be recorded, handed off, or traced through the code."
---

# Memory

If knowledge matters for future work, it must live somewhere a future agent will find it.

## Modes

| Request | Mode | Read |
|---|---|---|
| Record or consult decisions, conventions, API contracts, feature history | **project** | [project-memory.md](references/project-memory.md) |
| Hand context to another agent or a later session | **handoff** | [context-manager.md](references/context-manager.md) |
| Structural code questions: callers, call chains, impact, dead code | **graph** | [codebase-memory.md](references/codebase-memory.md) |

## Rules

- Load only the mode's file.
- Record the *why*, not just the *what*; undocumented decisions do not exist.
- Prefer the knowledge graph over broad grep for structural questions when the repo is indexed.

## Done when

The memory files or hand-off summary reflect the change, or the graph query answered the question.
