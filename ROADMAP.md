# oriUI roadmap

The vision and phased plan for evolving this project. Day-to-day guidance lives in
[CLAUDE.md](CLAUDE.md).

## Idea

**oriUI** (織り, "weaving") weaves independent layers around shared design tokens.
Key feature: **prototype fast, scale without rewriting** — start with styled components,
drop to headless behavior or raw CSS when you need control, without rewriting, because
the tokens are shared across every layer.

Layers (each independently consumable via subpath exports):

- `oriui` — styled components (behavior + style composed)
- `oriui/headless` — behavior/a11y composables; swappable adapter (own ↔ Reka UI)
- `oriui/css` — standalone CSS classes + tokens (Tailwind-free, DaisyUI-like)

Design system = **token contract + skins** (default neutral, signature "ori" / 織り,
preset gallery; Material 3 / iOS as optional skins). Platform: web-first with mobile-first
styling; optional `hybrid` (Capacitor) mode. Ambition: portfolio-grade (clean architecture,
a11y, tests, strong docs).

## Phases

1. ✅ **Modernize toolchain** — Vite 8, TS 6, vue-tsc 3, ESLint 10, stylelint 17; vue-tsc dts emit.
2. ✅ **Rebrand vueinjar → oriUI** — `ori-*` / `Ori*`, `src/` layout, types extracted, 1.0.0-alpha.0.
3. ⬜ **Foundation** — token contract (primitives → semantic + on-color → component, `@layer`);
   skins (neutral default + ori + presets, light/dark); mobile-first touch sizes + safe-area;
   standalone css layer; 3 subpath build entries.
4. ⬜ **Headless layer** — behavior contract + native composables + optional Reka adapter +
   platform (web/hybrid) + `app.use(OriUI, { adapter, platform, skin })`.
5. ⬜ **Rebuild styled components** on headless + css; full a11y; `glass` variant.
6. ⬜ **Testing** — Vitest + Testing Library + axe; Playwright visual/e2e + touch-target audit.
7. ⬜ **Docs** — VitePress (idea + comparisons + platform matrix + theme gallery) + Storybook.
8. ⬜ **CI/CD** — GitHub Actions (lint/types/test/build), changesets, badges.

## Deferred / out of scope (for now)

- Full hybrid/Capacitor mode (haptics, native gestures); iOS adaptive skin.
- Optional Tailwind v4 preset adapter; monorepo split `@oriui/*`.
- Component catalog expansion (forms, overlays) — after the foundation.
- **Ionic is deliberately NOT a target** (it's a competitor, not a backend; Capacitor is
  supported without it via the planned hybrid mode).
