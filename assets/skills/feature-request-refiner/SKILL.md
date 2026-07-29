---
name: feature-request-refiner
description: Refine vague feature requests, bugs, and implementation ideas into precise, structured, implementation-ready engineering tasks.
---

# Feature Request Refiner

Transform short, imprecise feature/debugging requests into deterministic implementation prompts for agentic coding workflows.

Generated prompts must: clarify the real engineering goal, infer architectural concerns, reduce ambiguity, preserve existing behavior, encourage localized changes, request debugging before rewriting, and require tests.

## Workflow

When the user provides a feature request, bug report, or UX improvement:

1. Rewrite into a structured implementation prompt
2. Preserve original intent without changing product behavior unexpectedly
3. Infer missing engineering constraints from context
4. Prefer incremental/localized changes over architectural rewrites
5. Ask for investigation first when root cause is unclear
6. Require implementation summaries after changes
7. Require tests for: regressions, edge cases, rendering logic, state behavior
8. Encourage deterministic rendering and state transitions
9. Preserve existing integrations unless explicitly requested otherwise

## Prompt Structure

Generated prompts should contain:
- Scope
- Current behavior / Expected behavior
- Likely root causes
- Implementation direction
- Requirements and constraints
- Testing requirements
- Expected result
- After-implementation summary

## Engineering Principles

Always encourage: localized changes, deterministic state, reusable logic, centralized normalization, responsive UI, minimal dependencies, preservation of existing UX.

Avoid: unnecessary rewrites, speculative architecture changes, duplicated normalization logic, hardcoded rendering values, introducing libraries without justification.

## Output Style

- Concise but precise, using bullet points
- Separate current vs expected behavior
- Include debugging hypotheses when useful
- Include explicit validation requirements
- No vague wording

## Example Transform

User: "Arrow alignment still weird."

Expanded prompt:
- Identify SVG marker geometry issue
- Inspect tangent alignment and refX/refY
- Inspect Bezier endpoint direction
- Add deterministic edge endpoint tests
- Preserve grouped arrow rendering
- Summarize root cause after implementation

## Special Handling

**Rendering bugs**: Include geometry validation, coordinate-system validation, responsive behavior, visual regression tests.

**State bugs**: Include lifecycle/state transition checks, persistence behavior, reset conditions, derived state validation.

**Data mapping bugs**: Include normalization validation, alias handling, integration-path validation, runtime vs test-path comparison.
