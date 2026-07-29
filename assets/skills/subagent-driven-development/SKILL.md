---
name: subagent-driven-development
description: Execute implementation plans with fresh subagent per task, two-stage review (spec then quality) after each.
---

# Subagent-Driven Development

Execute plans by dispatching a fresh subagent per task with two-stage review after each.

**Why subagents**: Isolated context keeps them focused and preserves your context for coordination.

**Core principle**: Fresh subagent per task + two-stage review (spec then quality) = high quality, fast iteration.

**Continuous execution**: Do not pause between tasks. Execute all tasks without stopping. Only stop for: unresolvable BLOCKED status, genuine ambiguity preventing progress, or all tasks complete. Never ask "Should I continue?"

## When to Use

Use when: you have an implementation plan with mostly independent tasks and want same-session execution.
Do not use when: tasks are tightly coupled, or you want parallel-session execution (use executing-plans instead).

## Process

1. Read plan, extract all tasks with full text, note context, create TodoWrite
2. **Per task**:
   a. Dispatch implementer subagent with full task text + context
   b. If implementer asks questions → answer, re-dispatch
   c. Implementer implements, tests, commits, self-reviews
   d. Dispatch spec reviewer → confirm code matches spec
   e. If spec issues → implementer fixes → spec reviewer re-reviews → repeat until ✅
   f. Dispatch code quality reviewer
   g. If quality issues → implementer fixes → reviewer re-reviews → repeat until ✅
   h. Mark task complete in TodoWrite
3. After all tasks → dispatch final code reviewer for entire implementation

## Model Selection

Use the least powerful model that handles each role:
- **1-2 files, clear spec** → cheap/fast model (most implementation tasks)
- **Multi-file integration** → standard model
- **Architecture, design, review** → most capable model

## Handling Implementer Status

- **DONE**: Proceed to spec compliance review
- **DONE_WITH_CONCERNS**: Read concerns. Address correctness/scope issues before review. Observations → note and proceed
- **NEEDS_CONTEXT**: Provide missing context and re-dispatch
- **BLOCKED**: Assess: context problem → provide more context. Reasoning limit → use more capable model. Task too large → split. Plan wrong → escalate to human

Never ignore an escalation or retry without changes.

## Prompt Templates

Use `./implementer-prompt.md` for dispatching implementer subagents.

## Rules

Never:
- Start on main/master without user consent
- Skip either review stage (spec compliance AND code quality both required)
- Proceed with unfixed review issues
- Dispatch multiple implementers in parallel (conflicts)
- Make subagent read plan file (provide full text instead)
- Skip scene-setting context
- Start code quality review before spec compliance is ✅
- Move to next task with open review issues

If subagent asks questions: answer clearly and completely before proceeding.
If reviewer finds issues: implementer fixes → reviewer re-reviews → repeat until approved.
If subagent fails: dispatch fix subagent with specific instructions — don't fix manually (context pollution).

## Integration

- **implementation-plan**: Creates the plan this skill executes
- **executing-plans**: Alternative for parallel-session execution