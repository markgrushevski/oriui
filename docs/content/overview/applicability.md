---
title: Applicability
---

# Applicability

Where each oriUI package runs. The CSS works everywhere, the components are Vue, and the headless
composables have a Vue adapter, with Svelte and React adapters in development.

## Layer × environment

| Layer                            | Vue 3 | Svelte 5 | React 18/19 | Astro | htmx / plain HTML |
| -------------------------------- | :---: | :------: | :---------: | :---: | :---------------: |
| `@oriui/css` (classes + tokens)  |  ✅   |    ✅    |     ✅      |  ✅   |        ✅         |
| `@oriui/headless` (core engine)  |  ✅¹  |   🚧¹    |     🚧¹     |  ⚠️²  |        ⚠️²        |
| `@oriui/headless/vue`            |  ✅   |    —     |      —      |  ⚠️³  |         —         |
| `@oriui/headless/svelte`         |   —   |    🚧    |      —      |  ⚠️³  |         —         |
| `@oriui/headless/react`          |   —   |    —     |     🚧      |  ⚠️³  |         —         |
| `@oriui/vue` (styled components) |  ✅   |    —     |      —      |  ⚠️³  |         —         |

✅ ready · 🚧 in development: works, but not ready for production and the API may change · ⚠️ works
with a caveat · — use a different package instead.

1. Through the matching adapter — `@oriui/headless/vue` (Vue `ComputedRef`s), `@oriui/headless/svelte`
   (Svelte stores) or `@oriui/headless/react` (plain values via `useSyncExternalStore`). The core itself
   imports no framework, and each framework is an **optional** peer dependency.
2. The core is framework-agnostic building blocks (state machine + prop-getters), so it runs anywhere
   JavaScript does — but you wire the DOM binding yourself. There is no no-framework / htmx adapter yet;
   use the `.ori-*` classes for the look and hand-roll the small amount of behavior.
3. Inside an [Astro island](https://docs.astro.build/en/guides/framework-components/) for that framework
   (`client:load` / `client:visible`); Astro renders the Vue, Svelte or React component as usual.

## Runtimes follow their framework

The columns above are the **rendering environments**. The **runtime shells** below just host one of
them, so they inherit that column's support:

| Runtime                | Inherits         | Notes                                                                                                                                                                                |
| ---------------------- | ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Nuxt** / Vite SSR    | Vue 3            | `@oriui/vue` is SSR-safe: SSR-stable ids (`useId`), native `<dialog>` (no `<Teleport>` gymnastics).                                                                                  |
| **SvelteKit**          | Svelte 5         | In development. `@oriui/headless/svelte` seeds stores from the machine's initial state; pass an explicit `id` for stable SSR.                                                        |
| **Next.js**            | React 18/19      | The hooks are in development and are client state — mark the component `'use client'`. `@oriui/css` is a plain stylesheet: import it in the root layout, server components included. |
| **Capacitor** (hybrid) | Vue 3 / Svelte 5 | A web app in a native shell — whatever your web framework supports.                                                                                                                  |
| **Electron**           | Vue 3 / Svelte 5 | Same: a web renderer, so the framework column applies unchanged.                                                                                                                     |

## Theming works everywhere

Theming holds across **every** cell: skin and light/dark are attributes on `<html>` that repoint CSS
custom properties, so a Vue app, a Svelte island, an htmx fragment and a plain HTML page all reskin the
same way, with no colors computed in JavaScript. See
[Theming](/guides/theming) and the [Skin gallery](/guides/skins).
