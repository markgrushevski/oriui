---
'@oriui/vue': patch
---

**`OriMenu` and `OriCombobox` open their panels in the top layer.**

The menu panel and the combobox listbox were fixed-position elements in the page, so an ancestor with a
`transform` moved them away from their trigger, and an ancestor with `overflow: hidden` clipped them. Both
now carry `popover="manual"` and open with `showPopover()`, like `OriPopover`, and stay anchored to their
trigger wherever they sit. In markup of your own, add `popover="manual"` to `.ori-menu` or
`.ori-combobox__listbox` and call `showPopover()` to get the same; without it the z-index still applies.
