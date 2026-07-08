---
title: Skin gallery
---

# Skin gallery

A **skin** is a named palette — a set of token overrides applied with one attribute on `<html>`
(`data-ori-skin`). Every skin repoints only the four skinnable roles (`primary` · `secondary` ·
`surface` · `background`, each with a `-light` and `-dark` source); the status hues (`success` ·
`warn` · `danger` · `info`) stay shared, and every pairing targets **WCAG AA** for body text. Switching
a skin is a single attribute write — zero runtime, no recompute, no flash.

The default skin is **Ori** (織り) — luminous azure and cyan. Seven presets ship alongside it; click any
card below to apply it across this whole site, and toggle light / dark to see both modes.

:skin-gallery

## How it works

Each preset lives in `@oriui/css` as a block of source-token overrides keyed on the attribute:

```css
:root[data-ori-skin='sumi'] {
    --ori-color-primary-light: #2b2d42;
    --ori-color-on-primary-light: #f4f1de;
    --ori-color-primary-dark: #f4f1de;
    /* …secondary / surface / background, light + dark… */
}
```

The [light / dark machinery](/guides/theming#light-and-dark) then resolves the active
`--ori-color-*` aliases from whichever `*-light` / `*-dark` source the skin set. Because skins override
the **source** tokens (not the resolved aliases), they compose cleanly with the mode selectors — one
skin attribute × one mode class covers every combination.

> **Scope:** skins are **page-level** — the selector is `:root[data-ori-skin]`, so a skin applies to the
> whole document, not a subtree (the active alias resolves at `:root`; see
> [Design tokens](/guides/design-tokens)). Light / dark, by contrast, _can_ be scoped to a subtree with
> `.ori-theme_light` / `.ori-theme_dark`.

## Authoring a skin

A new skin is one CSS block — no build step, no JavaScript. See
[Theming → authoring a new named skin](/guides/theming) for the full walkthrough, and
[Design tokens](/guides/design-tokens) for the token catalog each skin repoints.
