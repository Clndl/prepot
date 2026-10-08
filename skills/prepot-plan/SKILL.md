---
name: prepot-plan
description: "Turns a non-trivial change into one approved plan, then executes and verifies it. Use before architectural, ambiguous, research-heavy, or multi-file work; when an idea needs brainstorming or a vague request needs refining first; or to execute an approved plan. Not for questions, trivial edits, or sprint planning."
---

# Implementation Plan

Lean by design: a plan is created **only when it earns its cost**, and it is a single readable
design doc — not a TDD micro-task script.

## When to plan (the gate)

Create a plan **only** if the request involves:

- Major architectural changes
- Extensive research to fulfill
- Significant decision-making or ambiguity
- A significant deviation from an existing approved plan
- Complex changes that are not just simple tweaks

## When NOT to plan

Skip planning and act directly when the request is:

- **Investigatory** — "explain how X works", "where do we do Y?", "why did Z happen?"
- **Trivial / one-off** — "format this as a table", "fix the alignment", "add a comment",
  "run this command", "fix this syntax error"
- **A minor follow-up** to an already-approved plan — "add a test for this", "use an enum",
  "plot the results"

If it does not warrant a plan, continue WITHOUT a plan and WITHOUT requesting review.

## Before the plan

Only when the request needs it:

- **New or ambiguous idea, real trade-offs** → [brainstorm the design](references/brainstorming.md)
  first; the agreed design feeds step 1.
- **Vague feature request or bug report** → [refine it](references/feature-request-refiner.md)
  into a precise task first.

## Workflow

### 1. Research
Investigate the codebase, dependencies, architecture, and implications. Prefer the
codebase knowledge graph (`prepot-memory`, graph mode) over broad grep when the repo is indexed. **Do not make source changes** during research
(creating/updating the plan artifact is fine).

### 2. Create the plan
Write `./tmp/implementation_plan.md` (working artifacts live in `./tmp/`) using
the [plan format](references/plan-format.md). Put open questions **inside the plan**, not via separate question prompts.

### 3. Obtain approval
**STOP and wait for the user's explicit approval before executing.** Do not re-summarize the
plan in your message — point the user to it and surface only key decisions/questions.

### 4. Execute
Once approved, create `./tmp/task.md` and work through it. If you hit issues needing
significant changes, update `implementation_plan.md` and request review again before continuing.

Pick the execution mode:

| Situation | Mode |
|---|---|
| Subagents available, mostly independent tasks | [Fresh subagent per task](references/subagent-driven-development.md), spec then quality review |
| No subagents, or tightly coupled tasks | [Execute inline](references/executing-plans.md) with review checkpoints |
| 2+ independent problems, no shared state | [Parallel agents](references/dispatching-parallel-agents.md) |

### 5. Verify
Run tests / build / lint to confirm the changes work (`prepot-verify` skill). Write
`./tmp/walkthrough.md` only when the user asks for one or the work spans sessions.

## Related skills

- `prepot-verify` — proof before claiming done (step 5).
- `prepot-review` — review the result, or process review feedback on it.
