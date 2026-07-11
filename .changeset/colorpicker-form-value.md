---
'@oriui/headless': minor
'@oriui/vue': minor
---

**OriColorPicker now submits its color in a form.** A new `name` prop (with an optional `form`) renders
a hidden input carrying the current color, so a color picker joins native form submission like
`<input type="color">` — and, unlike a combobox, it always has a value (a color control has no empty
state), so it submits its current color even before the user interacts. The submitted string uses the
picker's emitted `format` (hex / rgb / hsl, with alpha when enabled); a disabled picker is excluded from
submission, matching a native disabled control. `useColorPicker` gains a `value` accessor — the canonical
current color in the emitted format — to back it. Purely additive: behavior is unchanged unless you pass `name`.
