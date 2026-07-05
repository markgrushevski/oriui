---
'@oriui/headless': minor
---

Token bridge: read RESOLVED `--ori-*` design tokens from JS — for consumers that paint outside the
CSS cascade (Konva/canvas/WebGL, charts) but must follow the active skin. The core gains
`resolveToken` (a hidden color-probe that forces `var()` substitution — `getComputedStyle().getPropertyValue('--x')`
only returns the unresolved chain) and `observeTheme` (skin class/style mutations + OS scheme flips);
the Vue and Svelte adapters gain the theme-reactive `useToken` / `useThemeColor` composables on top.
Colors-only MVP: the probe reads through the `color` property, so tokens must resolve to a `<color>`.

In dev builds, a token that fails to resolve against a real `document` warns once per token (naming
the colors-only probe as the likely cause for non-color tokens), so the silent `''` no longer
conflates SSR/pre-mount with a genuinely unresolvable token; the branch is `NODE_ENV`-guarded and
stripped from production bundles.
