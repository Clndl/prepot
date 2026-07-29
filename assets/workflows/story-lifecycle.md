# Story Lifecycle Workflow

## Purpose

Define the authoritative lifecycle for backlog stories handled by AI-driven orchestration workflows.

This workflow guarantees:

- deterministic delivery flow
- architecture consistency
- backlog traceability
- validation discipline
- memory synchronization
- safe iteration loops

---

# Backlog Status Model

## Allowed States

| Status | Meaning |
|---|---|
| New | Newly created item |
| Active | Currently being implemented |
| Resolved | Implementation completed pending validation |
| Onhold | Blocked or paused |
| Close | Fully validated and completed |
| Removed | Cancelled or deprecated |

---

## Allowed Transitions

```txt
New -> Active
Active -> Resolved
Resolved -> Close

Active -> Onhold
Onhold -> Active

Any -> Removed
```

Invalid transitions are forbidden.

---

# Lifecycle Rules

## 1. New

### Definition

Story exists but implementation has not started.

### Requirements

Must contain:

- identifier
- title
- description
- acceptance criteria
- dependencies
- implementation notes
- risk level

### Allowed Actions

- refinement
- decomposition
- prioritization
- dependency analysis

### Forbidden

- implementation
- code generation
- status skipping

---

## 2. Active

### Definition

Story is currently assigned for implementation.

### Entry Conditions

Before entering `Active`:

- dependencies resolved
- architecture validated
- project memory loaded
- implementation scope clarified
- acceptance criteria finalized

### Mandatory Workflow

1. Load:
   - project-memory
   - patterns
   - relevant references

2. Analyze:
   - impacted systems
   - dependencies
   - conventions
   - ADRs
   - existing implementations

3. Implement incrementally.

4. Continuously validate:
   - tests
   - architecture
   - typing
   - UX consistency
   - API consistency

5. Note any discovered gaps for the iteration workflow to handle at story close.

### Active State Constraints

Must NOT:

- bypass architecture
- ignore failing tests
- create undocumented behavior
- introduce inconsistent APIs
- skip memory updates

---

## 3. Onhold

### Definition

Story temporarily blocked.

### Allowed Reasons

- unresolved dependency
- missing requirements
- architecture conflict
- infrastructure issue
- security concern
- external integration blocker

### Mandatory Actions

Document:

- blocker reason
- impacted systems
- unblock conditions
- dependency references

### Exit Rule

Story returns only to:

```txt
Onhold -> Active
```

after blocker resolution.

---

## 4. Resolved

### Definition

Implementation completed and awaiting validation.

### Entry Requirements

Before entering `Resolved`:

- implementation complete
- tests passing
- acceptance criteria implemented
- project memory updated
- technical debt identified
- documentation synchronized

### Mandatory Validation

Validate:

- functionality
- architecture consistency
- UX consistency
- accessibility
- performance impact
- API contracts
- security implications

### Required Outputs

- implementation summary
- impacted files
- memory updates
- generated debt stories
- generated follow-up stories

---

## 5. Close

### Definition

Story fully validated and accepted.

### Entry Requirements

Before entering `Close`:

- validation complete
- no unresolved blockers
- acceptance criteria confirmed
- memory synchronized
- backlog updated

### Finalization Tasks

Update:

- feature-history
- ADRs if needed
- roadmap progression
- dependency graph
- sprint metrics

### Post-Close Analysis

Evaluate:

- newly uncovered gaps
- UX inconsistencies
- architecture improvements
- future enhancements
- scalability concerns

Generate new backlog items if needed.

---

## 6. Removed

### Definition

Story intentionally cancelled or deprecated.

### Allowed Reasons

- feature no longer relevant
- replaced by another implementation
- architecture invalidation
- scope reduction
- duplicate functionality

### Mandatory Documentation

Document:

- removal reason
- replacement reference
- impacted dependencies
- migration implications

Never silently remove backlog items.

---

# Iteration Loop

## Standard Iteration

```txt
Select New story
    ↓
Move to Active
    ↓
Load project memory
    ↓
Implement
    ↓
Validate
    ↓
Move to Resolved
    ↓
Review + QA
    ↓
Move to Close
    ↓
Generate follow-up stories
```

---

# AI Orchestration Rules

## Before Implementation

Always:

- load project memory
- check ADRs
- verify conventions
- inspect dependency graph
- validate architecture alignment

---

## During Implementation

Continuously:

- update technical debt
- detect missing edge cases
- track architectural risks
- maintain consistency

---

## After Implementation

Always:

- update memory
- update feature history
- generate backlog improvements
- reevaluate roadmap priorities

---

# Technical Debt Rules

If implementation introduces:

- shortcuts
- duplication
- temporary fixes
- performance risks
- missing tests

then automatically:

1. create debt story
2. link impacted feature
3. estimate severity
4. prioritize appropriately

Debt must never remain implicit.

---

# Story Granularity Rules

Stories must:

- remain independently testable
- remain independently deployable when possible
- avoid cross-domain coupling
- avoid oversized implementation scope

Prefer:

```txt
small vertical slices
```

over:

```txt
large horizontal implementation phases
```

---

# Forbidden Behaviors

## Never

- skip statuses
- implement directly from vague requests
- close unvalidated stories
- ignore dependency chains
- bypass project memory
- silently change architecture
- silently modify APIs
- lose implementation history

---

# Success Criteria

The workflow is successful when:

- backlog remains coherent
- implementation remains traceable
- memory stays synchronized
- architecture remains stable
- technical debt remains visible
- stories evolve incrementally
- AI agents can continue autonomously with minimal ambiguity