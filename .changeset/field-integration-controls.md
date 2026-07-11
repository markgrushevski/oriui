---
'@oriui/vue': minor
---

**Combobox, Slider, RadioGroup, and ColorPicker now compose with `OriField`** — like Input / Select /
Textarea already did. Nested in an `OriField`, each adopts the field's id and `aria-describedby` /
`aria-invalid` / `disabled` (plus `required` + `size` where the control has them) and stops rendering
its own label / hint / error, so there is one wired-once label and helper. Group and composite controls
(RadioGroup, ColorPicker, and the Combobox listbox) name themselves via `aria-labelledby` pointing at
the field's label — for which `OriField` now exposes a `labelId` on its context. Standalone behavior is
unchanged (field integration is opt-in by nesting).
