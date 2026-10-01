---
'@oriui/vue': patch
---

**Slots that appear after the first render are picked up.**

A component that checked for a slot computed the answer once: `<template v-if="failed" #error>` on an
`OriField` rendered the error text, but the control stayed without `aria-invalid` and kept pointing
`aria-describedby` at the hint. The same held for `OriCombobox`'s `#label`, `OriBadge`'s `#content`, a
toolbar item's icon slot, `OriDialog`'s and `OriDrawer`'s `#title`, and `OriTable`'s `#caption`. They now
follow the slots on every render.
