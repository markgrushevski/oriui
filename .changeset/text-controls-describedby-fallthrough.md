---
'@oriui/vue': patch
---

**OriInput / OriSelect / OriTextarea / OriCombobox** no longer delete a caller's `aria-describedby`.

The four text controls run `inheritAttrs: false` and promise that arbitrary native attributes fall
through to the underlying control. `aria-describedby` was the one exception: the template bound
`v-bind="$attrs"` first and `:aria-describedby="describedBy"` after it, so Vue's `mergeProps`
overwrote the caller's value with the component's own — and with `undefined` when the control
rendered no hint and no error. `<OriInput aria-describedby="form-note" />` emitted no
`aria-describedby` at all, silently dropping a description a screen-reader user depends on.

The caller's id is now folded into the same id list the components already build for their hint /
error and the `describedby` prop, so the two are **joined** instead of one clobbering the other —
matching what a native `<input>` would do if the attribute were simply forwarded. The same applies
inside an `OriField`: the field's `aria-describedby` and the caller's are joined rather than the
field's winning. Nothing else changes — controls that render a hint or an error and get no
`aria-describedby` from the caller produce exactly the value they did before.

Each of the four components gains a test asserting a caller-supplied `aria-describedby` both
survives on its own and is joined with the component's own hint id.
