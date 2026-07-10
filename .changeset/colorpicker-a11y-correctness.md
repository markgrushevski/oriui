---
'@oriui/vue': patch
'@oriui/headless': patch
---

**OriColorPicker** — accessibility + correctness fixes:

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
