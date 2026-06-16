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
- `oriui/headless` — behavior contract; swappable adapter (native / Zag / your own)
- `oriui/css` — standalone CSS classes + tokens (Tailwind-free, DaisyUI-like)

The `oriui/css` layer needs **no JS framework** — server-rendered **htmx**, Astro, and plain HTML
are first-class scenarios (just classes + zero-runtime token theming).

Design system = **token contract + skins** (default neutral, signature "ori" / 織り,
preset gallery; Material 3 / iOS as optional skins). Platform: web-first with mobile-first
styling; optional `hybrid` (Capacitor) mode. Ambition: portfolio-grade (clean architecture,
a11y, tests, strong docs).

## Phases

1. ✅ **Modernize toolchain** — Vite 8, TS 6, vue-tsc 3, ESLint 10, stylelint 17; vue-tsc dts emit.
2. ✅ **Rebrand vueinjar → oriUI** — `ori-*` / `Ori*`, `src/` layout, types extracted, 1.0.0-alpha.0.
3. ✅ **Foundation** — token contract (`@layer`, neutral ramp + semantic on-color), neutral + ori
   skins (light/dark), mobile-first touch sizes + safe-area, standalone `oriui/css` subpath.
4. 🔄 **Headless layer** — swappable behavior **contract** (`OriHeadless` plugin): **native** zero-dep
   adapter for simple primitives (Disclosure ✅), **Zag** for complex (Dialog ✅), or bring-your-own.
   (Superseded "own ↔ Reka" — see DECISIONS.md.) Next: promote `OriDialog` into the `oriui` package.
5. 🔄 **Styled components** — a11y pass on the 5 done (state-via-attributes, focus-visible); next:
   `glass` variant + catalog expansion (forms, overlays) on the headless contract.
6. ⬜ **Testing** — Vitest + Testing Library + axe-core/vitest-axe; Playwright visual/e2e.
7. 🔄 **Docs** — dogfooded **Nuxt 4 + Nuxt Content 3** app, UI built on oriUI (not VitePress). To do:
    - **every component gets a full page** (intro + explanation + props/slots + a11y);
    - **per-component playground** — demos + explanation live ON the component page; retire the
      separate `/playground` route (its grid distributes into the pages);
    - **framework-switchable examples (Vue ↔ Svelte)** — global toggle (like the skin switch); live
      demo stays Vue, code shown for the selected framework (Svelte via the standalone `.ori-*` css);
    - idea + comparisons + **applicability matrix** (Vue / Svelte / htmx / Astro / plain HTML /
      Capacitor / Electron) — htmx & no-framework are first-class for the css layer (the Example
      switcher can gain an HTML/htmx tab); theme gallery + `nuxt-llms` (llms.txt).
8. ⬜ **CI/CD + deploy** — host docs on **Vercel** (static SSG via `nuxi generate`, output
   `docs/.output/public`, install at repo root); GitHub Actions (lint/types/test/build), changesets, badges.

## Deferred / out of scope (for now)

- Full hybrid/Capacitor mode (haptics, native gestures); iOS adaptive skin.
- Optional Tailwind v4 preset adapter; monorepo split `@oriui/*` (started: `@oriui/core`,
  `@oriui/vue`; full split + pnpm/changesets deferred).
- `oriui/headless` for **no-framework / htmx** via Zag's `@zag-js/vanilla` behind the contract
  (an `@oriui/vanilla` adapter) — complex behavior (focus-trap, roving-tabindex) without a framework.
- Component catalog expansion (forms, overlays) — after the foundation.
- **Ionic is deliberately NOT a target** (it's a competitor, not a backend; Capacitor is
  supported without it via the planned hybrid mode).
