---
title: Comparisons
---

# Comparisons

oriUI combines three things that usually come separately: a CSS design system that needs no JavaScript,
styled Vue components, and headless behavior. This page sets it next to the libraries it learns from.
It has fewer components than most of them: we add one when an app built on oriUI needs it.

|                   | CSS without a framework | Styled components            | Headless behavior                     | Theming                  |
| ----------------- | ----------------------- | ---------------------------- | ------------------------------------- | ------------------------ |
| **oriUI**         | ✅ plain CSS            | Vue                          | Vue (Svelte and React in development) | CSS custom properties    |
| daisyUI           | a Tailwind plugin       | —                            | —                                     | CSS custom properties    |
| Ark UI (Zag)      | —                       | —                            | React, Vue, Solid, Svelte             | unstyled                 |
| Reka UI           | —                       | —                            | Vue                                   | unstyled                 |
| Radix Primitives  | —                       | —                            | React                                 | unstyled                 |
| Headless UI       | —                       | —                            | React, Vue                            | unstyled                 |
| shadcn/ui         | —                       | React, copied into your code | through Radix                         | Tailwind + CSS variables |
| Vuetify, PrimeVue | —                       | Vue                          | —                                     | configured in JavaScript |

Every project here is good at what it set out to do; the table compares design intent, not quality.

## Headless libraries: Ark UI, Zag, Reka, Radix, Headless UI

Our behavior layer borrows the most from these. Its shape, a state machine whose `connect` returns prop
bags you spread onto your own elements, follows Zag and Ark UI. The difference is the role it plays: in
oriUI the headless layer is what the Vue components run on, and the CSS exists without it. The engine
itself is small and hand-written, and the `OriHeadless` contract lets you register another one, such as
a Zag machine behind your own adapter, for a widget that needs it.

## CSS kits: daisyUI

daisyUI is the model for the CSS layer: semantic component classes instead of long utility lists. oriUI
keeps that feel without the Tailwind build step. The `.ori-*` classes are plain CSS inside `@layer`,
themed by custom properties, and ship as is to htmx, Astro or hand-written HTML.

## Tokens and distribution: Open Props, shadcn/ui, Panda

Open Props is the closest sibling on the token side: design tokens as plain custom properties. shadcn/ui
copies React and Tailwind components into your project, and Panda generates CSS at build time. oriUI
ships one stylesheet instead, and a skin or dark mode is one attribute on `<html>`.

## Full component libraries: Vuetify, PrimeVue, Element Plus

These have far more components. Their themes are configured in JavaScript; oriUI's theme is the set of
CSS custom properties, so you customize it in your own stylesheet. See [Customization](/guides/customization).

## Positioning: Floating UI

For overlays oriUI uses the platform, the Popover API and CSS anchor positioning, instead of a JavaScript
positioner such as Floating UI. Floating UI remains the model to fall back on if a target needs browsers
without anchor positioning.
