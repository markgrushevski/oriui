# @oriui/vue

## 1.0.0-alpha.16

### Minor Changes

- 7e4e397: **New headless `useTabs` composable (Vue + Svelte).** The WAI-ARIA tabs behaviour — automatic-activation
  roving tabindex, defensive selection resolution (recovers to the first enabled tab), and the
  tablist / tab / tabpanel ARIA prop bags — now lives in `@oriui/headless`: `useTabs` ships from both
  `@oriui/headless/vue` (returning computeds) and `@oriui/headless/svelte` (returning stores), reusing the
  shared `core/roving` index math with its skip-disabled predicate. `OriTabs` is rewritten to consume it —
  **identical DOM, classes, and keyboard** — closing the last styled component that hand-rolled its behaviour
  instead of sitting on a headless core. Additive: a new optional `label` prop on `OriTabs` (and
  `label` / `labelledby` options on `useTabs`) names the tablist via `aria-label` / `aria-labelledby`, which
  WAI-ARIA recommends.

### Patch Changes

- bbc937d: **New headless `useDismissable` (Vue + Svelte)** — the shared "close the overlay on an outside interaction"
  layer for non-platform overlays, the pattern Radix `DismissableLayer` / Floating-UI `useDismiss` standardise.
  While `enabled`, it attaches `document` listeners and calls `onDismiss()` when an interaction lands outside the
  overlay's elements; each overlay picks its strategy — `pointerDownOutside` (a menu) or `focusOutside` (a
  combobox). Built on a new pure `isTargetOutside(target, elements)` predicate exported from `@oriui/headless`.

    `OriMenu` now uses it for outside-pointerdown (replacing a hand-rolled `document` listener) and `OriCombobox`
    for outside-pointerdown + focus-out (replacing the input's `@blur`) — **behaviour-preserving**, and it moves the dismiss glue out of
    the styled SFCs into the headless layer so a Svelte consumer of `useMenu` / `useCombobox` can wire the same
    close behaviour. (Popover / Dialog dismiss via the native `[popover]` / `<dialog>` top-layer; Escape stays in
    the core connects.)

- d1163d0: **Toast behaviour moved into `@oriui/headless` (Vue + Svelte).** `useToast` — the imperative toast queue —
  now ships from `@oriui/headless/vue` and, new, `@oriui/headless/svelte`, backed by a framework-agnostic core
  queue engine (`createToastQueue`; kept out of the core barrel so it never weighs on the 1 kB core budget,
  and projected into a Vue reactive array / a Svelte readable store). **Non-breaking:** the `@oriui/vue` path is
  unchanged — `import { useToast } from '@oriui/vue'` still works and shares the one queue (it re-exports the
  Vue adapter). The change is that the behaviour is now a shared headless composable with Svelte parity,
  closing the last styled component whose composable lived in the styled package. Adds a `useToast` docs page.
- Updated dependencies [9448620]
- Updated dependencies [bbc937d]
- Updated dependencies [7e4e397]
- Updated dependencies [d1163d0]
    - @oriui/headless@1.0.0-alpha.16
    - @oriui/css@1.0.0-alpha.16

## 1.0.0-alpha.15

### Minor Changes

- 9d2cc42: **OriColorPicker now submits its color in a form.** A new `name` prop (with an optional `form`) renders
  a hidden input carrying the current color, so a color picker joins native form submission like
  `<input type="color">` — and, unlike a combobox, it always has a value (a color control has no empty
  state), so it submits its current color even before the user interacts. The submitted string uses the
  picker's emitted `format` (hex / rgb / hsl, with alpha when enabled); a disabled picker is excluded from
  submission, matching a native disabled control. `useColorPicker` gains a `value` accessor — the canonical
  current color in the emitted format — to back it. Purely additive: behavior is unchanged unless you pass `name`.
- db9ffee: **Combobox, Slider, RadioGroup, and ColorPicker now compose with `OriField`** — like Input / Select /
  Textarea already did. Nested in an `OriField`, each adopts the field's id and `aria-describedby` /
  `aria-invalid` / `disabled` (plus `required` + `size` where the control has them) and stops rendering
  its own label / hint / error, so there is one wired-once label and helper. Group and composite controls
  (RadioGroup, ColorPicker, and the Combobox listbox) name themselves via `aria-labelledby` pointing at
  the field's label — for which `OriField` now exposes a `labelId` on its context. Standalone behavior is
  unchanged (field integration is opt-in by nesting).

### Patch Changes

- df3e253: **Fix: a disabled OriColorPicker now also disables its hex field.** The hex `OriInput` bound only the
  local `disabled` prop, not the composed `isDisabled` (local **or** field-disabled) the sliders,
  eyedropper, and hidden input already use — so inside a disabled `OriField` (or any field-driven disable)
  the hex text field stayed enabled and a keyboard user could type a color, blur, and mutate the picker
  while it was meant to be disabled. It now binds `isDisabled`, matching the other controls.
- aeddf1a: **OriCombobox now submits the selected value, not the visible label.** The visible `<input>` shows the
  option label, so a native form previously submitted that label text under the field name. `name` (and
  an optional `form`) is now a real prop that renders a hidden input carrying the selected **value**; the
  visible input no longer receives `name`. A disabled combobox is excluded from submission, matching a
  native disabled control. Purely additive — behavior is unchanged unless you pass `name`.
- 377160d: **OriCombobox: keyboard users can now clear a selection.** The `clearable` clear button is a pointer
  affordance (`tabindex="-1"`), leaving keyboard-only users with no way to remove a committed selection
  (WCAG 2.1.1). Pressing **Escape** while the listbox is closed now clears the selection when `clearable`
  is set; Escape while the listbox is open still just closes it.
- 78cc170: **OriCombobox `required` now guards the selection, not the typed text.** `required` was set as the
  native attribute on the visible input, whose value is the option label/query — so typing a non-matching
  query satisfied `required` while the form submitted an empty value (and a bound value absent from
  `options` wrongly blocked submission). `required` now drives `aria-required` + custom validity keyed to
  whether a value is committed, so the field is invalid until a real option is selected. The optional
  `form` prop is also applied to the visible (validation) input, not only the hidden value input, so a
  combobox rendered outside its target form still participates in that form's validation.
- Updated dependencies [7ddfb16]
- Updated dependencies [9d2cc42]
    - @oriui/css@1.0.0-alpha.15
    - @oriui/headless@1.0.0-alpha.15

## 1.0.0-alpha.14

### Patch Changes

- 5e28b7c: Catalog consistency polish:

    - **OriSlider** and **OriCombobox** gain a `#label` slot (the `label` prop is the fallback), matching
      OriField — so a standalone control can take a rich label (an icon + text) while keeping the label
      `for`/`id` and the combobox listbox `aria-labelledby` wiring intact.
    - The combobox listbox and the toast card now read a baked `--ori-size-radius` alias (two-tier) rather
      than the raw scale token, so a consumer `.ori-size-radius_*` utility can retune their corners — matching
      menu / popover / card. Defaults are unchanged.

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

- bf4b762: `OriDialog` now has a robust accessible name. The title `<h2>` renders only when a `title` prop or
  `#title` slot is supplied — previously a titleless dialog was "labelled" by an empty heading, giving it
  an empty accessible name. Stray attributes (including `aria-label`) are now forwarded to the `<dialog>`
  element (`inheritAttrs: false`), so a titleless dialog can be named with `aria-label`; the adapter's own
  a11y props are still applied verbatim. A dev-only warning fires when a dialog opens with no accessible
  name (title / `#title` / `aria-label`).
- 924018a: `resolveRovingIndex` (core) gains an optional `isEnabled(index)` predicate: when supplied it **skips**
  indices it rejects, scanning on in the intent's direction — the Tabs / RadioGroup model — while the
  default (no predicate) keeps the toolbar's single-step behavior that **visits** disabled items. `OriTabs`
  now composes the shared `rovingIntent` / `resolveRovingIndex` core helpers instead of hand-rolling its
  roving math; behavior is unchanged and the flagship Toolbar is untouched.
- a661654: `@oriui/vue`'s shipped type declarations now resolve under `moduleResolution: node16` / `nodenext`, not
  just `bundler`. `vue-tsc` emits extensionless relative specifiers (`from './types'`, directory
  `from './components'`, `.vue` re-exports) that strict node16/nodenext consumers reject (TS2834); a
  post-build step (`scripts/fix-dts.mjs`) now rewrites them to explicit `.js` / `/index.js` paths. Verified
  with a nodenext consumer typecheck and `@arethetypeswrong/cli` (node16-from-ESM is green). No runtime or
  API change. (`@oriui/headless` was already node16-clean; `@oriui/css` ships no declarations.)
- c76d76b: Packaging hygiene for `@oriui/vue`:

    - `sideEffects` is now `false` (was `["**/*.css"]`, which matched nothing — the package ships no CSS, it
      comes from `@oriui/css`), giving bundlers a clean tree-shaking signal so importing one component pulls
      no others.
    - The `vue` peer range is raised to `^3.5` to match the actual API floor (the SFCs use reactive props
      destructure) and `@oriui/headless`'s peer, so a Vue 3.4 consumer gets a correct peer warning instead of
      an unsupported runtime.

- Updated dependencies [5e28b7c]
- Updated dependencies [36a5dcc]
- Updated dependencies [080571c]
- Updated dependencies [0b377dc]
- Updated dependencies [55a7579]
- Updated dependencies [924018a]
    - @oriui/css@1.0.0-alpha.14
    - @oriui/headless@1.0.0-alpha.14

## 1.0.0-alpha.13

### Minor Changes

- 8af0a98: ColorPicker — an accessible, dependency-free color picker.

    - **`@oriui/vue`**: `OriColorPicker` — an inline panel with a 2D saturation×brightness area, a hue slider (reusing OriSlider), an optional alpha slider, a hex field (reusing OriInput), optional preset swatches (a roving listbox), and an optional eyedropper. `v-model` is a lowercase color string; `format` selects `hex` / `rgb` / `hsl`; `alpha` adds a checkerboard slider + `#rrggbbaa` output; `eyedropper` shows a feature-detected pick-from-screen trigger (hidden where unsupported); `update:modelValue` streams live and `change` commits once per interaction (one undo entry), like OriSlider. Slots: `#swatch`, `#preset`. Compose it into `OriPopover` for a swatch-triggered flow.
    - **`@oriui/headless`**: `useColorPicker` (Vue) — the compositional behaviour over a new zero-dependency sRGB color engine (`hex↔rgb↔hsv↔hsl`, loose parse of hex / `rgb()` / `hsl()` incl. alpha, WCAG-luminance ink) and 2D-area math, kept out of the core `.` budget (reachable only from `./vue`). The 2D area is two visually-hidden native `<input type="range">` (one per axis) — real `role="slider"`, focus, and value announcements, with the arrow keys routed in 2D.

    Deferred to a later version (all additive): a user-facing format switcher, per-channel numeric inputs, a built-in recent-colors buffer, a color wheel, and a Svelte binding.

### Patch Changes

- Updated dependencies [8af0a98]
- Updated dependencies [f3eae54]
    - @oriui/headless@1.0.0-alpha.13
    - @oriui/css@1.0.0-alpha.13

## 1.0.0-alpha.12

### Minor Changes

- 20f7236: Content slots across the catalog — pass a rich node anywhere a string prop used to be the only option (all additive; the prop stays as the slot fallback).

    - **Toolbar icons**: `OriToolbarButton` and `OriToolbarToggleItem` now forward a default slot to the underlying `OriButton`, so you can slot any icon source (a component, a multi-path SVG) instead of only the single-path `icon` string.
    - **Rich content slots** following the `OriCard` / `OriAlert` idiom (`<slot name="x">{{ prop }}</slot>`):
        - `OriCheckbox` / `OriSwitch` — default label slot (an inline link in a consent label).
        - `OriTabs` — `#tab` scoped slot for trigger content (icon + count badge).
        - `OriCombobox` — `#option` (scoped: `{ item, index, selected }`) + `#empty`.
        - `OriRadioGroup` — `#option` (scoped: `{ option }`) for card-style radios.
        - `OriAccordion` — `#title` (scoped: `{ item }`) header content.
        - `OriField` — `#label` / `#hint` / `#error` (the error/hint slots stay wired to `aria-describedby` / `aria-invalid`).
        - `OriBadge` — `#content` (a slotted badge keeps its place in the a11y tree).
        - `OriAvatar` — `#fallback` (imageless fallback) + `#title` / `#subtitle`.
        - `OriTag` — `#prepend` / `#append` decorator slots.
        - `OriToast` — `#icon` / `#title`.
    - **Fixes**: `OriCombobox` (input) and `OriMenu` (content) now compose caller listeners with `mergeProps` instead of an object spread — a caller's `@input` / `@keydown` was previously silently dropped by the component's own handlers.

### Patch Changes

- @oriui/headless@1.0.0-alpha.12
- @oriui/css@1.0.0-alpha.12

## 1.0.0-alpha.11

### Minor Changes

- 9e7f183: OriDialog: managed open state — add `v-model:open` (a controlled `open` prop + an `update:open` emit) and a `close` emit. The dialog now drives both uncontrolled (`defaultOpen` + the `#trigger` slot — unchanged) and host-controlled, so a parent can open/close it from its own ref and react to every close (Esc, backdrop, the × button, or its own state). Backward compatible — omitting `:open` keeps the previous behaviour.
- 84b6559: OriSlider: add a `change` event — the committed value (a `number`), fired once when the user releases the thumb or commits a keyboard step, unlike `update:modelValue` which streams live on every drag tick. Bind `@change` to collapse a whole drag into a single undo step (or run a per-release side effect) while `v-model` keeps tracking the live value.

    BREAKING (pre-1.0): `@change` on `<OriSlider>` was previously an undeclared native-event `$attrs` fallthrough carrying a raw `Event`; it is now a first-class typed emit carrying the committed `number`. A consumer relying on the old raw-`Event` payload should read the committed number instead, or attach a listener to the underlying `<input>` via a template ref for the raw event.

- b1fcb38: OriSurface — a minimal elevated floating-surface primitive: surface background + optional hairline + radius + a mode-aware `--ori-shadow-*` elevation, with no padding or content semantics of its own (the caller owns the layout inside). The building block for chrome that floats over content — a toolbar island, a panel, a popout — and the elevation counterpart to OriCard (a content card). Props: `as`, `bordered`, `elevation` (`sm` / `md` / `lg`), `radius`.
- 095aef0: Toolbar — a flagship WAI-ARIA toolbar (https://www.w3.org/WAI/ARIA/apg/patterns/toolbar/).

    - **`@oriui/headless`**: a new compositional roving-tabindex primitive — `useToolbar` / `useToolbarItem` / `useToolbarOrientation` / `useToolbarToggleGroup` / `useToolbarToggleItem` (Vue **and** Svelte adapters), plus framework-agnostic roving helpers (`rovingIntent` / `resolveRovingIndex`) in the core. Real DOM focus, one tab stop, arrow navigation by orientation with wrap, Home/End, RTL, and a composite-child guard (a slotted slider/textbox keeps its own arrows).
    - **`@oriui/vue`**: five styled components — `OriToolbar` (required accessible name, `orientation` / `loop` / `dir`), `OriToolbarButton` (`pressed`→aria-pressed toggles, focusable-disabled per the APG, and a baked `tooltip` that wires `aria-describedby` onto the real button), `OriToolbarSeparator` (perpendicular), and `OriToolbarToggleGroup` / `OriToolbarToggleItem` (single/multiple, `v-model`).

### Patch Changes

- Updated dependencies [095aef0]
    - @oriui/headless@1.0.0-alpha.11
    - @oriui/css@1.0.0-alpha.11

## 1.0.0-alpha.10

### Patch Changes

- Updated dependencies [c026ffc]
    - @oriui/headless@1.0.0-alpha.10
    - @oriui/css@1.0.0-alpha.10

## 1.0.0-alpha.9

### Patch Changes

- Updated dependencies [db83609]
    - @oriui/css@1.0.0-alpha.9
    - @oriui/headless@1.0.0-alpha.9

## 1.0.0-alpha.8

### Patch Changes

- Updated dependencies [e0444e6]
    - @oriui/css@1.0.0-alpha.8
    - @oriui/headless@1.0.0-alpha.8

## 1.0.0-alpha.7

### Patch Changes

- 94e04a5: **Neutral preset skin** — pure neutral grays with a monochrome accent (ink primary on white / near-white on near-black), for tool-like apps where colour belongs to the content, not the chrome. Applied via `data-ori-skin="neutral"`. All role pairings clear WCAG AA (min 12:1).

    **Tooltip fix.** The bubble now self-pairs its colours: a dedicated neutral chip by default (`--ori-neutral-900`/`-50`, ~17:1), or a role's own `--ori-color` / `--ori-color-on` pair when a `color` is set. Previously the bubble read `var(--ori-color, …)` where `--ori-color` is globally `currentColor`, so the neutral fallback never fired and bg + text collapsed to the same colour — invisible (dark-on-dark) on ink-heavy hosts. The bubble also now floats on the shared `.ori-anchored` primitive (`position: fixed` + collision-aware flip via `position-try`), escaping clipped/overflow-hidden containers.

    Standalone `@oriui/css` note: the per-side placement classes `ori-tooltip__bubble_{top,bottom,left,right}` are replaced by `ori-anchored ori-anchored_<placement>` (the same 12-value grid the popover/menu use). `@oriui/vue`'s `OriTooltip` emits the new classes automatically — no consumer change needed there.

    Tooling: the design-token contrast guard now computes WCAG ratios with colord's a11y plugin and parses both legacy and space-separated `hsl()` token values.

- Updated dependencies [94e04a5]
    - @oriui/css@1.0.0-alpha.7
    - @oriui/headless@1.0.0-alpha.7

## 1.0.0-alpha.6

### Patch Changes

- 37ebed5: Ship `src` alongside `dist` so the published declaration maps (`.d.ts.map`) and JS sourcemaps
  (`.js.map`) resolve to real files. Before this, `files` shipped only `dist`, so every map pointed at a
  `../src/…` source that wasn't in the package — go-to-definition (and JS debugging) dead-ended, and some
  editors (notably WebStorm) degraded a component's model while chasing the missing source. Now
  go-to-definition on an `Ori*` component or a headless composable lands on the real, commented source.
  The `exports` map still routes all imports to `dist`; the extra `src` files are inert.
- Updated dependencies [37ebed5]
    - @oriui/headless@1.0.0-alpha.6
    - @oriui/css@1.0.0-alpha.6

## 1.0.0-alpha.5

### Patch Changes

- Updated dependencies [65477b5]
- Updated dependencies [4060086]
    - @oriui/css@1.0.0-alpha.5
    - @oriui/headless@1.0.0-alpha.5

## 1.0.0-alpha.4

### Patch Changes

- Updated dependencies [59744ba]
- Updated dependencies [6481f5a]
    - @oriui/css@1.0.0-alpha.4
    - @oriui/headless@1.0.0-alpha.4

## 1.0.0-alpha.3

### Minor Changes

- dc5bb4c: Fix an implicit-mode footgun: **icon mode now requires an explicit `icon` prop**, no longer the mere
  absence of `text`. Previously `<OriButton>Label</OriButton>` (a slot-only button with no `text` prop)
  silently became a fixed-size icon square and its label overflowed. Now `ori-button_icon` is applied
  only for an icon-**only** button (`icon` set, `text` absent):

    - `<OriButton icon="…" aria-label="…" />` → icon-only square (unchanged).
    - `<OriButton icon="…" text="Save" />` → normal labelled button with a leading icon (no longer a square).
    - `<OriButton text="Save" />` and `<OriButton>Save</OriButton>` (slot) → normal buttons (no longer forced squares).

    OriCard gets the same treatment: its `ori-card_icon` modifier now needs an explicit icon
    (`prependIcon` / `appendIcon`) with no `text`, instead of triggering on any card that omits `text`.

    This changes existing behaviour for consumers who relied on the old text-absent icon square — pass the
    `icon` prop explicitly to keep an icon-only button.

### Patch Changes

- Updated dependencies [c9d1ec3]
    - @oriui/headless@1.0.0-alpha.3
    - @oriui/css@1.0.0-alpha.3

## 1.0.0-alpha.2

### Minor Changes

- 696c678: Restructure and rename the packages. The styled components move from the repo root (`@oriui/ui`) into
  `@oriui/vue`; the headless layer consolidates `@oriui/core` and the old `@oriui/vue` into a single
  `@oriui/headless` package — `@oriui/headless` is the framework-agnostic engine, `@oriui/headless/vue`
  the Vue composables (a `@oriui/headless/svelte` adapter can follow). `@oriui/css` is unchanged. The
  old `@oriui/ui`, `@oriui/core`, and the old `@oriui/vue` (headless) package names are retired.

### Patch Changes

- Updated dependencies [696c678]
    - @oriui/headless@1.0.0-alpha.2
    - @oriui/css@1.0.0-alpha.2
