---
title: Accessibility
---

# Accessibility

Accessibility in oriUI is **structural, not a coat of polish on top**. The same decisions that make
the components correct for assistive technology also make them themeable and framework-agnostic — they
are the same source of truth, not a separate effort.

## State lives in attributes, not classes

Every dynamic state is a real DOM attribute, styled with attribute selectors — never a JavaScript-only
class:

- `disabled` / `aria-disabled` for disabled controls,
- `aria-busy="true"` for loading,
- `aria-pressed` for toggle STATE (the `pressed` prop) — `data-active` is a forced `:active` LOOK and
  announces nothing,
- `aria-expanded` + `aria-controls` for disclosures.

This is the accessible source of truth, and because it is plain markup it is **identical across all
three layers** — a styled `OriButton`, a hand-written `.ori-button`, and a headless prop bag all expose
the same attributes to a screen reader.

## Color meets WCAG AA — and it's tested

Color comes in **role / on-role pairs** (`primary` / `on-primary`, …), so foreground always has a
matching, legible background. That contract is **executable**: `tests/tokens.contrast.test.ts` parses
every skin's CSS and asserts each role/on-role pair clears the **WCAG AA** contrast ratio — in CI, for
every skin and both light and dark. It has already caught a real contrast failure in a skin during
development.

## Forced colors

In a forced-colors mode (Windows contrast themes) the browser repaints every background in the page color
and drops shadows and gradients, so anything shown by fill alone would disappear. We draw those parts in
system colors instead:

- **Selected and pressed** — a pressed toggle, the selected segment, the current list or table row and the
  highlighted menu item or combobox option take `Highlight` / `HighlightText`, the system's own pair.
- **Tracks** — the switch, the slider and the progress bar get an outline, with the fill or the "on"
  state in `Highlight`.
- **Edges** — a dialog, a drawer, a tooltip bubble, an avatar and an unbordered surface keep a border.
- **Content colors** — the color picker's area, swatch, presets and hue and alpha tracks keep their
  colors: they are what the user is choosing.

`e2e/forced-colors.spec.ts` renders each of these in both states, with the light and the dark contrast
palette, and requires the two to look different.

## Keyboard and focus

- Controls render **native elements** (`<button>`, `<input>`) wherever possible, so keyboard
  activation (`Enter` / `Space`), tab order, and form semantics come for free.
- Focus rings ride **`:focus-visible`**, so they show for keyboard users without flashing on every
  mouse click.
- Hover styling is wrapped in `@media (hover: hover)`, so there is **no sticky hover** on touch.
- The headless layer owns the hard keyboard behavior — `useDialog`'s focus trap, `Escape` to close,
  and focus return to the trigger. See [@oriui/headless](/headless/core).

## Touch targets

The default control size (`md`) is a **44px** target — a comfortable tap area on touch, matching the
mobile-first sizing of the token scale. Use the larger `lg` size where a screen calls for it.

## Per-component contracts

Every component page has its own **Accessibility** section spelling out roles, states, and the keyboard
map, and each component ships axe-core assertions in the test suite. Start with
[Button](/components/button#accessibility).
