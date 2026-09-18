---
'@oriui/vue': patch
---

**OriToaster** now carries the live-region semantics on its container, so polite toasts are actually
announced. Previously the only live region in play was the toast card itself (`role="status"`, or
`role="alert"` for `color="danger"`) — and that element is created together with its text. Assistive
tech reports mutations _inside_ a region it was already tracking; a region that first appears already
holding its content is not announced. `role="alert"` is the documented exception most screen readers
honour, which is why `error()` toasts announced and `success()` / `info()` / `warn()` / plain ones
silently did not.

The `.ori-toaster` container was already rendered from mount and already empty until the first push —
it was simply semantically inert. It now gets `aria-live="polite"` plus `aria-atomic="false"`, so each
push is a mutation inside an established region, and only the new toast is read rather than the whole
stack being re-announced. Per-toast roles are untouched: a `danger` toast still renders
`role="alert"` and keeps its assertive urgency, and standalone `<OriToast>` is unchanged.

No visual, DOM-structure or API change — two attributes on a container that was already there.
`aria-relevant` stays at its default (`additions text`), so dismissing a toast announces nothing.

The regression test mounts `<OriToaster>` with an empty queue and asserts the region exists, is empty
and carries the live attributes _before_ any toast is pushed — the case the previous tests missed,
because they only checked that role strings were present once a toast already existed. A second test
pins the region's node identity across a push, so gating the container on `toasts.length` would fail.
