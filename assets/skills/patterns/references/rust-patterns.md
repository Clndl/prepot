# Rust Patterns

## Purpose
Enforce idiomatic Rust patterns for memory safety, error handling, and concurrency.

## Apply when
Writing, reviewing, or refactoring Rust code.

## Rules
- **Ownership**: Borrow (`&T`) by default. Take ownership only when storing or consuming. Use `Cow` for flexible ownership to avoid allocations.
- **Error Handling**: Use `Result` and `?`. Use `thiserror` for library errors and `anyhow` for applications.
- **States**: Make illegal states unrepresentable using `enum`. Match exhaustively (no wildcard `_` for business logic).
- **Traits/Generics**: Accept generics/traits, return concrete types. Use newtypes (`struct UserId(u64)`) for type safety.
- **Iterators**: Prefer iterator chains over manual loops. Use `collect()` with type inference.
- **Concurrency**: Use `Arc<Mutex<T>>` for shared state, channels (`mpsc`) for message passing, and Tokio for async I/O.
- **Module Structure**: Organize by domain, not by type. Use minimal `pub` surface (`pub(crate)`).

## Avoid
- `.unwrap()` or `.expect()` in production code.
- `.clone()` just to satisfy the borrow checker.
- `String` arguments when `&str` suffices.
- Unnecessary `unsafe` (only use for FFI or proven performance bottlenecks with safety comments).
- Blocking the executor in async contexts.
- Ignoring `#[must_use]` warnings.
