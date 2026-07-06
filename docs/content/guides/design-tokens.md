---
title: Design tokens
---

# Design tokens

oriUI is three independent layers woven around **one set of design tokens**. This page is the
catalog — every token, and the resolution model that turns a raw value into the colour a component
paints. The chain is short and deliberate: **a primitive feeds a semantic role, a role feeds a
per-instance alias, and components read only the alias.** That indirection is what lets a single
class repoint a single token — the whole zero-runtime theming story rests on it.

Two axes resolve slightly differently. **Colour is three-tier** (primitive → role → alias);
**size, radius, gap, and font-size are two-tier** (raw scale → alias). Everything here is plain CSS
custom properties under `@layer` — no JavaScript, no build step.

> This page is the reference. To **switch** skin and mode see [Theming](/guides/theming); to
> **override or brand** see [Customization](/guides/customization); for the standalone class story
> see [Using the CSS layer](/guides/css).

## The cascade — `@layer` order

Every token and utility lives inside a layer, declared once in source order:

```css
@layer ori.reset, ori.tokens, ori.base, ori.components, ori.utilities;
```

Later layers win. `ori.tokens` holds the raw scales and role tokens at `:root`; `ori.utilities`
holds the `.ori-*_<step>` classes that repoint aliases. Because the order is fixed and explicit,
the cascade is predictable and **any unlayered consumer style wins over all of it** — overriding is
trivial, never a `!important` fight. The utility modifiers use a flat compound selector
(`.ori-color.ori-color_primary`), so their specificity stays low and consistent — layer order, not a
specificity contest, is what decides the cascade.

The contract for components is one line: **read the resolved alias, never a raw scale token, never a
hardcoded hex.**

## Colour — three tiers

### Tier 1 — primitives: the neutral ramp

A single slate-like ramp is the source of truth for neutral surfaces and text. Role tokens and skins
reference it instead of duplicating hex, so one neutral lives in exactly one place.

| Token               | Value     |
| ------------------- | --------- |
| `--ori-neutral-50`  | `#f8fafc` |
| `--ori-neutral-100` | `#f1f5f9` |
| `--ori-neutral-200` | `#e2e8f0` |
| `--ori-neutral-300` | `#cbd5e1` |
| `--ori-neutral-400` | `#94a3b8` |
| `--ori-neutral-500` | `#64748b` |
| `--ori-neutral-600` | `#475569` |
| `--ori-neutral-700` | `#334155` |
| `--ori-neutral-800` | `#1e293b` |
| `--ori-neutral-900` | `#0f172a` |
| `--ori-neutral-950` | `#020617` |

### Tier 2 — semantic role tokens (light/dark-aware)

Each role ships **four source tokens** — a light and dark value, each paired with a contrast-checked
`on-` colour (the legible foreground for text on that surface). The `on-` pairing is not decorative:
it is asserted by an executable WCAG-AA contrast test, so a filled surface always has readable text.
Values below are the default **Ori** skin.

| Role       | `*-light` | `on-*-light` | `*-dark`  | `on-*-dark` |
| ---------- | --------- | ------------ | --------- | ----------- |
| primary    | `#0369a1` | `#ffffff`    | `#38bdf8` | `#06131f`   |
| secondary  | `#e0f2fe` | `#0c4a6e`    | `#14384e` | `#e6f3fb`   |
| surface    | `#ffffff` | `#0a2233`    | `#0e2536` | `#e6f3fb`   |
| background | `#f3f8fc` | `#0a2233`    | `#06131f` | `#e6f3fb`   |

Above those sit **active aliases** — declared on `:root` and defaulting to the light source. These
are the "currently selected" role value:

```css
--ori-color-primary: var(--ori-color-primary-light);
--ori-color-on-primary: var(--ori-color-on-primary-light);
/* …secondary, surface, background, each defaulting to its -light source */
```

Each alias defaults to its `*-light` source; flipping mode repoints all eight at once to the matching
`*-dark` (or back) source, and a skin overrides only those source tokens for the four roles — so a
component reading the alias never changes. _(How to flip mode and skin →
[Theming](/guides/theming).)_

### Status tokens — shared, own hues

Status colours carry their own meaning across every theme. They are **not** repointed by mode and
**not** overridden by skins — `success` is green everywhere.

| Token                    | Value                    |
| ------------------------ | ------------------------ |
| `--ori-color-success`    | `#15803d`                |
| `--ori-color-on-success` | `#ffffff`                |
| `--ori-color-warn`       | `#f59e0b`                |
| `--ori-color-on-warn`    | `var(--ori-neutral-950)` |
| `--ori-color-danger`     | `#b91c1c`                |
| `--ori-color-on-danger`  | `#ffffff`                |
| `--ori-color-info`       | `#1d4ed8`                |
| `--ori-color-on-info`    | `#ffffff`                |

### Tier 3 — the per-instance component alias

Components never read a role token directly. They read **one pair** — `--ori-color` (the surface)
and `--ori-color-on` (its legible foreground) — which default to `currentColor` so non-skinned use
(an avatar, an icon) stays sensible:

```css
--ori-color: currentColor;
--ori-color-on: currentColor;
```

A `.ori-color_*` utility class is what binds that pair to a role — the same **base class plus a scale
value** pair (`ori-color` + `ori-color_<name>`) that the component pages use. Each sets both aliases
at once:

| Class                   | `--ori-color` →               | `--ori-color-on` →               |
| ----------------------- | ----------------------------- | -------------------------------- |
| `.ori-color_primary`    | `var(--ori-color-primary)`    | `var(--ori-color-on-primary)`    |
| `.ori-color_secondary`  | `var(--ori-color-secondary)`  | `var(--ori-color-on-secondary)`  |
| `.ori-color_surface`    | `var(--ori-color-surface)`    | `var(--ori-color-on-surface)`    |
| `.ori-color_background` | `var(--ori-color-background)` | `var(--ori-color-on-background)` |
| `.ori-color_success`    | `var(--ori-color-success)`    | `var(--ori-color-on-success)`    |
| `.ori-color_warn`       | `var(--ori-color-warn)`       | `var(--ori-color-on-warn)`       |
| `.ori-color_danger`     | `var(--ori-color-danger)`     | `var(--ori-color-on-danger)`     |
| `.ori-color_info`       | `var(--ori-color-info)`       | `var(--ori-color-on-info)`       |

So the full colour chain reads: **neutral ramp / role source → active alias → `--ori-color` →
the component.** Switching a colour is one class swap — `ori-color_primary` → `ori-color_danger` —
and every layer above resolves through `var()` with nothing recomputed.

All eight role pairs resolving live — each swatch is the same `.ori-color_*` utility, only the role
changes. _(For the per-component usage of these classes, see [Button](/components/button).)_

::example
:ori-button{text="primary" color="primary"}
:ori-button{text="secondary" color="secondary"}
:ori-button{text="surface" color="surface"}
:ori-button{text="background" color="background"}
:ori-button{text="success" color="success"}
:ori-button{text="warn" color="warn"}
:ori-button{text="danger" color="danger"}
:ori-button{text="info" color="info"}
::

## Variants

A variant is a small token group — border, opacity, background, text — set from the resolved
`--ori-color` / `--ori-color-on` pair. Because variants read the alias, **colour and variant compose
freely**: any colour × any variant, no extra rules.

The base `.ori-variant` defaults to a transparent, full-opacity surface inheriting `currentColor`.
Each `.ori-variant_*` repoints the group:

| Variant    | background                                              | text                  | border             | opacity |
| ---------- | ------------------------------------------------------- | --------------------- | ------------------ | ------- |
| `_fill`    | `var(--ori-color)`                                      | `var(--ori-color-on)` | transparent        | `1`     |
| `_tonal`   | `color-mix(in srgb, var(--ori-color), transparent 75%)` | `var(--ori-color)`    | transparent        | `1`     |
| `_outline` | transparent                                             | `var(--ori-color)`    | `var(--ori-color)` | `1`     |
| `_text`    | transparent                                             | `var(--ori-color)`    | transparent        | `1`     |
| `_plain`   | transparent                                             | `var(--ori-color)`    | transparent        | `0.5`   |

Interaction state is derived from these same tokens, not stored — hover and `[data-active]` deepen
the `color-mix` per variant. (See the live behaviour on [Button](/components/button).)

::example
:ori-button{text="Fill" variant="fill"}
:ori-button{text="Tonal" variant="tonal"}
:ori-button{text="Outline" variant="outline"}
:ori-button{text="Text" variant="text"}
:ori-button{text="Plain" variant="plain"}
::

## Sizes — two tiers

The size axis drops the role tier. A family has a **raw scale** of fixed values and a single
**resolved alias** that components read; a `.ori-<family>_<step>` utility class repoints the alias
to one scale value. That is the entire pattern — `raw scale → alias → component`, switched by a
class.

### Action (control height)

`md` is `2.75rem` — 44px at the browser-default 16px root, meeting the iOS HIG ≥44pt and Android
Material ≥48dp touch-target minimums; `xs` / `sm` are compact opt-ins for dense or icon-only UI. The
alias `--ori-size-action` defaults to `var(--ori-size-action_text)` (`1em`, i.e. font-driven).

| Token / step             | Value     |
| ------------------------ | --------- |
| `--ori-size-action_text` | `1em`     |
| `--ori-size-action_xs`   | `1.25rem` |
| `--ori-size-action_sm`   | `1.5rem`  |
| `--ori-size-action_md`   | `2.75rem` |
| `--ori-size-action_lg`   | `3rem`    |
| `--ori-size-action_xl`   | `3.75rem` |
| `--ori-size-action_xxl`  | `4.25rem` |

### Action-space (control padding)

Padding scale paired with action height; alias `--ori-size-action-space` defaults to
`var(--ori-size-action-space_text)` (`0`).

| Token / step                   | Value      |
| ------------------------------ | ---------- |
| `--ori-size-action-space_text` | `0`        |
| `--ori-size-action-space_xs`   | `0.625rem` |
| `--ori-size-action-space_sm`   | `0.75rem`  |
| `--ori-size-action-space_md`   | `0.625rem` |
| `--ori-size-action-space_lg`   | `0.75rem`  |
| `--ori-size-action-space_xl`   | `0.625rem` |
| `--ori-size-action-space_xxl`  | `0.75rem`  |

### Radius

Corners, computed from `md` (`0.5rem`) by a `0.125rem` step. Alias `--ori-size-radius` defaults to
`var(--ori-size-radius_md)`. Like the other scales, the raw values live at `:root`; the
`.ori-size-radius_*` utilities (in `ori.utilities`) only repoint the alias. There is no `_xxl`.

| Token / step                | Value (computed) |
| --------------------------- | ---------------- |
| `--ori-size-radius_zero`    | `0`              |
| `--ori-size-radius_xs`      | `0.125rem`       |
| `--ori-size-radius_sm`      | `0.25rem`        |
| `--ori-size-radius_md`      | `0.5rem`         |
| `--ori-size-radius_lg`      | `0.75rem`        |
| `--ori-size-radius_xl`      | `1rem`           |
| `--ori-size-radius_rounded` | `9999px`         |

### Gap

Spacing between items, same `md`/step derivation as radius. Alias `--ori-size-gap` defaults to
`var(--ori-size-gap_md)`. The `_xxl` raw token (`1.5rem`) exists but has **no repointing utility
class** — it is reachable only by reading the token directly.

| Token / step          | Value (computed)    |
| --------------------- | ------------------- |
| `--ori-size-gap_zero` | `0`                 |
| `--ori-size-gap_xs`   | `0.125rem`          |
| `--ori-size-gap_sm`   | `0.25rem`           |
| `--ori-size-gap_md`   | `0.5rem`            |
| `--ori-size-gap_lg`   | `0.75rem`           |
| `--ori-size-gap_xl`   | `1rem`              |
| `--ori-size-gap_xxl`  | `1.5rem` (no class) |

### Screen (breakpoints)

Pure constants for `@media` queries and consumer use — **no alias, no utility class.** You read these
directly.

| Token                   | Value    |
| ----------------------- | -------- |
| `--ori-size-screen_xs`  | `600px`  |
| `--ori-size-screen_sm`  | `840px`  |
| `--ori-size-screen_md`  | `1200px` |
| `--ori-size-screen_lg`  | `1600px` |
| `--ori-size-screen_xl`  | `1920px` |
| `--ori-size-screen_xxl` | `2560px` |

## Fonts — font-size

The type scale follows the same two-tier pattern, derived from `md` (`1rem`) by a `0.125rem` step. The
raw scale lives at `:root` and the `.ori-font-size_*` utilities repoint the alias; `--ori-font-size`
defaults to `var(--ori-font-size_text)` (`1em`, i.e. inherit).

| Token / step           | Value (computed) |
| ---------------------- | ---------------- |
| `--ori-font-size_text` | `1em`            |
| `--ori-font-size_xs`   | `0.75rem`        |
| `--ori-font-size_sm`   | `0.875rem`       |
| `--ori-font-size_md`   | `1rem`           |
| `--ori-font-size_lg`   | `1.125rem`       |
| `--ori-font-size_xl`   | `1.25rem`        |
| `--ori-font-size_xxl`  | `1.375rem`       |

Nothing pins the root: the size/font scales are `rem`, so they resolve against the user's browser
font-size setting (16px by default — at which the scales compute to their historical px values).

## Elevation — shadow tokens

Soft, cool-tinted shadows, **theme-aware**. Light tints with the neutral ink ramp at low alpha; dark
leans on deeper black plus a hairline highlight ring. Components read these directly.

Light (`:root`) — tinted with the neutral ink ramp at low alpha (`color-mix(in srgb, …, transparent)`):

| Token               | Value                                                            |
| ------------------- | ---------------------------------------------------------------- |
| `--ori-shadow-sm`   | `0 1px 2px (neutral-900 8%)`                                     |
| `--ori-shadow-md`   | `0 1px 2px (neutral-900 6%), 0 6px 16px -4px (neutral-900 12%)`  |
| `--ori-shadow-lg`   | `0 2px 4px (neutral-900 6%), 0 14px 36px -8px (neutral-900 18%)` |
| `--ori-shadow-ring` | `0 0 0 1px (neutral-900 8%)`                                     |

Dark (`:root.dark`, `.ori-theme_dark`) — deeper `#000000` shadow at higher alpha, and a `#ffffff 9%`
hairline highlight ring instead of an ink ring:

| Token               | Value                                               |
| ------------------- | --------------------------------------------------- |
| `--ori-shadow-sm`   | `0 1px 2px (#000 45%)`                              |
| `--ori-shadow-md`   | `0 1px 2px (#000 45%), 0 8px 24px -6px (#000 60%)`  |
| `--ori-shadow-lg`   | `0 2px 4px (#000 45%), 0 16px 40px -8px (#000 70%)` |
| `--ori-shadow-ring` | `0 0 0 1px (#fff 9%)`                               |

_(Alpha pairs are shorthand for `color-mix(in srgb, <color> <pct>, transparent)` — see the styles
source for the literal declarations.)_

## Why this enables zero-runtime theming

Every value above resolves through `var()` indirection, and components read **only the resolved
alias** — so the whole catalog is repointed by a class or attribute toggle, never by JavaScript. The
zero-runtime mechanics that ride on that — flipping mode, switching skins, and one-off overrides —
live in [Theming](/guides/theming) and [Customization](/guides/customization). The same tokens feed
the styled Vue components, the standalone [CSS layer](/guides/css), and the
[headless core](/headless/core), so you can move between layers, or reskin all of them, without a
rewrite.

## See also

- [Theming](/guides/theming) — switch whole palettes and modes, and author a new named skin.
- [Customization](/guides/customization) — one-off token overrides and per-instance tweaks, without
  authoring a whole skin.
- [Using the CSS layer](/guides/css) — applying these tokens with the standalone `.ori-*` classes in
  htmx, Astro, or plain HTML.
- [Get started](/overview/get-started) · [Button](/components/button) · [Headless core](/headless/core)
