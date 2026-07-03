---
title: Applicability
---

# Applicability

oriUI is three independently-consumable layers woven around one token contract. The promise is
**prototype fast, scale without rewriting**: reach for the styled Vue components first, drop to the
headless behaviour when you need control, or drop to the standalone CSS when you leave Vue entirely —
without changing your design tokens. This page maps each layer to where it runs.

## Layer × environment

| Layer                            | Vue 3 | Svelte 5 | Astro | htmx / plain HTML |
| -------------------------------- | :---: | :------: | :---: | :---------------: |
| `@oriui/css` (classes + tokens)  |  ✅   |    ✅    |  ✅   |        ✅         |
| `@oriui/headless` (core engine)  |  ✅¹  |   ✅¹    |  ⚠️²  |        ⚠️²        |
| `@oriui/headless/vue`            |  ✅   |    —     |  ⚠️³  |         —         |
| `@oriui/headless/svelte`         |   —   |    ✅    |  ⚠️³  |         —         |
| `@oriui/vue` (styled components) |  ✅   |    —     |  ⚠️³  |         —         |

✅ first-class · ⚠️ works with a caveat · — use a different layer instead.

1. Through the matching adapter — `@oriui/headless/vue` (Vue `ComputedRef`s) or `@oriui/headless/svelte`
   (Svelte stores). The core itself imports no framework.
2. The core is framework-agnostic building blocks (state machine + prop-getters), so it runs anywhere
   JavaScript does — but you wire the DOM binding yourself. A no-framework / htmx adapter is deferred
   (see [ROADMAP](https://github.com/markgrushevski/oriui/blob/main/ROADMAP.md)); until then, use the
   `.ori-*` classes for the look and hand-roll the small amount of behaviour.
3. Inside an [Astro island](https://docs.astro.build/en/guides/framework-components/) for that framework
   (`client:load` / `client:visible`); Astro renders the Vue or Svelte component as usual.

## Runtimes follow their framework

The columns above are the **rendering environments**. The **runtime shells** below just host one of
them, so they inherit that column's support:

| Runtime                | Inherits         | Notes                                                                                                         |
| ---------------------- | ---------------- | ------------------------------------------------------------------------------------------------------------- |
| **Nuxt** / Vite SSR    | Vue 3            | `@oriui/vue` is SSR-safe: SSR-stable ids (`useId`), native `<dialog>` (no `<Teleport>` gymnastics).           |
| **SvelteKit**          | Svelte 5         | `@oriui/headless/svelte` seeds stores from the machine's initial state; pass an explicit `id` for stable SSR. |
| **Capacitor** (hybrid) | Vue 3 / Svelte 5 | A web app in a native shell — whatever your web framework supports.                                           |
| **Electron**           | Vue 3 / Svelte 5 | Same: a web renderer, so the framework column applies unchanged.                                              |

## Zero-runtime everywhere

Theming is the one guarantee that holds across **every** cell: skin and light/dark are pure attribute
toggles on `<html>` that repoint CSS custom properties, so a Vue app, a Svelte island, an htmx fragment,
and a plain HTML page all reskin identically — no JavaScript, no recompute. See
[Theming](/guides/theming) and the [Skin gallery](/guides/skins).
