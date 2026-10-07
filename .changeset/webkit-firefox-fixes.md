---
'@oriui/css': patch
'@oriui/vue': patch
---

Fixes found by running the test suite in Firefox and WebKit:

- **Radio groups and segmented controls keep their focus ring in Safari.** WebKit does not match
  `:focus-visible` on a radio that an arrow key focused, so the ring disappeared after the first arrow.
  `OriRadioGroup` and `OriSegmentedControl` now set `data-ori-keyboard` on the group while the keyboard is in
  use, and the stylesheet draws the ring from `:focus` under it. In plain HTML, set that attribute on the
  `.ori-radio-group` or `.ori-segmented-control` on keydown and remove it on pointerdown.
- **`.ori-select__control` has no block padding in Firefox without the reset.** Firefox gives a `<select>`
  1px of block padding by default; the control now sets its own.
