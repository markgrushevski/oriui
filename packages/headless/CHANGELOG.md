# @oriui/headless

## 1.0.0-alpha.14

### Minor Changes

- 0b377dc: The **Svelte adapter** (`@oriui/headless/svelte`) now mirrors the Vue seam: `useCombobox` / `useMenu`
  resolve through the OriHeadless context (`getHeadless()?.combobox ?? nativeCombobox`) with the native
  `core` adapter as the default — so a Svelte app can swap a custom / Zag-backed combobox / menu engine via
  `provideHeadless()`, at parity with the Vue side. Adds `ComboboxControl` / `ComboboxAdapter` /
  `MenuControl` / `MenuAdapter` (Svelte `Readable` shapes), `combobox?` / `menu?` on the Svelte
  `HeadlessAdapters`, and `nativeCombobox` / `nativeMenu` exports. Behavior is unchanged when no adapter is
  registered.
- 55a7579: **Combobox and Menu are now genuinely swappable** behind the `OriHeadless` contract, matching Dialog and
  Disclosure. `useCombobox` / `useMenu` previously imported the core state machine directly (no swap seam),
  so the "swappable adapters" promise was true only for the overlays. They now resolve through
  `inject(ORI_HEADLESS)` with the in-house `core` adapter as the default — so an app can provide a custom /
  Zag-backed `combobox` / `menu` engine via `provideHeadless()` / the `OriHeadless` plugin without touching
  component markup.

    Adds to the public contract: `ComboboxControl` / `ComboboxAdapter` / `MenuControl` / `MenuAdapter` types,
    `combobox?` / `menu?` on `HeadlessAdapters`, and `nativeCombobox` / `nativeMenu` (the default adapters).
    Behavior is unchanged when no adapter is registered — native is the default.

- 924018a: `resolveRovingIndex` (core) gains an optional `isEnabled(index)` predicate: when supplied it **skips**
  indices it rejects, scanning on in the intent's direction — the Tabs / RadioGroup model — while the
  default (no predicate) keeps the toolbar's single-step behavior that **visits** disabled items. `OriTabs`
  now composes the shared `rovingIntent` / `resolveRovingIndex` core helpers instead of hand-rolling its
  roving math; behavior is unchanged and the flagship Toolbar is untouched.

### Patch Changes

- 36a5dcc: **OriColorPicker** — accessibility + correctness fixes:

    - The saturation/value area's two visually-hidden range inputs each own one axis now
      (saturation = horizontal keys, brightness = vertical + `aria-orientation`), so every
      arrow keystroke changes the focused slider's own value and a screen reader announces it —
      Up/Down on the saturation slider no longer silently moves brightness. `aria-valuetext`
      now carries the resulting colour, not just the bare axis percentage.
    - The external-value echo-guard formats with the alpha flag, so with `alpha` on the working
      colour is no longer re-parsed (re-quantised through 8-bit RGB) on every tick — the visible
      ~1% grid on `rgb()`/`hsl()` output is gone.
    - A disabled picker's preset swatches are inert to the keyboard too now (a real `disabled`
      attribute plus guarded click/keydown handlers); `pointer-events: none` had only blocked
      the mouse, leaving them Tab-focusable and Enter-activatable.

- 080571c: OriColorPicker polish + SSR-safety:

    - The preset listbox seeds its roving Tab stop onto the **selected** swatch (APG) and follows external
      colour changes, instead of always starting at index 0.
    - The hue slider caps at **359** so dragging to the end no longer wraps the thumb back to 0; the hue and
      alpha sliders announce a self-describing `aria-valuetext` (`225°` / `50%`).
    - An invalid hex entry surfaces an **accessible error** (`role="alert"` + `aria-describedby`), not just a
      silent `aria-invalid` flip.
    - The eyedropper trigger is **SSR-safe** — feature-detected after mount, so it no longer causes a
      hydration mismatch — and is sized to match the 2rem preview swatch.
    - The alpha **checkerboard is theme-aware** (a mid-neutral in dark mode rather than a glaring light grid),
      the area / hue / alpha focus rings use a neutral high-contrast double ring, and the preset chips get
      more gap so the selected ring clears its neighbour.
    - Panel corners now read component-local radius aliases; dropped the inert `label` option from
      `useColorPicker`.

## 1.0.0-alpha.13

### Minor Changes

- 8af0a98: ColorPicker — an accessible, dependency-free color picker.

    - **`@oriui/vue`**: `OriColorPicker` — an inline panel with a 2D saturation×brightness area, a hue slider (reusing OriSlider), an optional alpha slider, a hex field (reusing OriInput), optional preset swatches (a roving listbox), and an optional eyedropper. `v-model` is a lowercase color string; `format` selects `hex` / `rgb` / `hsl`; `alpha` adds a checkerboard slider + `#rrggbbaa` output; `eyedropper` shows a feature-detected pick-from-screen trigger (hidden where unsupported); `update:modelValue` streams live and `change` commits once per interaction (one undo entry), like OriSlider. Slots: `#swatch`, `#preset`. Compose it into `OriPopover` for a swatch-triggered flow.
    - **`@oriui/headless`**: `useColorPicker` (Vue) — the compositional behaviour over a new zero-dependency sRGB color engine (`hex↔rgb↔hsv↔hsl`, loose parse of hex / `rgb()` / `hsl()` incl. alpha, WCAG-luminance ink) and 2D-area math, kept out of the core `.` budget (reachable only from `./vue`). The 2D area is two visually-hidden native `<input type="range">` (one per axis) — real `role="slider"`, focus, and value announcements, with the arrow keys routed in 2D.

    Deferred to a later version (all additive): a user-facing format switcher, per-channel numeric inputs, a built-in recent-colors buffer, a color wheel, and a Svelte binding.

## 1.0.0-alpha.12

## 1.0.0-alpha.11

### Minor Changes

- 095aef0: Toolbar — a flagship WAI-ARIA toolbar (https://www.w3.org/WAI/ARIA/apg/patterns/toolbar/).

    - **`@oriui/headless`**: a new compositional roving-tabindex primitive — `useToolbar` / `useToolbarItem` / `useToolbarOrientation` / `useToolbarToggleGroup` / `useToolbarToggleItem` (Vue **and** Svelte adapters), plus framework-agnostic roving helpers (`rovingIntent` / `resolveRovingIndex`) in the core. Real DOM focus, one tab stop, arrow navigation by orientation with wrap, Home/End, RTL, and a composite-child guard (a slotted slider/textbox keeps its own arrows).
    - **`@oriui/vue`**: five styled components — `OriToolbar` (required accessible name, `orientation` / `loop` / `dir`), `OriToolbarButton` (`pressed`→aria-pressed toggles, focusable-disabled per the APG, and a baked `tooltip` that wires `aria-describedby` onto the real button), `OriToolbarSeparator` (perpendicular), and `OriToolbarToggleGroup` / `OriToolbarToggleItem` (single/multiple, `v-model`).

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
