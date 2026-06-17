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

## How the classes compose

Every component is built from a **block class** plus **paired token utilities** — `ori-size-action_*`
(sizing), `ori-size-radius_*` (corners), `ori-font-size_*`, `ori-variant_*` (style), and
`ori-color_*` (color). Each pair is a base class plus a scale value, so a single class repoints a
single token:

```html
<button
    class="ori-button
               ori-size-action ori-size-action_md
               ori-size-radius ori-size-radius_rounded
               ori-font-size ori-font-size_md
               ori-variant ori-variant_fill
               ori-color ori-color_primary"
>
    Button
</button>
```

Swap `ori-variant_fill` → `_tonal`, or `ori-color_primary` → `ori-color_danger`, and nothing else
changes. The verbosity is the point — it is what lets any single token be repointed, and it is the
**same markup** whether rendered from Vue, Svelte, htmx, Astro, or hand-written HTML. Dynamic state
is real **attributes**, not classes (`disabled`, `aria-busy="true"`, `aria-pressed`), so it stays
accessible and identical across every layer.

> Per-component class tables and live examples (each with an **HTML** tab — the canonical,
> copy-pasteable markup) live on the component pages, e.g. [Button](/components/button). This guide
> covers only the cross-cutting concerns below: setup, theming, and where each layer fits.

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
