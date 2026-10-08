# Senior React Patterns

## Purpose
Enforce strict clean architecture, composition, strong typing, and performance in React.

## Apply when
Building or refactoring React components, managing state, or integrating APIs.

## Rules
- **Architecture Principle**: Contexts orchestrate, Services fetch, Components render.
- **Data Fetching**: NEVER call `fetch` or `axios` inline inside a Component or Context. Always extract to a Service file or use Render Props/Query hooks.
- **Hooks**: Extract complex state or async logic into reusable custom hooks (`useToggle`, `useDebounce`, `useQuery`).
- **State**: 
  - Local: `useState` or `useReducer`.
  - Complex Local/Orchestration: `Context` + `useReducer`.
  - Global State libs (Redux, Zustand) are FORBIDDEN unless explicitly required by the project.
- **Composition**: Prefer compound components (`<Tabs.List>`, `<Tabs.Trigger>`) and `children` props instead of massive prop APIs or deep inheritance.
- **Performance**: Use `useMemo` for expensive sorts/derivations, `useCallback` for stable refs, and `lazy()`/`Suspense` for heavy route boundaries. Virtualize long lists using tools like `@tanstack/react-virtual`.
- **Forms**: Use controlled components with schema validation (Zod). Never trust raw frontend state.
- **Accessibility & UX**: Support keyboard navigation (Arrows, Enter, Esc) and focus restoration (Modals). Must implement i18n (`t('key')`). Use proper ARIA roles.
- **Typing**: Strict TypeScript. Fully typed DTOs. Explicit return types on exported functions.

## Avoid
- `any` types.
- Inline fetch inside components.
- Skipping `ErrorBoundary` implementations (wrap features in Error Boundaries to prevent app crashes).
- Raw backend errors exposed to users (always use polished error/empty/loading states).
- Deep component inheritance.
- Inline anonymous functions in pure/memoized components.
- Missing `key` props in map iterations.
- Over-using Context for rapidly changing state (causes excessive re-renders).