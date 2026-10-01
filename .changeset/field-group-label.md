---
'@oriui/vue': patch
---

**`OriField` no longer points its label's `for` at nothing when it wraps a group.**

Around `OriRadioGroup`, `OriSegmentedControl` or `OriColorPicker` the field's `<label for>` named an id no
element carried; the group was already named through `aria-labelledby`. The label now drops `for` around
a group. `OriFieldContext` gains an optional `markGroup()` that a group control calls.
