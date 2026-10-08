# Next.js & Turbopack Patterns

## Purpose
Optimize Next.js 16+ dev speed and leverage Turbopack.

## Apply when
Developing locally, debugging dev server speed, or optimizing Next.js bundles.

## Rules
- **Turbopack**: Leave it on. It is the default incremental bundler for `next dev` in Next.js 16+.
- **Caching**: Allow file-system caching (in `.next`) to persist for 5-14x faster cold starts.
- **Analysis**: Use the experimental Bundle Analyzer (Next 16.1+) to locate heavy dependencies.
- **Architecture**: Prefer App Router and Server Components to minimize client bundle size.

## Avoid
- Reverting to `--webpack` unless you specifically hit a Turbopack bug or require a legacy plugin.
- Blindly deleting the `.next` directory to fix cache issues (loses Turbopack cache).
