---
name: implementation-plan
description: Use before a non-trivial implementation task to research, plan, get approval, then execute and verify. Skip for investigatory questions, trivial one-offs, and minor follow-ups.
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

## Workflow

### 1. Research
Investigate the codebase, dependencies, architecture, and implications. Prefer
`codebase-memory-mcp` tools over broad grep. **Do not make source changes** during research
(creating/updating the plan artifact is fine).

### 2. Create the plan
Write `./tmp/implementation_plan.md` (per RULES.md, working artifacts live in `./tmp/`) using
the format below. Put open questions **inside the plan**, not via separate question prompts.

### 3. Obtain approval
**STOP and wait for the user's explicit approval before executing.** Do not re-summarize the
plan in your message — point the user to it and surface only key decisions/questions.

### 4. Execute
Once approved, create `./tmp/task.md` and work through it. If you hit issues needing
significant changes, update `implementation_plan.md` and request review again before continuing.

### 5. Verify
Run tests / build / lint to confirm the changes work. Summarize in `./tmp/walkthrough.md`.

## `implementation_plan.md` format

Omit irrelevant sections.

```markdown
# [Goal Description]

Brief description of the problem, background context, and what the change accomplishes.

## User Review Required
Breaking changes or significant design decisions. Use GitHub alerts (> [!IMPORTANT] / [!WARNING] / [!CAUTION]).

## Open Questions
Clarifying/design questions that affect the plan. Use GitHub alerts to highlight critical ones.

## Proposed Changes
Group files by component, dependencies first, separated by horizontal rules.

### [Component Name]
Summary of what changes, by file, using status markers:

#### [MODIFY] [file basename](file:///absolute/path)
#### [NEW] [file basename](file:///absolute/path)
#### [DELETE] [file basename](file:///absolute/path)

## Verification Plan
### Automated Tests
- Exact commands you'll run.
### Manual Verification
- Steps the user performs (staging deploy, UI check, etc.).
```

## `task.md` format

```markdown
- [ ] uncompleted task
- [/] in-progress task
- [x] completed task
  - indented sub-items allowed
```

Mark `[/]` when starting an item, `[x]` when done. Keep it a living document.

## `walkthrough.md`
After completing work: changes made, what was tested, validation results. Update an existing
walkthrough for related follow-ups rather than creating a new one.

## Related skills

- Upstream: `brainstorming` hands off here once a design is agreed.
- Execution (step 4): `subagent-driven-development` (fresh subagent per task) or
  `executing-plans` (separate session). Both consume this plan.
- Verification (step 5): `verification-loop`; process review feedback with `receiving-code-review`.
