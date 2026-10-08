---
name: prepot-backlog
description: "Runs backlog-driven delivery: stories with acceptance criteria, sprint planning, running a sprint, delivering one story, story statuses, and the definition of done. Use whenever work is tracked as backlog stories or sprints. Not for one-off changes outside a backlog (prepot-plan)."
---

# Backlog

Every implementation task originates from a backlog item, moves through an explicit status
model, and closes only against the definition of done.

## Modes

| Request | Mode | Read |
|---|---|---|
| Create or refine the backlog, write stories, plan a sprint | **shape** | [backlog-agent.md](references/backlog-agent.md) |
| Run an existing sprint end to end | **sprint** | [executing-sprints.md](references/executing-sprints.md) |
| Pick up and deliver one story | **story** | [iteration.md](references/iteration.md) |

Every mode applies the shared rules:

- [story-lifecycle.md](references/story-lifecycle.md) — allowed statuses and transitions.
- [done-definition.md](references/done-definition.md) — the checklist for `Resolved -> Close`.

## Rules

- Load only the mode's file plus the shared rule a step names; not everything up front.
- One story at a time, in dependency order. Never skip a status.
- A story closes only with verification evidence (`prepot-verify` skill).
- Discovered work becomes an acceptance criterion or a roadmap bullet first, a new story
  file only when the current sprint needs it.

## Done when

The mode's own completion criteria are met and the backlog files reflect every status change.
