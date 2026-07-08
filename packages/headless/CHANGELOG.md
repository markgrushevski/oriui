# @oriui/headless

## 1.0.0-alpha.10

### Minor Changes

- c026ffc: **New: a theme controller that fixes runtime light/dark switching.** `@oriui/headless` now ships `applyTheme`,
  `createThemeController` (core), and `useTheme` (Vue + Svelte) for setting the active theme, with `auto` (live OS
  scheme) and persistence built in.

    They exist because toggling the `ori-theme_dark` class at runtime hits a Chromium style-invalidation bug: every
    styled component bakes a resolved role alias into an element-scoped custom property and reads it through a `var()`
    chain, and Chromium can fail to re-resolve that chain when the inherited token changes via an ancestor class
    toggle — so components keep the PREVIOUS theme's colours (fill/tonal backgrounds and role text) until they
    re-render. It is not fixable in CSS (`@property`, literal tones, and reflows were all ineffective). `applyTheme`
    flips the `ori-theme_{light,dark}` class and force-restyles the subtree in the same task (a `display:none`
    round-trip on `document.body`, exposed as `flushThemeInvalidation`), which reliably re-resolves the colours.

    ```ts
    // Vue
    const { resolvedTheme, cycleTheme } = useTheme({ storageKey: 'app-theme', default: 'auto' });

    // or low-level, in your own store / vanilla:
    import { applyTheme } from '@oriui/headless';
    applyTheme(isDark ? 'dark' : 'light'); // instead of a bare classList.toggle
    ```

    Consumers that switch themes at runtime should apply the theme through these (or add the flush wherever they flip
    the class). No breaking changes — purely additive.

## 1.0.0-alpha.9

## 1.0.0-alpha.8

## 1.0.0-alpha.7

## 1.0.0-alpha.6

### Patch Changes

- 37ebed5: Ship `src` alongside `dist` so the published declaration maps (`.d.ts.map`) and JS sourcemaps
  (`.js.map`) resolve to real files. Before this, `files` shipped only `dist`, so every map pointed at a
  `../src/…` source that wasn't in the package — go-to-definition (and JS debugging) dead-ended, and some
  editors (notably WebStorm) degraded a component's model while chasing the missing source. Now
  go-to-definition on an `Ori*` component or a headless composable lands on the real, commented source.
  The `exports` map still routes all imports to `dist`; the extra `src` files are inert.

## 1.0.0-alpha.5

## 1.0.0-alpha.4

### Minor Changes

- 6481f5a: Token bridge: read RESOLVED `--ori-*` design tokens from JS — for consumers that paint outside the
  CSS cascade (Konva/canvas/WebGL, charts) but must follow the active skin. The core gains
  `resolveToken` (a hidden color-probe that forces `var()` substitution — `getComputedStyle().getPropertyValue('--x')`
  only returns the unresolved chain) and `observeTheme` (skin class/style mutations + OS scheme flips);
  the Vue and Svelte adapters gain the theme-reactive `useToken` / `useThemeColor` composables on top.
  Colors-only MVP: the probe reads through the `color` property, so tokens must resolve to a `<color>`.

    In dev builds, a token that fails to resolve against a real `document` warns once per token (naming
    the colors-only probe as the likely cause for non-color tokens), so the silent `''` no longer
    conflates SSR/pre-mount with a genuinely unresolvable token; the branch is `NODE_ENV`-guarded and
    stripped from production bundles.

## 1.0.0-alpha.3

### Minor Changes

- c9d1ec3: Add `@oriui/headless/svelte` — a Svelte 5 adapter at full parity with `./vue`
  (`useDisclosure` / `useDialog` / `useCombobox` / `useMenu` + `provideHeadless`), built on the shared
  framework-agnostic core. Returns Svelte stores (`readable` / `derived`) with lowercased event handlers;
  `svelte ^5` is an optional peer. Same behavior, per-framework reactive wrapper. `useCombobox` / `useMenu`
  accept `MaybeReactive` options (a plain object or a store) so a changing option list / `disabled` reacts.

## 1.0.0-alpha.2

### Minor Changes

- 696c678: Restructure and rename the packages. The styled components move from the repo root (`@oriui/ui`) into
  `@oriui/vue`; the headless layer consolidates `@oriui/core` and the old `@oriui/vue` into a single
  `@oriui/headless` package — `@oriui/headless` is the framework-agnostic engine, `@oriui/headless/vue`
  the Vue composables (a `@oriui/headless/svelte` adapter can follow). `@oriui/css` is unchanged. The
  old `@oriui/ui`, `@oriui/core`, and the old `@oriui/vue` (headless) package names are retired.
