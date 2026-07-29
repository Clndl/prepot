# Agentic Coding Rules

Always-follow rules for any agent working in this workspace. These override default
harness behavior.

## Working files

- Temporary / scratch files → a `tmp/` folder at the **root of the current workspace**.
  **NEVER** use `/private/tmp`, `/tmp`, or any other system temp directory. Keep `tmp/` gitignored.
- Persistent memory → a `memory/` folder at the **root of the current workspace**.
  **NEVER** write memory to `~/.claude/`, `~/.codex/`, or any other global / home-level directory.

## Coding style

- Match the surrounding code: naming, structure, comment density, idioms.
- DRY and YAGNI. Don't add abstraction, config, or features no one asked for.
- Prefer clear names over comments; comment the *why*, not the *what*.
- Small, focused functions. Fail fast with explicit errors, not silent fallbacks.

## Testing

- Add/adjust tests for behavior you change. Test behavior, not implementation details.
- A test must be able to fail — assert real outcomes, not tautologies.
- Run the relevant tests before claiming a change works; report failures honestly.

## Git workflow

- Don't commit or push unless asked. If on the default branch, branch first.
- Small, coherent commits with messages explaining the why.
- **NEVER** commit secrets, credentials, or `.env` files.

## Security

- **NEVER** log or echo secrets. Read credentials from env/secret stores, **NEVER** hardcode.
- Validate and sanitize external input. Use parameterized queries.
- Least privilege for tokens, scopes, and file permissions.

## Performance

- Make it correct first, then fast — and only where it measurably matters.
- Avoid N+1 queries and unbounded loops over remote calls; batch where sensible.
- Don't micro-optimize readable code that isn't on a hot path.
