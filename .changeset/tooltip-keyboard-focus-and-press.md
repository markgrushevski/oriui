---
'@oriui/css': patch
'@oriui/vue': patch
---

**`OriTooltip` shows on hover and on keyboard focus only, and hides when its trigger is pressed** (a click,
a tap, `Enter` or `Space`), the model Radix, React Aria and Zag use. Before, a click or a tap that focused
the trigger opened the bubble and kept it open over whatever the press opened, such as a popover.

The focus rule in `@oriui/css` is now `:has(:focus-visible)`, and it skips a tooltip that carries
`data-ori-pointer-focus`. The component sets that attribute while the focus inside came from a pointer,
because browsers start matching `:focus-visible` on a clicked control at the next key press: without it, a
key pressed after a click showed the bubble, and its `Escape` dismissed the tooltip instead of closing the
dialog around it. Hand-written markup that wires `data-ori-dismissed` can set `data-ori-pointer-focus` the
same way (see the tooltip docs).
