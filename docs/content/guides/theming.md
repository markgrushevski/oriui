---
title: Theming
---

# Theming

A theme is a **mode** (light or dark) layered over a **skin** (a named palette). Both are pure
attribute toggles on `<html>` — flipping either repoints the active `--ori-color-*` aliases through
CSS custom properties, so everything reskins at once with **no JavaScript, no recompute, no flash**.
This is the same zero-runtime story across every layer: a Vue app, the standalone `@oriui/css`
classes, htmx fragments, or hand-written HTML all theme identically.

This guide covers **switching whole palettes and modes** and **authoring a new named skin**. The
token catalog itself lives in [Design tokens](/guides/design-tokens); one-off token overrides and
per-instance tweaks live in [Customization](/guides/customization).

## Light and dark

Every semantic role ships a `*-light` and a `*-dark` source token. The active alias the components
read — `--ori-color-primary`, `--ori-color-surface`, and so on — defaults to the light source on a
bare `:root`. Two explicit selectors repoint all eight active aliases and set `color-scheme`:

| Mode  | Selector                          | Effect                                                      |
| ----- | --------------------------------- | ----------------------------------------------------------- |
| Light | `:root.light`, `.ori-theme_light` | `color-scheme: light` + every alias → its `*-light` source. |
| Dark  | `:root.dark`, `.ori-theme_dark`   | `color-scheme: dark` + every alias → its `*-dark` source.   |

So dark mode is one class on the root element:

```html
<html class="dark">
    ...
</html>
```

`color-scheme` is part of the contract — it makes native form controls, scrollbars, and the
`prefers-color-scheme` UA defaults match the theme. The **status hues** (`success` · `warn` ·
`danger` · `info`) and the `--ori-color` / `--ori-color-on` component aliases are **not** touched by
the mode selectors — only the four skinnable roles repoint. Elevation shadows are mode-aware too: the
dark theme swaps the tinted-ink shadows for deeper black plus a hairline highlight ring.

## Built-in skins

A skin overrides only the `--ori-color-<role>-<light|dark>` **source** tokens for the four skinnable
roles — `primary`, `secondary`, `surface`, `background` (plus their `on-` pairs). It touches nothing
else: the light/dark machinery above resolves on top, so **every skin works in both modes** for free,
and the status hues stay shared across all skins.

Switching is a **single attribute** on `<html>` — zero runtime:

```html
<html data-ori-skin="cyber">
    ...
</html>
```

The default skin is **Ori** (luminous azure → glowing cyan) — applied when **no** `data-ori-skin`
attribute is present. Seven presets ship alongside it:

| `data-ori-skin` | Skin    | Palette                                                      |
| --------------- | ------- | ------------------------------------------------------------ |
| _(omitted)_     | Ori     | Luminous azure on ink and cool white — the default.          |
| `sumi`          | Sumi    | Graphite ink on warm washi paper (墨). Strict WCAG AA.       |
| `indigo`        | Indigo  | Calm indigo on cool grey — oriUI's previous default.         |
| `tech`          | Tech    | Cool cyan on slate — SaaS / developer-tool register.         |
| `health`        | Health  | Calm emerald on mint — medical / wellness.                   |
| `luxury`        | Luxury  | Deep gold on warm paper / charcoal — editorial / premium.    |
| `neutral`       | Neutral | Pure grays, monochrome accent — chrome for colorful content. |
| `cyber`         | Cyber   | Neon fuchsia on near-black — bold / nightlife.               |

Mode and skin compose — set both at once:

```html
<html class="dark" data-ori-skin="luxury">
    ...
</html>
```

Skinned color flows straight into the styled components and the `.ori-*` classes — a primary button
under `data-ori-skin="cyber"` is neon fuchsia, with its contrast-checked `on-` text following
automatically:

::example
:ori-button{text="Primary" color="primary"}
:ori-button{text="Secondary" color="secondary" variant="tonal"}
:ori-button{text="Surface" color="surface" variant="outline"}

#vue

```vue
<!-- skin + mode are set on <html>; components inherit the active palette -->
<OriButton text="Primary" color="primary" />
<OriButton text="Secondary" color="secondary" variant="tonal" />
<OriButton text="Surface" color="surface" variant="outline" />
```

#html

```html
<!-- skin + mode live on <html>; only the color pair changes per button -->
<button class="ori-button ori-variant ori-variant_fill ori-color ori-color_primary">Primary</button>
<button class="ori-button ori-variant ori-variant_tonal ori-color ori-color_secondary">Secondary</button>
<button class="ori-button ori-variant ori-variant_outline ori-color ori-color_surface">Surface</button>
```

::

## Scoping a skin or mode to a subtree

The mode and skin selectors come in two forms on purpose. The `:root.dark` / `:root[data-ori-skin]`
form is the page-level switch on `<html>`. The parallel `.ori-theme_dark` / `.ori-theme_light` class
repoints the active aliases on **any** element, so you can theme a region — a dark hero, a preview
card, an email-compose pane — without touching the page:

```html
<!-- the whole page is light; this panel renders dark -->
<section class="ori-theme_dark">
    <div class="ori-card … ori-color ori-color_surface">Always-dark panel</div>
</section>
```

One caveat: **skins are page-level today.** The active color alias resolves at `:root`, so
`data-ori-skin` only takes effect on the root element — you can scope a **mode** to a subtree, but not
yet a different **skin** per subtree (that needs a `light-dark()` restructure and is planned). Mode
scoping works anywhere.

## Setting the initial theme — no hydration flash

Because theming is just attributes, the **server can set them per request** from a cookie or user
preference, and the markup arrives already themed — nothing to hydrate, no flash. For a client-only
app, a tiny **pre-paint inline script** in `<head>` (before any stylesheet paints) reads the saved
choice and sets the attributes synchronously:

```html
<script>
    // runs before first paint — no flash of the wrong theme
    // (the storage keys are yours to choose — these mirror this site's convention)
    var s = localStorage.getItem('ori-skin');
    var m = localStorage.getItem('ori-theme');
    if (m === 'dark') document.documentElement.classList.add('ori-theme_dark');
    if (s) document.documentElement.setAttribute('data-ori-skin', s);
</script>
```

Setting the attributes **before** first render is always safe — there is no rendered tree to update
yet. Runtime switches are the case that needs one small helper (below).

## Switching the mode at runtime

When a user flips dark mode _after_ the page has rendered, `@oriui/headless` ships `applyTheme` (and
the `useTheme` composable on top). **Prefer them over a bare `classList.toggle`** — they flip the
class _and_ work around a browser quirk:

> **Why not just toggle the class?** In current Chromium, changing the theme class at runtime can leave
> already-rendered components painting the **previous** theme's colours until they next re-render — the
> engine misses a style invalidation for the element-scoped custom properties every oriUI component
> bakes. `applyTheme` forces the affected subtree to re-resolve in the same tick, so the switch is
> correct immediately. (Setting the theme before first paint — server or the inline script above — never
> hits this: nothing is rendered yet.)

In a **Vue** app, `useTheme` owns the reactive state, persistence, and `auto` (live OS scheme), and
applies each change through the fix:

```vue
<script setup lang="ts">
import { useTheme } from '@oriui/headless/vue';

const { resolvedTheme, setTheme, toggleTheme, cycleTheme } = useTheme({
    storageKey: 'ori-theme', // persisted to localStorage; null to disable
    default: 'auto' // 'auto' follows prefers-color-scheme live; or 'light' / 'dark'
});
</script>

<template>
    <button @click="cycleTheme">Theme: {{ resolvedTheme }}</button>
</template>
```

`resolvedTheme` is the applied `'light'` / `'dark'`; `theme` is the setting (`'auto'` included).
`setTheme(mode)` pins a choice, `toggleTheme()` flips light ⇄ dark, `cycleTheme()` goes
`auto → light → dark`. A Svelte store twin ships at `@oriui/headless/svelte` (`$theme.resolvedTheme`

- the same setters). For **SSR** (e.g. Nuxt), keep the inline head script for the first paint — the
  composable is inert on the server and takes over on the client.

Have your own theme store, or vanilla JS? Call the low-level **`applyTheme`** exactly where you would
have toggled the class:

```ts
import { applyTheme } from '@oriui/headless';

// sets ori-theme_{dark,light} on <html> AND re-resolves the components — the drop-in for classList.toggle
applyTheme(isDark ? 'dark' : 'light');
```

The same invalidation applies to **any** runtime change of an inherited colour token: if you switch
`data-ori-skin` at runtime, call `flushThemeInvalidation(document.body)` (also from `@oriui/headless`)
right after the attribute write, for the same reason. Changing the skin **before** render never needs
it.

With **htmx** or server-rendered fragments, swapped-in HTML inherits the root attributes and is themed
on arrival — the fresh nodes resolve correctly on insertion, so there's nothing extra to call there
either.

## Authoring a custom skin

A skin is a plain CSS block that overrides the four role source tokens for both modes. Follow the
built-in pattern: scope it to `:root[data-ori-skin='<id>']`, set the eight `*-light` tokens and the
eight `*-dark` tokens (each role plus its `on-` pair), and let the light/dark machinery above resolve
the rest. You don't redefine status hues, elevation, or component aliases — they're inherited.

```css
/* a "brand" skin — emerald brand color on a warm-neutral page */
:root[data-ori-skin='brand'] {
    /* --- light --- */
    --ori-color-primary-light: #0f766e;
    --ori-color-on-primary-light: #ffffff;
    --ori-color-secondary-light: #ccfbf1;
    --ori-color-on-secondary-light: #134e4a;
    --ori-color-surface-light: #ffffff;
    --ori-color-on-surface-light: #14302c;
    --ori-color-background-light: #f3f8f6;
    --ori-color-on-background-light: #14302c;

    /* --- dark --- */
    --ori-color-primary-dark: #2dd4bf;
    --ori-color-on-primary-dark: #04201c;
    --ori-color-secondary-dark: #134e4a;
    --ori-color-on-secondary-dark: #d6fbf3;
    --ori-color-surface-dark: #0e2623;
    --ori-color-on-surface-dark: #d6fbf3;
    --ori-color-background-dark: #061513;
    --ori-color-on-background-dark: #d6fbf3;
}
```

Drop that anywhere in your own stylesheet (it can live outside oriUI's `@layer` blocks — unlayered
rules win the cascade), set `data-ori-skin="brand"` on `<html>`, and every component and `.ori-*`
class picks it up in both modes. Nothing else changes.

### Contrast is a contract, not a hope

Every role pairs a background token with an `on-` text token, and the pair must clear **WCAG AA — a
contrast ratio of at least 4.5:1** for normal text. The defaults are checked: Ori's light primary is
white on azure `#0369a1` (~5.9:1), its dark primary is ink `#06131f` on cyan `#38bdf8` (~8.7:1), and
every built-in skin is held to WCAG AA for body text. Pick your `on-` colors deliberately — a
near-white on a mid-tone brand color often misses, and the dark variant needs its own check because
it inverts.

This isn't on the honor system. The repo ships an **automated contrast test**
(`tests/tokens.contrast.test.ts`) that parses the skin CSS and asserts every role / `on-role` pair
meets AA across both modes — it has already caught a real failure (a Sumi `secondary-dark` pairing at
4.18:1). If you add a skin to the library, add it to that guard.

## See also

- [Design tokens](/guides/design-tokens) — the full token catalog: the neutral ramp, every role, the
  size / radius / gap / font scales.
- [Customization](/guides/customization) — one-off token overrides and per-instance tweaks, without
  authoring a whole skin.
- [Using the CSS layer](/guides/css) — applying themes with the standalone `.ori-*` classes in htmx,
  Astro, or plain HTML.
- [Get started](/overview/get-started) · [Button](/components/button) · [Headless core](/headless/core)
