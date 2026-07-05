# @oriui/css

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
