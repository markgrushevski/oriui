---
title: Idea & comparisons
---

# Idea & comparisons

oriUI's one-line idea — **prototype fast, scale without rewriting** — falls out of a single
architectural choice: **three layers woven around one token contract**, so you can change _depth_
(styled → headless → CSS) without changing your _design system_. This page sets that idea next to the
libraries oriUI learns from, and is honest about where it does and doesn't compete.

If you just want the mechanics, start with the [Introduction](/overview/introduction) and the
[Applicability matrix](/overview/applicability); this page is the _why_ and the _positioning_.

## What oriUI is — and isn't

**It is:**

- A **token-first** system: the design tokens are the theming API, shared identically by every layer.
- **Three depths of one stack** — `@oriui/vue` (styled) · `@oriui/headless` (behaviour) · `@oriui/css`
  (standalone classes) — each usable alone or composed.
- **Zero-runtime**: skins, light/dark, size, and variant are CSS custom-property toggles — never JS.
- **Multi-framework at the behaviour layer**: one framework-agnostic core, thin Vue **and** Svelte
  adapters.

**It isn't:**

- A **race on catalog size**. The reference libraries below are mined for ideas, not chased on count.
- A **Tailwind plugin**. The CSS layer is plain, prefixed, `@layer`-scoped classes; Tailwind is an
  optional preset, never a requirement.
- A **single-framework headless kit** or a **build-time CSS-in-JS** engine.

## The design axes

oriUI is built around five properties. The table compares on **those** axes — it reflects each
project's _primary design intent_, not a feature-by-feature scorecard, and every project below is
excellent at what it set out to do.

| Project             | Layered (styled + headless + CSS) | Zero-runtime token theming | Standalone CSS (no framework / build) |    Multi-framework headless     | No Tailwind dependency |
| ------------------- | :-------------------------------: | :------------------------: | :-----------------------------------: | :-----------------------------: | :--------------------: |
| **oriUI**           |                ✅                 |             ✅             |                  ✅                   |    ✅ Vue + Svelte, one core    |           ✅           |
| daisyUI             |           — (CSS only)            |    ~ CSS vars, Tailwind    |           — needs Tailwind            |                —                |     — is Tailwind      |
| Ark UI + Zag        |          ~ headless only          |        n/a unstyled        |                   —                   | ✅ Vue / React / Solid / Svelte |           ✅           |
| Reka UI             |       ~ headless, Vue only        |            n/a             |                   —                   |           — Vue only            |           ✅           |
| Radix / Headless UI |          ~ headless only          |            n/a             |                   —                   |     — mostly per-framework      |           ✅           |
| Panda / shadcn/ui   |         — styling system          |  ~ build-time extraction   |                   —                   |                —                |           ✅           |
| Vuetify / PrimeVue  |           — styled only           |       ~ theme config       |                   —                   |           — Vue only            |           ✅           |

✅ core design · ~ partial / with caveats · — not a goal · n/a not applicable

The point isn't any single column — it's the **combination**. Plenty of libraries own one or two of
these; oriUI's bet is that a token contract shared across _all_ of them is what lets you start fast and
deepen without a rewrite.

## Category by category

### Headless libraries — Ark UI (+ Zag), Reka, Radix, Headless UI

The closest neighbours to oriUI's behaviour layer, and the ones it borrows the most from: the
`useMachine → connect(service, normalize) → spread prop-getters` seam is modelled on **Zag** / **Ark
UI** (verified against their source). The difference is scope: for oriUI, headless is _one depth of a
stack_, not the whole product — stay styled, drop to headless, or drop to CSS, all on the same tokens.
oriUI's core stays hand-rolled and tiny (a reducer + prop-getters), with the contract deliberately
shaped so a real `@zag-js/<x>` machine can be dropped behind it for a genuinely hard widget. **Reka UI**
(ex-Radix-Vue) and **Radix** are Vue-only / React-only respectively; oriUI's one core drives Vue and
Svelte from the same code.

### CSS / Tailwind kits — daisyUI

daisyUI is the ergonomic model for the CSS layer — semantic component classes over utilities. oriUI
matches that "just classes" feel but **without a Tailwind build dependency**: `.ori-*` are plain,
`@layer`-scoped classes that ship to htmx, Astro, or hand-written HTML as-is, themed by CSS custom
properties. And there's a real Vue component layer on top when a prototype graduates.

### Token & distribution systems — Open Props, Panda, shadcn/ui

**Open Props** is the spiritual sibling for the token side — design tokens as plain custom properties.
**Panda** is a build-time CSS-in-JS engine and **shadcn/ui** a copy-paste component registry; both are
great distribution models, but they're a _styling/build_ system, not a layered component stack. oriUI's
theming needs no build step and no JS runtime — one attribute on `<html>` reskins everything.

### Full component libraries — Vuetify, PrimeVue, Element Plus

The batteries-included Vue kits. oriUI is lighter and unopinionated about styling: the **token contract
is the theming API**, so customization is CSS custom properties, not a framework-specific theme-config
object — and you can leave the styled layer entirely and keep the classes.

### Positioning — Floating UI

For overlays, oriUI leans on the **platform** (CSS Anchor Positioning + the Popover API) rather than a
JS positioner like **Floating UI** — zero-JS placement and collision-flip via `.ori-anchored`. Floating
UI remains the fallback model if a target needs to support browsers without anchor positioning.

## We mine, we don't race

oriUI is **not** trying to out-catalog daisyUI or out-adapt Ark. Those projects are reference points to
periodically **mine** — for API shape, a11y patterns, state names, class names — with findings landing
in the [backlog](https://github.com/markgrushevski/oriui/blob/main/IDEAS.md), never auto-adopted. The
bar for pulling anything in is one question: **does a real screen need it?** That keeps the surface
small, the tokens coherent, and the "scale without rewriting" promise honest.
