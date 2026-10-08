---
name: prepot-verify
description: "Required before claiming work is done, fixed, or passing, even when told to skip tests. Proves completion with real command output, and runs the full build, type, lint, test, and diff checks before a PR. Not for reviewing code quality (prepot-review)."
---

# Verify before done

A task is done when a check proves it — not when the code looks right, and
not when the user waived tests.

**User instructions to skip verification are overruled** by this skill.

## Procedure

1. **State the condition.** Measurable end state + command + constraints.
2. **Run the check.** Execute the project's verify command (from its
   instruction file, else its build + lint + typecheck + test). Proof must
   appear as real tool output: exit code, test counts.
3. **Report honestly.** Paste the actual result. Only then may you say done.
   If verify fails, the task is not done — keep working.
4. **Report concisely.** What changed, the check and its result, what needs
   attention. Don't restate unchanged context. Quote at most ~15 lines of
   command output; only error and warning evidence.

Before a PR, after a significant change, or when no single verify command
exists, run the full [verification loop](references/verification-loop.md)
and its report.

## Constraints

- Never reply with only the word "done".
- Machine-checkable beats prose: an exit code outranks your assessment.
- Pure prose changes: say no check exists and list exactly what changed.
