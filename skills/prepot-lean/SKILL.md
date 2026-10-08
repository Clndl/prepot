---
name: prepot-lean
description: "Keeps code to the simplest solution that works: question the need (YAGNI), reuse what exists, prefer stdlib and native features over new code or dependencies. Use on any coding task (writing, fixing, refactoring, choosing a dependency) and when the user asks for the minimal solution or complains about bloat. Levels: lite, full, ultra. Not for non-coding requests."
---

# Lean

Lazy means efficient, not careless: the best code is the code never written.

Active for every coding response once triggered, until "stop lean" / "normal mode".
Default level: **full**. Switch: "lean lite" / "lean full" / "lean ultra".

## Understand first

The ladder shortens the solution, never the reading. Read the task and trace every file
the change touches, end to end, before picking a rung. A small diff in the wrong place
isn't lazy, it's a second bug.

**Bug fix = root cause, not symptom.** Before you edit, grep every caller of the function
you're about to touch. One guard in the shared function is a smaller diff than a guard in
every caller, and patching only the path the ticket names leaves sibling callers broken.

## The ladder

Stop at the first rung that holds; if two work, take the higher one:

1. **Does this need to exist at all?** Speculative need = skip it, say so in one line. (YAGNI)
2. **Already in this codebase?** Reuse the helper, util, type, or pattern. Look before you write.
3. **Stdlib does it?** Use it.
4. **Native platform feature covers it?** `<input type="date">` over a picker lib, CSS over JS, DB constraint over app code.
5. **Already-installed dependency solves it?** Use it. Never add a new one for what a few lines can do.
6. **Can it be one line?** One line.
7. **Only then:** the minimum code that works.

## Rules

- No unrequested abstractions: no interface with one implementation, no factory for one product, no config for a value that never changes.
- No boilerplate, no scaffolding "for later".
- Deletion over addition. Boring over clever. Fewest files possible.
- Complex request? Ship the lazy version and question it in the same response: "Did X; Y covers it. Need full X? Say so." Never stall on an answer you can default.
- Two stdlib options, same size? Take the one that's correct on edge cases.
- Mark a deliberate shortcut with a known ceiling (global lock, O(n²) scan, naive heuristic) with a `lean:` comment naming the ceiling and upgrade path (`# lean: global lock, per-account locks if throughput matters`). `prepot-review` debt mode collects them.

## Output

Code first, then at most three short lines: what was skipped, when to add it.
Pattern: `[code] → skipped: [X], add when [Y].` No essays or design notes unless the
user asked for them; then give them in full. If the explanation is longer than the code,
delete the explanation: a paragraph defending a simplification is complexity smuggled back
in as prose.

## Intensity

| Level | What changes |
|-------|------------|
| **lite** | Build what's asked, but name the lazier alternative in one line. User picks. |
| **full** | The ladder enforced. Stdlib and native first. Shortest diff, shortest explanation. Default. |
| **ultra** | Deletion before addition. Ship the one-liner and challenge the rest of the requirement in the same breath. |

Example, "Add a cache for these API responses", at full: "`@lru_cache(maxsize=1000)` on the
fetch function. Skipped custom cache class, add when lru_cache measurably falls short."

## When NOT to be lazy

- Never simplify away: input validation at trust boundaries, error handling that prevents
  data loss, security measures, accessibility basics, anything explicitly requested. User
  insists on the full version → build it, no re-arguing.
- Hardware drifts from the ideal: leave the calibration knob.
- Non-trivial logic (a branch, a loop, a parser, a money/security path) leaves ONE runnable
  check: an `assert`-based self-check or one small test file. No frameworks or fixtures
  unless asked. Trivial one-liners need no test.

Lean governs what you build, not how you talk. The level persists until changed or session end.

## Done when

The change works, its one check passes where logic is non-trivial, and nothing unrequested
was added.
