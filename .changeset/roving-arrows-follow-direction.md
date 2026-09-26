---
'@oriui/headless': minor
'@oriui/vue': minor
---

**Arrow keys in Tabs, Toolbar and the color picker's presets now follow the writing direction.**

In RTL content the first item sits on the right, so `ArrowLeft` now moves to the next item and
`ArrowRight` to the previous one. The direction is read from the element when a key is pressed, so an
ancestor `dir="rtl"` is enough. Before, Tabs and the presets always used the LTR mapping, and Toolbar
flipped only when you passed `dir="rtl"` to it.

- `useTabs` gains a `dir` option, like `useToolbar`.
- When `dir` is passed to `useTabs`, `useToolbar` or `<OriToolbar>`, it is also rendered as the `dir`
  attribute, so the layout and the keys flip together.
- The `dir` of `<OriToolbar>` and of `useToolbar` (Vue, Svelte and React) no longer defaults to
  `'ltr'`: when omitted, the inherited direction is used. If you relied on LTR keys inside RTL content,
  pass `dir="ltr"`.
- `@oriui/headless` exports `textDirection(el)`, and `rovingIntent` accepts a getter for its `dir`
  argument, called only for Left/Right in a horizontal widget.
