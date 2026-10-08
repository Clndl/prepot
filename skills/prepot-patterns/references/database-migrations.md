# Database Migration Patterns

Safe, reversible schema changes for production systems.

## Core Principles

1. Every change is a migration — never alter production databases manually
2. Migrations are forward-only in production — rollbacks use new forward migrations
3. Schema and data migrations are separate — never mix DDL and DML
4. Test migrations against production-sized data — what works on 100 rows may lock on 10M
5. Migrations are immutable once deployed — never edit a deployed migration

## Safety Checklist

Before applying any migration:
- [ ] Has both UP and DOWN (or marked irreversible)
- [ ] No full table locks on large tables (use concurrent operations)
- [ ] New columns have defaults or are nullable (never NOT NULL without default)
- [ ] Indexes created concurrently on existing tables
- [ ] Data backfill is a separate migration from schema change
- [ ] Tested against production-sized data copy
- [ ] Rollback plan documented

## PostgreSQL Patterns

### Adding Columns

```sql
-- GOOD: nullable or with default (PG 11+ instant, no rewrite)
ALTER TABLE users ADD COLUMN avatar_url TEXT;
ALTER TABLE users ADD COLUMN is_active BOOLEAN NOT NULL DEFAULT true;
-- BAD: NOT NULL without default — locks table, rewrites all rows
ALTER TABLE users ADD COLUMN role TEXT NOT NULL;
```

### Adding Indexes

```sql
-- BAD: blocks writes on large tables
CREATE INDEX idx_users_email ON users (email);
-- GOOD: non-blocking (cannot run inside a transaction block)
CREATE INDEX CONCURRENTLY idx_users_email ON users (email);
```

### Renaming Columns (expand-contract)

Never rename directly. Use three migrations:
1. Add new column (nullable)
2. Backfill data, deploy app writing to both columns
3. Drop old column after app only reads new column

### Removing Columns

1. Remove all app references to the column
2. Deploy app without the column reference
3. Drop column in next migration

### Large Data Migrations

Batch updates to avoid table locks:

```sql
-- BAD: single transaction locks table
UPDATE users SET normalized_email = LOWER(email);
-- GOOD: batch with LIMIT + SKIP LOCKED in a loop
```

## Zero-Downtime Strategy (Expand-Contract)

```
Phase 1 EXPAND:  Add new column/table (nullable/default). Deploy: app writes BOTH. Backfill.
Phase 2 MIGRATE: Deploy: app reads NEW, writes BOTH. Verify consistency.
Phase 3 CONTRACT: Deploy: app uses NEW only. Drop old column in separate migration.
```

## ORM/Tool Quick Reference

### Prisma (TypeScript)

```bash
npx prisma migrate dev --name <name>    # Create migration
npx prisma migrate deploy               # Apply in production
npx prisma migrate dev --create-only --name <name>  # Empty migration for custom SQL
npx prisma generate                     # Regenerate client
```

Use `--create-only` for CONCURRENTLY indexes or custom data backfills.

### Drizzle (TypeScript)

```bash
npx drizzle-kit generate   # Generate from schema
npx drizzle-kit migrate    # Apply migrations
npx drizzle-kit push       # Push schema directly (dev only)
```

### Kysely (TypeScript)

```bash
kysely migrate make <name>    # Create migration file
kysely migrate latest         # Apply pending
kysely migrate down           # Rollback last
kysely migrate list           # Show status
```

Always use `Kysely<any>` in migration files — never depend on current schema types.

### Django (Python)

```bash
python manage.py makemigrations                              # Generate
python manage.py migrate                                     # Apply
python manage.py makemigrations --empty app_name -n <name>   # Empty for custom SQL
```

Use `SeparateDatabaseAndState` to remove model fields without dropping columns immediately.

### golang-migrate (Go)

```bash
migrate create -ext sql -dir migrations -seq <name>          # Create pair
migrate -path migrations -database "$DATABASE_URL" up        # Apply
migrate -path migrations -database "$DATABASE_URL" down 1    # Rollback last
migrate -path migrations -database "$DATABASE_URL" force VER # Fix dirty state
```

## Anti-Patterns

| Anti-Pattern | Better Approach |
|---|---|
| Manual SQL in production | Always use migration files |
| Editing deployed migrations | Create new migration instead |
| NOT NULL without default | Add nullable, backfill, then constrain |
| Inline index on large table | CREATE INDEX CONCURRENTLY |
| Schema + data in one migration | Separate migrations |
| Drop column before removing code | Remove code first, drop next deploy |
