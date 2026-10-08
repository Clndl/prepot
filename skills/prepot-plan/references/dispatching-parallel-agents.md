# Dispatching Parallel Agents

Delegate tasks to specialized agents with isolated context. Each agent gets exactly what it needs — never your full session context.

**Core principle**: One agent per independent problem domain. Let them work concurrently.

## When to Use

Use when:
- 3+ test files failing with different root causes
- Multiple subsystems broken independently
- Each problem can be understood without context from others
- No shared state between investigations

Don't use when:
- Failures are related (fixing one might fix others)
- Need to understand full system state
- Agents would interfere (editing same files, same resources)
- Exploratory debugging (you don't know what's broken yet)

## The Pattern

### 1. Identify Independent Domains
Group failures by what's broken. Each domain must be independent.

### 2. Create Focused Agent Tasks
Each agent gets:
- **Specific scope**: one test file or subsystem
- **Clear goal**: make these tests pass
- **Constraints**: don't change other code
- **Expected output**: summary of findings and fixes

### 3. Dispatch in Parallel
```
Dispatch subagent: Fix agent-tool-abort.test.ts failures
Dispatch subagent: Fix batch-completion-behavior.test.ts failures
Dispatch subagent: Fix tool-approval-race-conditions.test.ts failures
```

### 4. Review and Integrate
When agents return: read each summary, verify fixes don't conflict, run full test suite, integrate all changes.

## Agent Prompt Structure

Good prompts are: focused (one problem), self-contained (all context included), specific about output.

```markdown
Fix the 3 failing tests in src/agents/agent-tool-abort.test.ts:
1. "should abort tool..." - expects 'interrupted at' in message
2. "should handle mixed..." - fast tool aborted instead of completed

These are timing issues. Your task:
1. Read the test file and understand what each test verifies
2. Identify root cause
3. Fix by replacing timeouts with event-based waiting

Do NOT just increase timeouts - find the real issue.
Return: Summary of root cause and changes.
```

## Common Mistakes

- **Too broad** ("Fix all tests") → be specific ("Fix agent-tool-abort.test.ts")
- **No context** ("Fix the race condition") → paste error messages and test names
- **No constraints** → specify "Don't change production code" or "Fix tests only"
- **Vague output** ("Fix it") → specify "Return summary of root cause and changes"

## Verification

After agents return:
1. Review each summary — understand what changed
2. Check for conflicts — did agents edit same code?
3. Run full suite — verify all fixes work together
4. Spot check — agents can make systematic errors
