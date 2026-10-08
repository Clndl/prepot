# Definition of Done

The validation a story must pass for `Resolved -> Close`. Implemented does not mean done:
every category below must pass.

## Checklist

1. **Functional.** Acceptance criteria fully implemented; edge, error, empty, and loading
   states handled; retry behavior where required. Forbidden: partially working flows,
   placeholder logic, fake implementations, hidden runtime failures.
2. **Architecture.** Respects the project architecture, layering rules, `prepot-patterns`,
   ADR constraints, domain boundaries, and dependency conventions. No architecture drift,
   layer leakage, duplicated business logic, or inconsistent abstractions.
3. **Project memory.** If the implementation changes long-term behavior, project memory
   MUST be updated before closure. Update whichever is impacted: `architecture/`, `adr/`,
   `api/`, `glossary/`, `ux/`, `conventions/`, `feature-history/`.
4. **API**, if backend or contracts changed. Schema and validation consistency,
   authentication requirements, pagination/filter semantics, backward compatibility, error
   contracts.
5. **UX.** Responsive behavior, accessibility, loading/empty/error states, keyboard
   navigation, visual consistency, translation coverage. Forbidden: broken responsive
   layouts, inaccessible interactions, inconsistent UX patterns.
6. **Security.** Authorization and authentication flow, input validation, permission
   enforcement, sensitive data exposure, unsafe serialization, injection. Forbidden:
   frontend-only validation, bypassable authorization, exposed secrets.
7. **Performance.** No unnecessary rerenders, acceptable query complexity, optimized async
   flows, reasonable bundle impact, no obvious bottlenecks. Forbidden: unbounded loops,
   unnecessary recomputation, excessive network requests.
8. **Testing.** Unit tests, integration tests, regression coverage, critical-path
   validation. Tests cover expected behavior, failure behavior, and edge cases.
9. **Technical debt.** If the implementation introduced shortcuts, duplicated logic,
   temporary fixes, inconsistent patterns, weak typing, or missing abstractions: record it
   per [iteration.md](iteration.md) step 12 (acceptance criterion first, else a roadmap
   bullet under "Discovered Work"; a story file only if the current sprint needs it; at
   most 2 per closed story), link impacted systems, and document the rationale.
10. **Documentation.** README, API docs, architecture docs, ADRs, migration notes, and
    operational constraints updated where affected.
11. **Backlog.** Story status, dependency graph, and roadmap progression updated;
    discovered work recorded (acceptance criterion or roadmap bullet); blocked items
    reevaluated.

## Closure

Close ONLY if all categories pass, no unresolved blockers remain, project memory is
synchronized, acceptance criteria are confirmed, and discovered debt is recorded.
Follow-up detection is handled by [iteration.md](iteration.md) after closure.

If any validation fails: `Resolved -> Active`, or `Resolved -> Onhold` depending on blocker
severity. Never force-close invalid implementations.

## Done record

Every closed story produces:

```yaml
story_completion:
  story_id:
  completed_at:
  validated_by:
  impacted_systems:
  memory_updates:
  followup_items:
  debt_items:
  remaining_risks:
```
