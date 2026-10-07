---
title: Applicability
---

# Applicability

Where each oriUI package runs. The CSS works everywhere, the components are Vue, and the headless
composables have a Vue adapter.

## Layer × environment

| Layer                            | Vue 3 | Svelte 5 | React 18/19 | Astro | htmx / plain HTML |
| -------------------------------- | :---: | :------: | :---------: | :---: | :---------------: |
| `@oriui/css` (classes + tokens)  |  ✅   |    ✅    |     ✅      |  ✅   |        ✅         |
| `@oriui/headless` (core engine)  |  ✅¹  |   ⚠️²    |     ⚠️²     |  ⚠️²  |        ⚠️²        |
| `@oriui/headless/vue`            |  ✅   |    —     |      —      |  ⚠️³  |         —         |
| `@oriui/vue` (styled components) |  ✅   |    —     |      —      |  ⚠️³  |         —         |

✅ ready · ⚠️ works with a caveat · — use a different package instead.

1. Through `@oriui/headless/vue`, which returns Vue `ComputedRef`s. The core itself imports no
   framework, and Vue is an **optional** peer dependency.
2. The core is framework-agnostic building blocks (state machine + prop-getters), so it runs anywhere
   JavaScript does — but you wire the DOM binding yourself: there is an adapter for Vue only. Use the
   `.ori-*` classes for the look and hand-roll the small amount of behavior.
3. Inside a Vue [Astro island](https://docs.astro.build/en/guides/framework-components/)
   (`client:load` / `client:visible`); Astro renders the Vue component as usual.

## Runtimes follow their framework

The columns above are the **rendering environments**. The **runtime shells** below just host one of
them, so they inherit that column's support:

| Runtime                | Inherits       | Notes                                                                                                              |
| ---------------------- | -------------- | ------------------------------------------------------------------------------------------------------------------ |
| **Nuxt** / Vite SSR    | Vue 3          | `@oriui/vue` is SSR-safe: SSR-stable ids (`useId`), native `<dialog>` (no `<Teleport>` gymnastics).                |
| **SvelteKit**          | Svelte 5       | `@oriui/css`, a plain stylesheet imported once in the root layout; the headless core with your own DOM wiring.     |
| **Next.js**            | React 18/19    | `@oriui/css`, imported in the root layout, server components included; the headless core with your own DOM wiring. |
| **Capacitor** (hybrid) | Your framework | A web app in a native shell — whatever your web framework supports.                                                |
| **Electron**           | Your framework | Same: a web renderer, so the framework column applies unchanged.                                                   |

## Theming works everywhere

Theming holds across **every** cell: skin and light/dark are attributes on `<html>` that repoint CSS
custom properties, so a Vue app, a Svelte island, an htmx fragment and a plain HTML page all reskin the
same way, with no colors computed in JavaScript. See
[Theming](/guides/theming) and the [Skin gallery](/guides/skins).
