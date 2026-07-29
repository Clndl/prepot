# Definition of Done

## Purpose

Define the mandatory validation standard required before a backlog story can transition from:

```txt
Resolved -> Close
```

No story is considered complete unless every validation category passes.

---

# Core Principle

Implemented does not mean done.

A story is only complete when it is:

- functional
- validated
- maintainable
- documented
- consistent
- testable
- traceable

---

# Mandatory Completion Checklist

## 1. Functional Validation

### Requirements

- Acceptance criteria fully implemented
- Edge cases handled
- Error states handled
- Empty states handled
- Loading states handled
- Retry behavior implemented where required

### Forbidden

- partially working flows
- placeholder logic
- fake implementations
- hidden runtime failures

---

# 2. Architecture Validation

### Requirements

Implementation respects:

- project architecture
- layering rules
- patterns skill
- ADR constraints
- domain boundaries
- dependency conventions

### Verify

- no architecture drift
- no layer leakage
- no duplicated business logic
- no inconsistent abstractions

---

# 3. Project Memory Synchronization

### Mandatory Updates

Update if impacted:

- architecture/
- adr/
- api/
- glossary/
- ux/
- conventions/
- feature-history/

### Rules

If implementation changes long-term behavior:

project memory MUST be updated before closure.

---

# 4. API Validation

If backend or contracts changed:

Verify:

- schema consistency
- validation consistency
- authentication requirements
- pagination/filter semantics
- backward compatibility
- error contracts

---

# 5. UX Validation

### Requirements

Verify:

- responsive behavior
- accessibility
- loading states
- empty states
- error states
- keyboard navigation
- visual consistency
- translation coverage

### Forbidden

- broken responsive layouts
- inaccessible interactions
- inconsistent UX patterns

---

# 6. Security Validation

### Verify

- authorization checks
- authentication flow
- input validation
- permission enforcement
- sensitive data exposure
- unsafe serialization
- injection vulnerabilities

### Forbidden

- trusting frontend-only validation
- bypassable authorization
- exposed secrets

---

# 7. Performance Validation

### Verify

- no unnecessary rerenders
- acceptable query complexity
- optimized async flows
- reasonable bundle impact
- no obvious bottlenecks

### Forbidden

- unbounded loops
- unnecessary recomputation
- excessive network requests

---

# 8. Testing Validation

## Mandatory

Verify:

- unit tests
- integration tests
- regression coverage
- critical path validation

### Rules

Tests must validate:

- expected behavior
- failure behavior
- edge cases

---

# 9. Technical Debt Validation

## Evaluate

Did implementation introduce:

- shortcuts
- duplicated logic
- temporary fixes
- inconsistent patterns
- weak typing
- missing abstractions

If yes:

- create debt backlog item
- link impacted systems
- document rationale

---

# 10. Documentation Validation

Verify updates for:

- README
- API docs
- architecture docs
- ADRs
- migration notes
- operational constraints

---

# 11. Backlog Synchronization

Before closure:

Verify:

- story status updated
- dependency graph updated
- follow-up stories generated
- roadmap progression updated
- blocked items reevaluated

---

# Closure Requirements

A story may transition:

```txt
Resolved -> Close
```

ONLY if:

- all mandatory validations pass
- no unresolved blockers remain
- project memory synchronized
- acceptance criteria confirmed
- generated debt tracked

---

# Follow-Up Handling

Follow-up detection is handled by the iteration workflow after story closure.
Do not duplicate generation logic here.

---

# Failure Rules

If any validation fails:

```txt
Resolved -> Active
```

or:

```txt
Resolved -> Onhold
```

depending on blocker severity.

Never force-close invalid implementations.

---

# Done Artifact

Every closed story should produce:

```yaml
story_completion:
  story_id:
  completed_at:
  validated_by:
  impacted_systems:
  memory_updates:
  generated_followup_stories:
  generated_debt_items:
  remaining_risks:
```

---

# Success Criteria

A story is truly done when:

- behavior is correct
- architecture remains coherent
- UX is polished
- security is preserved
- tests validate confidence
- future agents understand the change
- technical debt is visible
- project memory remains accurate
```