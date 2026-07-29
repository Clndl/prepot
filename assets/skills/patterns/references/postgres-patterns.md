# PostgreSQL Patterns

## Purpose
Enforce query optimization, schema safety, indexing, and Postgres best practices.

## Apply when
Writing SQL queries, creating migrations, or designing database schemas.

## Rules
- **Data Types**: `bigint` (IDs), `text` (strings), `timestamptz` (dates), `numeric(10,2)` (money), `boolean` (flags).
- **Indexing**:
  - `B-tree` for basic equality/range (`=`, `>`).
  - `Composite` for multi-column WHEREs (put equality columns first, then range columns).
  - `GIN` for `jsonb` or full-text search.
- **Pagination**: Use cursor pagination (`WHERE id > $last_id ORDER BY id LIMIT 20`).
- **Upserts**: Use `ON CONFLICT (cols) DO UPDATE SET ...` for safe concurrent updates.
- **Queues**: Use `FOR UPDATE SKIP LOCKED` for reliable worker queues.
- **Row Level Security**: Wrap functions in `SELECT` (e.g. `USING ((SELECT auth.uid()) = user_id)`).

## Avoid
- `OFFSET` for deep pagination (O(n) performance degradation).
- Unindexed foreign keys.
- Using `timestamp` without timezone (`timestamptz`).
- Using `float` for financial data.
- Using random UUIDs as Primary Keys (use sequential UUIDs or bigints to prevent index fragmentation).
