# Workflow: Component Implementation

## 1. Definition
- Define the TypeScript interface for props in the same file.
- Use functional components with explicit return types.

## 2. Implementation
- Apply **Composition** patterns if the component is complex.
- Decide if the component needs a simple `useState`, a `useReducer` for complex logic, or a Custom Hook for external data.
- Refer to [react-patterns.md](react-patterns.md) to decide if the state should be moved to a **Zustand** store (Global/Persistent state).
- Implement `react-hook-form` controllers if the component contains inputs.
- Use MUI components as primitives to maintain theme consistency.
- Implement `useTranslation` for all text.
- Wrap interactive logic in `useCallback`.

## 3. Optimization
- Review if `useMemo` or `useCallback` are needed for props or calculations.
- Implement `i18next` for all static text.
- Wrap the final export in `React.memo` if it's a list item or heavy UI.

## 4. Accessibility
- Add ARIA labels and roles.
- Ensure the component is keyboard accessible.
- Implement keyboard navigation logic for custom interactive elements.