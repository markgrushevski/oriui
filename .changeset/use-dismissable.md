---
'@oriui/headless': minor
'@oriui/vue': patch
---

**New headless `useDismissable` (Vue + Svelte)** — the shared "close the overlay on an outside interaction"
layer for non-platform overlays, the pattern Radix `DismissableLayer` / Floating-UI `useDismiss` standardise.
While `enabled`, it attaches `document` listeners and calls `onDismiss()` when an interaction lands outside the
overlay's elements; each overlay picks its strategy — `pointerDownOutside` (a menu) or `focusOutside` (a
combobox). Built on a new pure `isTargetOutside(target, elements)` predicate exported from `@oriui/headless`.

`OriMenu` now uses it for outside-pointerdown (replacing a hand-rolled `document` listener) and `OriCombobox`
for outside-pointerdown + focus-out (replacing the input's `@blur`) — **behaviour-preserving**, and it moves the dismiss glue out of
the styled SFCs into the headless layer so a Svelte consumer of `useMenu` / `useCombobox` can wire the same
close behaviour. (Popover / Dialog dismiss via the native `[popover]` / `<dialog>` top-layer; Escape stays in
the core connects.)
