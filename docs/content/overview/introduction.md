---
title: Introduction
---

# Introduction

**oriUI** (織り, _ori_ — "weaving") is a layered Vue 3 UI library. The idea in one line:
**prototype fast, scale without rewriting.** Start with ready-made styled components; when you need
more control, drop down to the behavior or the raw CSS — without throwing away your work, because
every layer is woven around the **same design tokens**.

## Three layers, one token contract

oriUI ships as three independently consumable layers. Use just one, or compose them:

| Layer        | Package               | What it gives you                                                                 |
| ------------ | --------------------- | --------------------------------------------------------------------------------- |
| **Styled**   | `@oriui/vue`          | Ready components — `<OriButton variant="tonal" />`. Behavior + style composed.    |
| **Headless** | `@oriui/headless/vue` | Behavior only — composables for state, keyboard, focus, and ARIA. You own markup. |
| **CSS**      | `@oriui/css`          | Standalone `.ori-*` classes + tokens. No Vue, no build step, no Tailwind.         |

These are not three separate products — they are **three depths of one system**. A styled `OriButton`
is the CSS layer's `.ori-button` classes plus token theming; a styled `OriDialog` is the headless
`useDialog` plus markup plus those same classes. Reach for the depth a screen needs, and the tokens
keep everything visually consistent.

## What makes it different

- **Zero-runtime theming.** Skins, light/dark, sizes, and variants are CSS custom properties —
  switching them is a class or attribute toggle, never JavaScript. See [Design tokens](/guides/design-tokens).
- **No Tailwind dependency.** The CSS layer is plain, prefixed, `@layer`-scoped classes you can ship to
  htmx, Astro, or hand-written HTML. Tailwind is an _optional_ preset, not a requirement.
- **Swappable behavior.** The headless layer runs on a tiny zero-dependency native engine by default,
  and you can swap in a battle-tested one (Zag) per primitive behind one contract — without touching
  your markup. See [@oriui/headless](/headless/core).
- **Accessibility is structural.** State lives in real attributes (`disabled`, `aria-busy`,
  `aria-expanded`), color pairs are contrast-checked in CI, and focus rings ride `:focus-visible`.
  See [Accessibility](/overview/accessibility).

## How it compares

oriUI deliberately sits between the usual categories:

- **vs. Tailwind component kits (DaisyUI, …)** — the same "just classes" ergonomics for the CSS layer,
  but **without** a Tailwind build dependency, and with a real Vue component layer on top when you want
  it.
- **vs. headless libraries (Radix / Reka, Headless UI)** — oriUI has a headless layer too, but it is
  one depth of a stack, not the whole story: stay styled, go headless, or drop to CSS — all reusing the
  same tokens.
- **vs. full component libraries (Vuetify, PrimeVue)** — lighter and unopinionated about styling: the
  token contract _is_ the theming API, so customization is CSS, not a framework-specific config object.

For a deeper, library-by-library take, see [Idea & comparisons](/overview/comparisons).

## Where each layer fits

The CSS layer works **everywhere**; the styled layer is Vue, and the headless layer ships **Vue and
Svelte** adapters over one core. See the full [Applicability matrix](/overview/applicability) for the
per-environment breakdown (Vue / Svelte / Astro / htmx, plus the Nuxt / SvelteKit / Capacitor / Electron
shells). A vanilla / htmx headless adapter is still planned.

## Status

oriUI is in **alpha** (the `1.0.0-alpha.*` line). The token contract, the CSS layer, and the styled components
under [Components](/components/button) are solid enough to build with; the catalog is still growing and
the public API may shift before `1.0`.

## Next

- [Get started](/overview/get-started) — a styled component on screen in a minute.
- [Installation](/overview/installation) — install each layer, for each target.
- [Accessibility](/overview/accessibility) — the a11y guarantees, and where they come from.
