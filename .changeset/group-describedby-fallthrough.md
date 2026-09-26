---
'@oriui/vue': patch
---

**OriRadioGroup** and **OriColorPicker** no longer drop the field hint when you pass your own
`aria-describedby`.

Inside an `OriField` with a `hint`, `<OriRadioGroup aria-describedby="note">` rendered only `note`, so
screen readers stopped announcing the hint. The two ids are now joined, as they already are on the text
controls. Every other attribute you pass still reaches the group's root unchanged.
