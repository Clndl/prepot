# Story Lifecycle

The authoritative status model for backlog stories.

## States and transitions

| Status | Meaning |
|---|---|
| New | Newly created item |
| Active | Currently being implemented |
| Resolved | Implementation completed, pending validation |
| Onhold | Blocked or paused |
| Close | Fully validated and completed |
| Removed | Cancelled or deprecated |

```txt
New -> Active -> Resolved -> Close
Active -> Onhold -> Active
Any -> Removed
```

Any other transition is forbidden. Never skip a status.

## New

Story exists; implementation has not started. It must contain: identifier, title,
description, acceptance criteria, dependencies, implementation notes, risk level.
Allowed: refinement, decomposition, prioritization, dependency analysis. Forbidden:
implementation and code generation.

## Active

**Entry:** dependencies resolved, scope clarified, acceptance criteria final, architecture
alignment checked.

1. Load only the context the story needs (see [iteration.md](iteration.md) step 3): the
   story file, directly relevant memory (ADRs, conventions), and the matching
   `prepot-patterns` references.
2. Analyze impacted systems, dependencies, conventions, ADRs, and existing implementations.
3. Implement incrementally, continuously validating tests, typing, architecture, and UX
   and API consistency. Track edge cases and architectural risks as you go.
4. Note discovered gaps for [iteration.md](iteration.md) to handle at story close.

Must not: bypass architecture, ignore failing tests, create undocumented behavior,
introduce inconsistent APIs, skip required memory updates.

## Onhold

Allowed reasons: unresolved dependency, missing requirements, architecture conflict,
infrastructure issue, security concern, external integration blocker.
Document the blocker reason, impacted systems, unblock conditions, and dependency
references. Exit only to `Active`, after the blocker is resolved.

## Resolved

**Entry:** implementation complete, tests passing, acceptance criteria implemented,
project memory updated where long-term behavior changed, technical debt identified,
documentation synchronized.

Validate functionality, architecture consistency, UX consistency, accessibility,
performance impact, API contracts, and security implications.

Outputs: implementation summary, impacted files, memory updates, and discovered work and
debt recorded per [iteration.md](iteration.md) step 12.

## Close

**Entry:** validation complete ([done-definition.md](done-definition.md)), no unresolved
blockers, acceptance criteria confirmed, memory synchronized, backlog updated.

Before closing, update where long-term behavior changed: memory, feature history, ADRs.
Then update roadmap progression, the dependency graph, and sprint metrics.

Evaluate newly uncovered gaps, UX inconsistencies, architecture improvements, future
enhancements, and scalability concerns. Record them per [iteration.md](iteration.md)
step 12: acceptance criterion first, else a roadmap bullet under "Discovered Work"; a
story file only if the current sprint needs it; at most 2 per closed story.

## Removed

Allowed reasons: no longer relevant, replaced by another implementation, architecture
invalidation, scope reduction, duplicate functionality. Document the removal reason,
replacement reference, impacted dependencies, and migration implications. Never silently
remove backlog items.

## Technical debt

Shortcuts, duplication, temporary fixes, performance risks, or missing tests introduced
by an implementation are recorded per [iteration.md](iteration.md) step 12, naming the
impacted feature and severity. Debt must never remain implicit.

## Never

Skip statuses, implement directly from vague requests, close unvalidated stories, ignore
dependency chains, bypass project memory, silently change architecture or APIs, lose
implementation history. Prefer small vertical slices over large horizontal phases.
