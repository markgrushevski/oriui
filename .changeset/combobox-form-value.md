---
'@oriui/vue': patch
---

**OriCombobox now submits the selected value, not the visible label.** The visible `<input>` shows the
option label, so a native form previously submitted that label text under the field name. `name` (and
an optional `form`) is now a real prop that renders a hidden input carrying the selected **value**; the
visible input no longer receives `name`. A disabled combobox is excluded from submission, matching a
native disabled control. Purely additive — behavior is unchanged unless you pass `name`.
