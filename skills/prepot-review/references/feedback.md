# Code Review Reception

**Core principle**: Verify before implementing. Ask before assuming. Technical correctness over social comfort.

## Response Pattern

1. **READ**: Complete feedback without reacting
2. **UNDERSTAND**: Restate requirement in own words (or ask)
3. **VERIFY**: Check against codebase reality
4. **EVALUATE**: Technically sound for THIS codebase?
5. **RESPOND**: Technical acknowledgment or reasoned pushback
6. **IMPLEMENT**: One item at a time, test each

## Forbidden Responses

Never: "You're absolutely right!", "Great point!", "Thanks for catching that!", any gratitude expression, or "Let me implement that now" before verification.

Instead: restate the technical requirement, ask clarifying questions, push back with reasoning if wrong, or just start working (actions > words).

When feedback IS correct: `"Fixed. [Brief description]"` or `"Good catch - [issue]. Fixed in [location]."` or just fix it silently.

## Handling Unclear Feedback

If any item is unclear: STOP — do not implement anything yet. Ask for clarification on ALL unclear items first.
Items may be related. Partial understanding = wrong implementation.

## Source-Specific Handling

### From the User
- Trusted — implement after understanding
- Still ask if scope unclear
- Skip to action or technical acknowledgment

### From External Reviewers

Before implementing, check:
1. Technically correct for THIS codebase?
2. Breaks existing functionality?
3. Reason for current implementation?
4. Works on all platforms/versions?
5. Does reviewer understand full context?

If wrong → push back with technical reasoning.
If can't verify → say so: "I can't verify this without [X]. Should I [investigate/ask/proceed]?"
If conflicts with the user's decisions → stop and discuss with the user first.

## YAGNI Check

If reviewer suggests "implementing properly": grep for actual usage. If unused → "This isn't called. Remove it (YAGNI)?" If used → implement properly.

## Implementation Order

For multi-item feedback:
1. Clarify anything unclear FIRST
2. Implement: blocking issues → simple fixes → complex fixes
3. Test each fix individually
4. Verify no regressions

## When to Push Back

Push back when: suggestion breaks existing functionality, reviewer lacks full context, violates YAGNI, technically incorrect for this stack, legacy/compatibility reasons exist, or conflicts with the user's architectural decisions.

How: use technical reasoning, ask specific questions, reference working tests/code.

If you pushed back and were wrong: "You were right — I checked [X] and it does [Y]. Implementing now." No long apology.

## GitHub Threads

Reply in the comment thread (`gh api repos/{owner}/{repo}/pulls/{pr}/comments/{id}/replies`), not as top-level PR comments.
