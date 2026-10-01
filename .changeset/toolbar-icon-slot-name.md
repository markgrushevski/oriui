---
'@oriui/vue': patch
---

**A toolbar item with only an icon in its slot is named by its tooltip.**

`OriToolbarButton` and `OriToolbarToggleItem` treated any filled default slot as a visible name, so an
item whose slot held only an icon (an `<svg>` or your own icon component) rendered with no accessible name
at all, and its `tooltip` became a description instead. The items now check whether the slot renders
text: when it does not, `tooltip` names the item, as it already did for the `icon` prop. An item with no
text, no `aria-label` and no `tooltip` logs a warning in development.
