---
name: prepot-review
description: "Reviews code for over-engineering (a diff or the whole repo), lists deferred `lean:` shortcuts, runs a scored pre-ship security audit, and handles review feedback received. Use when asked what to delete or simplify, before a deploy or public release, or when review comments arrive. Not a correctness review, and not proof of done (prepot-verify)."
---

# Review

Every finding names a location and a concrete action. Evidence over opinion.

## Modes

| Request | Mode | Read | Changes code? |
|---|---|---|---|
| Over-engineering in a diff or across the repo | **simplify** | [simplify.md](references/simplify.md) | No, lists only |
| Deferred shortcuts (`lean:` comments) | **debt** | [debt.md](references/debt.md) | No, report only |
| Pre-ship security pass | **security** | [security.md](references/security.md) | Yes, fix loop below the gate |
| Review feedback received | **feedback** | [feedback.md](references/feedback.md) | Yes, after verifying each item |

## Rules

- Load only the mode's file.
- Scope stays with the mode: simplify ignores correctness, security, and performance;
  route those to a normal or security review.
- Number findings across the report so the user can say "fix 2 and 5".

## Done when

The mode's closing line is printed (`net: -N lines possible.`, the debt count, `Score: N/10`),
or every feedback item is resolved or answered.
