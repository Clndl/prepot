# Nuxt 4 Patterns

## Purpose
Enforce hydration safety, SSR data fetching, and route caching for Nuxt 4 apps.

## Apply when
Building Nuxt SSR pages, debugging hydration mismatches, or fetching API data.

## Rules
- **Data Fetching**: Use `await useFetch()` or `useAsyncData()` (with stable keys) for SSR-safe reads.
- **Mutations**: Use `$fetch()` for user-triggered writes/mutations, never for top-level page rendering data.
- **Route Rules**: Define caching (`prerender`, `swr`, `isr`, `ssr: false`) globally in `nuxt.config.ts` per route group.
- **Lazy Loading**: Use the `Lazy` prefix (`<LazyMyComponent v-if="..." />`) to dynamically import components.
- **Routing**: Always use Nuxt's `useRoute()`, not `vue-router`.

## Avoid
- Hydration mismatches: Using `Date.now()`, `Math.random()`, or browser APIs (`window`, `localStorage`) during SSR.
- Using `route.fullPath` to drive SSR markup (URL fragments are client-only).
- Top-level `$fetch` (causes double-fetching on client hydration).
- Using `ssr: false` as a lazy fix for hydration errors.
