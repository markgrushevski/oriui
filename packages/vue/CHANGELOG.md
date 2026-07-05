# @oriui/vue

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
