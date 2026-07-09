---
'@oriui/vue': minor
---

OriSlider: add a `change` event — the committed value (a `number`), fired once when the user releases the thumb or commits a keyboard step, unlike `update:modelValue` which streams live on every drag tick. Bind `@change` to collapse a whole drag into a single undo step (or run a per-release side effect) while `v-model` keeps tracking the live value.

BREAKING (pre-1.0): `@change` on `<OriSlider>` was previously an undeclared native-event `$attrs` fallthrough carrying a raw `Event`; it is now a first-class typed emit carrying the committed `number`. A consumer relying on the old raw-`Event` payload should read the committed number instead, or attach a listener to the underlying `<input>` via a template ref for the raw event.
