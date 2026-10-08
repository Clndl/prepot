# Workflow: UI Feature Implementation

## Execution Steps
Follow these steps to implement a new feature (e.g., "Candidates"):

1. **Contract:** Create/Update `src/interfaces/Domain.interface.ts` with Entity and DTO types.
2. **Service:** Create the API wrapper in `src/services/` (e.g., `CandidateService.ts`).
3. **i18n:** Add all necessary keys (labels, buttons, toasts) in `src/locales/en.json`.
4. **Components:** Create reusable UI components or Modals in `src/components/`.
5. **Page:** Implement the main route in `src/pages/` using MUI components.
6. **Wiring:** Add the route to `App.tsx` or the main router.

## Validation (Mandatory)
1. Run `npm run build` to verify TypeScript strictly matches Backend DTOs.
2. **Memory Update:** Update project memory (`prepot-memory` skill) with the new route and service methods.