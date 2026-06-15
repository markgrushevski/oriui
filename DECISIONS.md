# Decisions

Architecture decision log for oriUI — the "why" behind key choices, so they aren't
relitigated after a context compaction or by a new contributor. Companion to
[ROADMAP.md](ROADMAP.md) (what / when) and [CLAUDE.md](CLAUDE.md) (how). Newest first.

## Working mode: Opus implements, decisions written here, user compacts

Opus does implementation directly (best judgment + continuity); every key decision lands in
this file / CLAUDE.md / ROADMAP.md so it survives a `/compact`, and the harness task list
holds in-flight progress. A `sonnet` subagent is used only for clearly-mechanical, high-volume
work (one transform across many files, scaffolding from a template). Rejected: full Sonnet
delegation — cheaper per token, but it executes spec literally without questioning intent
(it left a token ramp defined-but-unwired and contorted token names around a lint rule
instead of relaxing the rule). Judgment-heavy work needs Opus review.

## CSS tokens: `@layer` + two-tier aliases + numeric neutral ramp as single source

- `@layer ori.reset, ori.tokens, ori.base, ori.components, ori.utilities` → predictable,
  consumer-overridable cascade with flat specificity (`:where()`), instead of scoped styles.
- Two-tier: raw scale token (`--ori-size-action_md`) + a resolved alias (`--ori-size-action`)
  repointed by a utility class; components read only the alias.
- Numeric neutral ramp `--ori-neutral-50..950` is the single source of truth; semantic role
  tokens (`--ori-color-surface`, …) reference it instead of duplicating hex.
- Every color ships a contrast-checked `--ori-color-on-*` (WCAG AA); the `fill` variant text
  uses the on-color (fixes contrast on filled surfaces).

## Design system = token contract + skins (not "be Material 3")

Default skin is vendor-neutral (slate ramp + a calm slate-blue accent; red/green/amber are
reserved for status, not brand). The signature "ori" (織り) theme and a preset gallery are
optional skins; Material 3 / iOS are just other skins. Rejected: anchoring on Material 3 —
too vendor-specific for a layered, skinnable system.

## Styling: standalone CSS, no Tailwind in core

Standalone CSS custom properties → zero consumer build setup, works with any framework or
plain HTML, and is the differentiator ("Tailwind-free DaisyUI"). Rejected: Tailwind in core
(build coupling for a distributed library; cedes the niche to shadcn/DaisyUI). An optional
Tailwind v4 preset may come later as a style adapter.

## Props: reactive props destructure (Vue 3.5), not `withDefaults`

Defaults co-locate with the declaration, no duplicated `@default` JSDoc to drift; pass a
getter when a prop feeds a composable (lint guard: `vue/no-setup-props-reactivity-loss`).

## State via attributes (aria/data), not classes — planned (Phase 5)

Dynamic state (disabled / loading / active) becomes real `disabled` / `aria-*` / `data-*` —
the a11y-correct source of truth, matching the headless layer. The legacy `ori-disabled`
class (CSS-only, no real `disabled`) is a known bug to fix in the rebuild.

## Type declarations via vue-tsc, not vite-plugin-dts

vite-plugin-dts 5 (now on unplugin-dts) stopped emitting `.vue` SFC declarations → broken
consumer types. Generate `.d.ts` with native `vue-tsc` (`tsconfig.build.json`); the build
fails on type errors instead of emitting them as warnings.

## Headless: own composables behind a swappable adapter — planned (Phase 4)

Components depend on a behavior contract; the default implementation is our own composables,
with an optional Reka UI adapter, selected via `app.use(OriUI, { adapter })`. Lets the
behavior layer be swapped without touching component markup.

## Platform: web-first + mobile-first styling; hybrid planned; Ionic not a target

Touch minimum 44px in the action scale; safe-area insets + `@media (hover:hover)`. Capacitor
is supported via a planned `hybrid` platform mode (token + behavior tweaks). Ionic is a
competing adaptive component library, not a backend — deliberately out of scope.
