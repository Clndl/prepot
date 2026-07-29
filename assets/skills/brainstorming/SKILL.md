---
name: brainstorming
description: Use before building a genuinely new or ambiguous feature - explores intent, requirements and design through dialogue, then hands off to implementation-plan. Skip for trivial or well-specified changes.
---

# Brainstorming Ideas Into Designs

Turn ideas into designs through natural collaborative dialogue, then hand off to planning.

## When to brainstorm

Use this when the request is a **new feature, an ambiguous goal, or a design with real
trade-offs**. Skip it for trivial, well-specified, or investigatory changes — those go
straight to implementation (or to the implementation-plan gate). Match the depth to the
ambiguity; don't force a design ceremony onto a one-line change.

## Process

1. **Explore context** — check relevant files, docs, recent commits.
2. **Clarify** — ask questions one at a time. Prefer multiple-choice (A/B/C) to make answering
   effortless; open-ended only when necessary. Focus on purpose, constraints, success criteria.
   While brainstorming, output questions only — no file edits or bash.
3. **Propose 2-3 approaches** — with trade-offs; lead with your recommendation and why.
4. **Present the design** — in sections scaled to complexity (a few sentences if simple, up to
   ~250 words if nuanced). Cover architecture, components, data flow, error handling, testing.
   Confirm each section before moving on.

## Key principles

- One question at a time. YAGNI ruthlessly. Explore alternatives before settling.
- Incremental validation: get agreement section by section. Go back and clarify when needed.

## Handoff

Once the design is agreed, the **only** follow-on skill is **implementation-plan** — and only
if its gate warrants a plan. For simple agreed designs, proceed directly to implementation.
