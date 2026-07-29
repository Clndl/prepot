---
name: frontend-design
description: Use when building or polishing user-facing web UI — drives premium visual aesthetics and on-page SEO. Skip for backend, CLI, or non-visual work.
---

# Frontend Design & SEO

Guidance for web UI that should look premium and rank well. Apply only to user-facing web work,
and match depth to the task — a one-line CSS tweak doesn't need the full checklist.

## Design Aesthetics

> CRITICAL REMINDER: AESTHETICS ARE VERY IMPORTANT. If your web app looks simple and basic then you have FAILED!

- **Wow at first glance.** Use modern web design: curated, harmonious palettes (HSL-tuned colors,
  sleek dark modes), smooth gradients, glassmorphism, and dynamic animations.
- **Avoid generic colors** (plain red / blue / green) and browser-default typography. Use modern
  fonts (e.g. Inter, Roboto, Outfit from Google Fonts).
- **Make it feel alive.** Hover effects, interactive elements, and subtle micro-animations that
  encourage interaction.
- **Premium, not MVP.** Aim for a state-of-the-art feel; avoid bare minimum-viable visuals.
- **No placeholders.** Generate real images/assets (e.g. via an image-generation tool) instead of
  leaving gaps.

## SEO Best Practices

Apply on every page:

- **Title tags** — descriptive, unique per page.
- **Meta descriptions** — compelling, accurately summarizing the page content.
- **Heading structure** — a single `<h1>` per page with proper heading hierarchy.
- **Semantic HTML** — appropriate HTML5 semantic elements.
- **Unique IDs** — descriptive IDs on interactive elements (also aids browser testing).
- **Performance** — fast load times through optimization.

## Related skills

- `react-composition-patterns` — component structure when the stack is React.
- `patterns` — framework/language conventions (load the relevant `reference/*-patterns.md`).
