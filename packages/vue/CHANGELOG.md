# @oriui/vue

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
