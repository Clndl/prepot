# Java Patterns

## Purpose
Enforce idiomatic Java (17+) patterns for Spring Boot services.

## Apply when
Writing, reviewing, or refactoring Java/Spring Boot code.

## Rules
- **Naming**: `PascalCase` for classes/records, `camelCase` for methods/fields, `UPPER_SNAKE_CASE` for constants.
- **Immutability**: Use `record` for DTOs. Minimize mutable state; use `final` fields.
- **Optional**: Return `Optional<T>` from `find*` methods. Use `map`/`flatMap`/`orElseThrow`.
- **Streams**: Use for transformations. Keep pipelines short.
- **Exceptions**: Use unchecked domain exceptions (e.g. `MarketNotFoundException`).
- **Generics**: Avoid raw types. Use bounded generics for reusable utilities.
- **Structure**: `config/`, `controller/`, `service/`, `repository/`, `domain/`, `dto/`.
- **Null Safety**: Accept `@Nullable` only when unavoidable; use `@NonNull`. Bean validation (`@NotNull`) on inputs.

## Avoid
- `Optional.get()` without `isPresent()`.
- Complex nested streams (use loops).
- Broad `catch (Exception ex)`.
- Magic numbers (use constants).
- Static mutable state (use DI).
- Silent catch blocks.
