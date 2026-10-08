# Laravel Patterns

## Purpose
Enforce Laravel architecture, Eloquent ORM, controller routing, and service layer best practices.

## Apply when
Building Laravel applications, APIs, or data models.

## Rules
- **Architecture**: Use thin Controllers. Push business orchestration to Services and single-purpose logic to Actions.
- **Routing**: Use Route Model Binding (use `scopeBindings()` for nested relationships). Prefer API Resource controllers.
- **Models**: Use typed `$casts`, Enums, and Value Objects. Use `SoftDeletes` for recoverable records.
- **Database**: Prevent N+1 queries using eager loading (`with`). Use Query Objects or Scopes for complex/reusable filters. Wrap multi-step writes in `DB::transaction`.
- **Migrations**: Use anonymous classes and timestamped files. Tables must be snake_case plural.
- **Validation**: Keep validation in Form Requests (`FormRequest`). Transform validated input into strongly-typed DTOs.
- **Async**: Queue IO-heavy tasks (Jobs). Emit Events for domain side-effects. Cache expensive database reads.

## Avoid
- Fat controllers holding business logic.
- N+1 query loops inside views or API transformations.
- Calling `env()` outside of `config/` files.
- Two different mechanisms (global scope + local scope) doing the same exact filtering.
