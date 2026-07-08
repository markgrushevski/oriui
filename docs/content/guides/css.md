---
title: Using the CSS layer
---

# Using the CSS layer

oriUI is three independent layers woven around one set of design tokens. The **`@oriui/css`** layer is
just standalone `.ori-*` classes plus the token theming — **no Vue, no build step, no Tailwind**. You
ship the stylesheet and write classes. This is how oriUI works with **htmx, Astro, or plain HTML** —
the DaisyUI niche, minus Tailwind.

The live previews below are rendered from **raw HTML** (no Vue component) — flip to the **HTML** tab to
see the exact markup.

## Setup

From a bundler, import the stylesheet once:

```ts
import '@oriui/css';
```

Or drop it in with no build step at all:

```html
<link rel="stylesheet" href="https://unpkg.com/@oriui/css/dist/styles.css" />
```

## How the classes compose

Every component is a **block class** plus **single-class token utilities** — one class repoints one
token, no paired base class: `ori-<name>_<size>` (size sugar), `ori-size-radius_*` (corners),
`ori-font-size_*`, `ori-variant_*` (style), and `ori-color_*` (color). The block **bakes sensible
defaults**, so a bare block is already valid — you add a class only to override an axis:

```html
<!-- a bare block is a valid filled, primary, rounded, md button -->
<button class="ori-button">Button</button>

<!-- override only what differs -->
<button class="ori-button ori-button_lg ori-variant_tonal ori-color_danger">Button</button>
```

Swap `ori-variant_fill` → `_tonal`, or `ori-color_primary` → `ori-color_danger`, and nothing else
changes — each class repoints exactly one CSS variable the component reads. It is the **same markup**
whether rendered from Vue, Svelte, htmx, Astro, or hand-written HTML. Dynamic state is real
**attributes**, not classes (`disabled`, `aria-busy="true"`, `aria-pressed`), so it stays accessible
and identical across every layer.

> **Why single-class?** Every utility lives in the last cascade layer (`@layer ori.utilities`) and
> sets one token — e.g. `.ori-color_danger { --ori-color: … }` — so it wins over the block's baked
> default by layer order, not specificity. There is no "base + value" pair to remember (forgetting
> the base used to be a silent no-op). **Size** is the one axis with a component-scoped sugar
> (`ori-button_lg`, `ori-input_md`, `ori-avatar_xs`) because it is the most-swapped; under the hood it
> repoints the same `--ori-size-action` token, so `<input class="ori-input__field ori-size-action_lg">`
> works too.

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
- `data-ori-skin="sumi | indigo | tech | health | luxury | neutral | cyber"` → a preset skin (omit for
  the default **Ori** skin).

A three-line inline script is enough to persist a user's choice, or the server can set the attributes
per request. With **htmx**, fragments you swap in are already themed — CSS transitions compose with
`hx-swap`, no hydration.

## Where each layer fits

The **CSS layer works everywhere** — that's the whole point. Vue and the headless layer need a JS
framework; the classes don't. Only complex behavior (focus traps, menus, comboboxes) needs the
headless layer, which is Vue today; a vanilla adapter (via Zag) is planned for the no-framework
targets. For the full cross-layer breakdown (Vue / Svelte / htmx / Astro / plain HTML / Capacitor),
see the [applicability matrix](/overview/introduction#where-each-layer-fits) in the Introduction.

Per-component class references live on each component page — flip any example to the **HTML** tab;
that standalone markup is exactly what you'd use in htmx, Astro, or plain HTML.
