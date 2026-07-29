# Kotlin Patterns

## Purpose
Enforce idiomatic Kotlin conventions leveraging coroutines, null safety, and DSL builders.

## Apply when
Writing, reviewing, or refactoring Kotlin code.

## Rules
- **Null Safety**: Use `?.` and `?:`. Default to non-nullable types.
- **Immutability**: Prefer `val` and immutable collections. Use `data class` with `copy()`.
- **Expression Bodies**: Use for concise functions and exhaustive `when` blocks.
- **Value Objects**: Use `@JvmInline value class` for type-safe wrappers.
- **Hierarchies**: Use `sealed class` or `sealed interface` for exhaustive pattern matching (e.g., Results, ApiErrors).
- **Scope Functions**: 
  - `let`: Transform nullable/scoped result.
  - `apply`: Configure object.
  - `also`: Side effects.
  - `run`: Execute block with receiver.
- **Extensions**: Use to add functionality without inheritance (e.g., domain/collection extensions).
- **Coroutines**: Use `coroutineScope` / `supervisorScope` for structured concurrency. Respect `ensureActive()` and cancellation.
- **Flow**: Use cold flows for reactive streams.
- **Delegation**: Use `by lazy` or interface delegation (`by delegate`) for reuse.
- **Builders**: Use `@DslMarker` for type-safe DSLs.

## Avoid
- Force-unwrapping `!!`.
- Platform type leakage from Java (handle nulls explicitly).
- Mutable data classes.
- Exceptions for control flow (use `Result`).
- `GlobalScope.launch` (use structured concurrency).
- Deeply nested scope functions (chain safe calls instead).
