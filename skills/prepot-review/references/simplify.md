# Simplify review

Find unnecessary complexity in a diff, or across the whole repo when asked. One line per
finding: location, what to cut, what replaces it. The best outcome is getting shorter.

## Tags

- `delete:` dead code, unused flexibility, speculative feature. Replacement: nothing.
- `stdlib:` hand-rolled thing the standard library ships. Name the function.
- `native:` dependency or code doing what the platform already does. Name the feature.
- `reuse:` equivalent helper, util, or pattern already in this repo. Name the path.
- `yagni:` abstraction with one implementation, config nobody sets, layer with one caller.
- `shrink:` same logic, fewer lines. Show the shorter form.

## Diff

Format: `<N>. L<line>: <tag> <what>. <replacement>.`, or `<N>. <file>:L<line>: ...` for
multi-file diffs. End with `net: -<N> lines possible.`

❌ "This EmailValidator class might be more complex than necessary, have you
considered whether all these validation rules are needed at this stage?"

✅ `1. L12-38: stdlib: 27-line validator class. "@" in email, 1 line, real validation is the confirmation mail.`

✅ `2. L4: native: moment.js imported for one format call. Intl.DateTimeFormat, 0 deps.`

✅ `3. repo.py:L88: yagni: AbstractRepository with one implementation. Inline it until a second one exists.`

## Whole repo

Suggest a whole-repo pass every 3–5 features. Scan the whole tree instead of a diff and rank findings biggest cut first. Hunt for: deps
the stdlib or platform already ships, single-implementation interfaces, factories with one
product, wrappers that only delegate, files exporting one thing, dead flags and config,
hand-rolled stdlib, helpers duplicating one that already lives in this repo. Before
emitting `delete:`, grep the whole tree for the symbol, including tests, fixtures, and
string or dynamic references.

Format: `<N>. <tag> <what to cut>. <replacement>. [path]`. End with
`net: -<N> lines, -<M> deps possible.`

## Rules

- Number findings across the whole report so the user can say "fix 2 and 5".
- Nothing to cut: say `Lean already. Ship.` and stop.
- Scope: over-engineering and complexity only. Correctness bugs, security holes, and
  performance are out of scope; route them to a normal review.
- A single smoke test or `assert`-based self-check is the lean minimum, not bloat; never
  flag it for deletion.
- Lists findings only; applies nothing.
