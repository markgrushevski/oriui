---
'@oriui/vue': patch
---

`OriDialog` now has a robust accessible name. The title `<h2>` renders only when a `title` prop or
`#title` slot is supplied — previously a titleless dialog was "labelled" by an empty heading, giving it
an empty accessible name. Stray attributes (including `aria-label`) are now forwarded to the `<dialog>`
element (`inheritAttrs: false`), so a titleless dialog can be named with `aria-label`; the adapter's own
a11y props are still applied verbatim. A dev-only warning fires when a dialog opens with no accessible
name (title / `#title` / `aria-label`).
