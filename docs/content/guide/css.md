---
title: Using the CSS layer
---

# Using the CSS layer

oriUI is three independent layers woven around one set of design tokens. The **`oriui/css`** layer is
just standalone `.ori-*` classes plus the token theming — **no Vue, no build step, no Tailwind**. You
ship the stylesheet and write classes. This is how oriUI works with **htmx, Astro, or plain HTML** —
the DaisyUI niche, minus Tailwind.

The live previews below are rendered from **raw HTML** (no Vue component) — flip to the **HTML** tab to
see the exact markup.

## Setup

From a bundler, import the stylesheet once:

```ts
import 'oriui/css';
```

Or drop it in with no build step at all:

```html
<link rel="stylesheet" href="https://unpkg.com/oriui/dist/styles/styles.css" />
```

## Compose with classes

Every component is built from the **same token-driven classes**: a block class (`ori-button`) plus
paired utilities — `ori-size-action ori-size-action_md` (sizing), `ori-size-radius ori-size-radius_rounded`
(corners), `ori-font-size ori-font-size_md`, `ori-variant ori-variant_fill`, and
`ori-color ori-color_primary`. Each pair is a base class + a scale value, so a class can repoint a
single token. Here are three buttons built entirely from CSS — no framework:

::example
<button class="ori-button ori-size-action ori-size-action_md ori-size-radius ori-size-radius_rounded ori-font-size ori-font-size_md ori-variant ori-variant_fill ori-color ori-color_primary">Fill</button>
<button class="ori-button ori-size-action ori-size-action_md ori-size-radius ori-size-radius_rounded ori-font-size ori-font-size_md ori-variant ori-variant_tonal ori-color ori-color_primary">Tonal</button>
<button class="ori-button ori-size-action ori-size-action_md ori-size-radius ori-size-radius_rounded ori-font-size ori-font-size_md ori-variant ori-variant_outline ori-color ori-color_primary">Outline</button>

#html

```html
<button
    class="ori-button ori-size-action ori-size-action_md ori-size-radius ori-size-radius_rounded
               ori-font-size ori-font-size_md ori-variant ori-variant_fill ori-color ori-color_primary"
>
    Fill
</button>

<!-- swap the last two pairs for other looks -->
<button class="ori-button … ori-variant ori-variant_tonal ori-color ori-color_primary">Tonal</button>
<button class="ori-button … ori-variant ori-variant_outline ori-color ori-color_danger">Outline · danger</button>
```

::

The verbosity is deliberate: the same compound classes are what give the CSS layer its ergonomics and
let any single token be repointed. Swap `ori-color_primary` → `ori-color_danger`, or
`ori-size-action_md` → `ori-size-action_lg`, and nothing else changes.

## State via attributes

Dynamic state is expressed as **real attributes**, not classes — so it stays accessible and behaves
identically across every layer (Vue, Svelte, htmx, plain HTML):

::example
<button class="ori-button ori-size-action ori-size-action_md ori-size-radius ori-size-radius_rounded ori-font-size ori-font-size_md ori-variant ori-variant_fill ori-color ori-color_primary" disabled>Disabled</button>
<button class="ori-button ori-size-action ori-size-action_md ori-size-radius ori-size-radius_rounded ori-font-size ori-font-size_md ori-variant ori-variant_fill ori-color ori-color_success" aria-busy="true">Loading</button>

#html

```html
<button class="ori-button … ori-variant ori-variant_fill ori-color ori-color_primary" disabled>Disabled</button>
<button class="ori-button … ori-variant ori-variant_fill ori-color ori-color_success" aria-busy="true">Loading</button>
```

::

## Theming — zero runtime

Theme and skin are just attributes on `<html>`; flipping them reskins everything through CSS custom
properties, with **no JavaScript**:

```html
<html class="dark" data-ori-skin="cyber">
    ...
</html>
```

- `class="dark"` → dark mode (omit for light).
- `data-ori-skin="sumi | indigo | tech | health | luxury | cyber"` → a preset skin (omit for the
  default **Ori** skin).

A three-line inline script is enough to persist a user's choice, or the server can set the attributes
per request. With **htmx**, fragments you swap in are already themed — CSS transitions compose with
`hx-swap`, no hydration.

## Where each layer fits

| Target                 | `oriui` (Vue) | `oriui/css` (classes) |     `oriui/headless`     |
| ---------------------- | :-----------: | :-------------------: | :----------------------: |
| Vue / Nuxt             |    ✅ best    |          ✅           |            ✅            |
| Svelte / SvelteKit     |       —       |          ✅           |        ⚠️ planned        |
| htmx / server-rendered |       —       |       ✅ ideal        | ⚠️ Zag-vanilla (planned) |
| Astro / 11ty (static)  |  island only  |       ✅ ideal        |            —             |
| Plain HTML / CDN       |       —       |          ✅           |            —             |
| Capacitor / Electron   |      ✅       |          ✅           |            ✅            |

The **CSS layer works everywhere** — that's the whole point. Only complex behavior (focus traps,
menus, comboboxes) needs the headless layer, which is Vue today; a vanilla adapter (via Zag) is
planned for the no-framework targets.

Per-component class references live on each component page — flip any example to the **Svelte** tab;
that standalone markup is exactly what you'd use in htmx, Astro, or plain HTML.
