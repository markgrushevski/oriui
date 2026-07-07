# @oriui/css

## 1.0.0-alpha.6

### Patch Changes

- 37ebed5: Ship `src` alongside `dist` so the published declaration maps (`.d.ts.map`) and JS sourcemaps
  (`.js.map`) resolve to real files. Before this, `files` shipped only `dist`, so every map pointed at a
  `../src/…` source that wasn't in the package — go-to-definition (and JS debugging) dead-ended, and some
  editors (notably WebStorm) degraded a component's model while chasing the missing source. Now
  go-to-definition on an `Ori*` component or a headless composable lands on the real, commented source.
  The `exports` map still routes all imports to `dist`; the extra `src` files are inert.

## 1.0.0-alpha.5

### Minor Changes

- 65477b5: The size/font token scales are now **rem** instead of px — visually identical at default browser
  settings (exact 16px-baseline equivalents: `--ori-size-action_md` 44px → `2.75rem`, gap/radius md
  8px → `0.5rem`, `--ori-font-size_md` 16px → `1rem`, ±2px steps → `0.125rem`), and components now
  scale with the user's browser font-size preference, not only with zoom. Text-relative `em` values
  are untouched, and hairline borders, shadows, the `9999px` pill cap, and the screen breakpoints
  deliberately stay px.

    Note for consumers using the `html { font-size: 62.5% }` trick: oriUI components now follow that
    root — as rem is designed to — so at 62.5% they render at 0.625× until you account for it.

- 4060086: Components no longer rely on the global reset: every component block declares its own box-sizing
  (a zero-specificity border-box subtree rule) and UA neutralization (button/input `padding-block`,
  button `font-family: inherit`, dialog-close `padding`, anchored-panel `margin` — the UA gives
  `[popover]` `margin: auto`), so `tokens.css` + components renders identically to `base.css` with no
  reset at all — guarded by an e2e computed-style diff over all 32 components in real Chromium
  (`e2e/reset-independence.spec.ts`).

    `reset.css` no longer pins `html { font-size: 16px }` — that wasn't a reset: it overrode the user's
    browser font-size preference. The rem base now follows the user's browser setting; the reset is
    border-box + Meyer-style margin/padding/border zeroing, nothing more.

## 1.0.0-alpha.4

### Minor Changes

- 59744ba: À-la-carte entry points: `@oriui/css/base.css` (the batteries-included foundation — cascade-layer
  order + tokens + skins + utilities + the global reset), `@oriui/css/tokens.css` (the same foundation
  without the reset, for apps that bring their own preflight), `@oriui/css/reset.css` (the global
  reset alone), and `@oriui/css/components/<name>.css` (one file per component block) — so a consumer
  can ship only the components they use. Import a foundation first, then components. The default `.`
  export (the full `styles.css` bundle, now also addressable as `@oriui/css/styles.css`) is unchanged.

    Per-component files are self-contained: the blocks a component renders are inlined (button → icon +
    spinner, combobox → input + the `anchored` placement primitive, alert/card/tag/toast → their icons,
    menu/popover → `anchored`), deduped out of the full bundle by postcss-import. Every dist file also
    opens with a one-line `/*!` banner that survives minification and names the base-or-tokens-first rule.

## 1.0.0-alpha.3

## 1.0.0-alpha.2

### Minor Changes

- 696c678: Restructure and rename the packages. The styled components move from the repo root (`@oriui/ui`) into
  `@oriui/vue`; the headless layer consolidates `@oriui/core` and the old `@oriui/vue` into a single
  `@oriui/headless` package — `@oriui/headless` is the framework-agnostic engine, `@oriui/headless/vue`
  the Vue composables (a `@oriui/headless/svelte` adapter can follow). `@oriui/css` is unchanged. The
  old `@oriui/ui`, `@oriui/core`, and the old `@oriui/vue` (headless) package names are retired.
