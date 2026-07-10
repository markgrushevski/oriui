# @oriui/vue

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
