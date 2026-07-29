---
name: executing-sprints
description: Execute an existing sprint autonomously — stories one at a time in dependency order with lifecycle rules, verification, and sprint-close reporting. Not for backlog creation or sprint planning.
---

# Executing Sprints

Complete an already-defined sprint autonomously while preserving disciplined delivery.

Use when: a sprint file exists with implementation-ready stories.
Do NOT use to: create backlogs, plan sprints, audit scope, or execute stories outside the sprint.

## Required Inputs

Read before execution: project README, current backlog, project memory, the sprint file.
Typical paths: `README.md`, `.ai/backlog/`, `.ai/memory/`, `.ai/backlog/sprints/sprint-XX.md`

## Core Execution Flow

1. Select one eligible sprint story
2. Execute it fully
3. Verify it
4. Update backlog and memory where materially required
5. Continue to next eligible story
6. Stop only when sprint is complete or genuinely blocked

Do NOT treat the sprint as one large uncontrolled task.

## Story Selection

Process stories from the selected sprint only:
- Select highest-priority eligible story with no unresolved dependencies
- Respect dependency order declared in the sprint file
- Prefer `delivery` stories; select `enabler` only when it directly blocks delivery
- Do not execute discovery, governance, or debt stories unless user instructs otherwise

A story is eligible when: all dependencies resolved, acceptance criteria clear, it belongs to the active sprint, and it aligns with project conventions.

If no story is eligible: inspect for genuine blockers, do not invent foundational work, stop and report.

## Scope Control

- Do not create new foundational work unless it directly blocks the current story
- Create follow-up stories only if real, actionable, and not already covered
- Do not expand the sprint unless new work is essential for sprint acceptance
- Prefer deferring non-blocking concerns to future backlog items
- Do not replace implementation with documentation

## Vertical Slice Bias

Prefer the smallest coherent implementation that produces runnable working software.
Preserve a vertical flow: `data source → backend → frontend → verification`.
Avoid scaffold creation not consumed by the active story.

## Per-Story Lifecycle

1. Mark story as Active per story-lifecycle rules
2. Inspect: goal, dependencies, acceptance criteria, impacted memory
3. Create implementation plan only when complexity warrants it
4. Implement code
5. Add or update tests per done-definition
6. Run verification (tests, typecheck, lint, build)
7. Resolve or close per lifecycle rules
8. Update backlog status and dependency resolution
9. Update project memory only when materially affected
10. Create follow-up stories only when genuinely discovered

Use framework-specific workflows when applicable (React, Spring Boot, etc.).

## Verification

After each story and at sprint close:
- Run tests relevant to changed area
- Run available typecheck, lint, build checks
- Confirm acceptance criteria satisfied
- Confirm no dependency incorrectly marked complete
- Record results in final report

If verification fails: attempt repair within story scope. If unresolved, stop and report as blocker.

Do not claim completion without verification evidence.

## Sprint Completion

Complete only when:
1. All required sprint stories are resolved or closed
2. Sprint acceptance criteria explicitly validated
3. Verification run successfully
4. No unresolved blocker prevents the sprint goal
5. Backlog and memory updated where materially necessary

## Final Report Format

```md
## Sprint Executed
- Sprint: `Sprint XX - <name>`

## Stories Completed
- `<story-id>` - <short result>

## Sprint Acceptance
- [x] <criterion>

## Verification
- `<command>` - passed

## Follow-up Stories
- None (or: `<story-id>` - <reason>)

## Git-flow Commit Message
<message>

## PR Title
<title>
```

## Stop Conditions

Stop when: sprint acceptance satisfied, no eligible stories remain, unresolvable dependency, verification blocker, or scope expansion needed beyond sprint.

When stopping early, report: what completed, what remains, why stopped, exact blocker, next recommended action.

## Guardrails

Always: execute one story at a time, preserve dependency order, prefer implementation over documentation, keep scope bounded, verify before claiming done.

Never: re-plan the sprint without being asked, expand the sprint casually, execute non-sprint work, create speculative architecture, mark stories done without implementation and verification, claim completion with unverified acceptance criteria.