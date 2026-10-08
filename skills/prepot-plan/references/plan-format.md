# Plan artifact formats

## `implementation_plan.md`

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

## `task.md`

```markdown
- [ ] uncompleted task
- [/] in-progress task
- [x] completed task
  - indented sub-items allowed
```

Mark `[/]` when starting an item, `[x]` when done. Keep it a living document.

## `walkthrough.md` (optional)

Only when the user asks for one or the work spans sessions: changes made, what was tested,
validation results. Update an existing walkthrough for related follow-ups rather than
creating a new one.
