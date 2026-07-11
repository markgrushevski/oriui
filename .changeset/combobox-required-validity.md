---
'@oriui/vue': patch
---

**OriCombobox `required` now guards the selection, not the typed text.** `required` was set as the
native attribute on the visible input, whose value is the option label/query — so typing a non-matching
query satisfied `required` while the form submitted an empty value (and a bound value absent from
`options` wrongly blocked submission). `required` now drives `aria-required` + custom validity keyed to
whether a value is committed, so the field is invalid until a real option is selected. The optional
`form` prop is also applied to the visible (validation) input, not only the hidden value input, so a
combobox rendered outside its target form still participates in that form's validation.
