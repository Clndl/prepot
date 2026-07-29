# Iteration Workflow

## Purpose

Execute exactly one backlog story from selection to validation.

This workflow is implementation-first. Documentation, planning, and memory updates support delivery; they must not replace implementation.

---

# Execution Policy

If the selected story is implementable, the agent must modify the codebase.

Do not stop at:
- analysis
- recommendations
- architecture review
- future suggestions
- documentation-only changes

unless the selected story itself is documentation-only or a hard blocker prevents implementation.

Architecture observations must be handled as follows:
- critical blocker -> move story to Onhold and document blocker
- within story scope -> implement now
- outside story scope -> create follow-up backlog item

---

# Iteration Flow

1. Select the highest-priority `New` story with no unresolved dependencies.

2. Transition:

```txt
New -> Active
````

3. Load only the minimum required context:

* selected story file
* directly relevant memory files
* directly relevant pattern references
* lifecycle and done-definition rules

4. Create a short implementation plan with maximum 5 steps.

5. Implement the selected story.

6. Run available validation commands:

* tests
* typecheck
* lint
* build

7. If blocked:

```txt
Active -> Onhold
```

Document:

* blocker
* cause
* unblock condition

Then stop.

8. If implementation completes:

```txt
Active -> Resolved
```

9. Apply `done-definition.md`.

10. If validation passes:

```txt
Resolved -> Close
```

11. Update:

- project memory
- feature history
- technical debt backlog
- roadmap progression
- dependency graph

12. After closing a story, note any genuinely discovered missing work.

- Add as roadmap bullets, NOT as story files, unless needed for the current sprint.
- Do NOT generate debt, governance, or discovery stories automatically.
- Maximum 2 follow-up items per closed story.
- First check if the gap can be an acceptance criterion on an existing story.

13. Produce a concise execution report. Always provide a concise Git-flow commit message.

14. Repeat with next eligible story.