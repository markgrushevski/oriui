---
'@oriui/vue': minor
'@oriui/css': minor
---

**New: `OriList` and `OriListItem`, rows for settings panels, action panels and navigation.**

A row reads start → label → end: an `icon`, a `label` with an optional `description`, and a `hint`
(a shortcut), a `chevron` into a sub-panel or a control of your own in the `#end` slot. Unlike `OriMenu`,
a list is part of the page, reached with Tab, so a row can hold a switch or a segmented control.

- **The row element follows what it does:** `as` wins (a router link component), `href` makes a link,
  a click listener makes a button, and anything else is a static row. Only a static row may hold a
  control, since a control inside a button or a link is invalid HTML. Attributes and listeners go to
  the row element.
- **`current`** sets `aria-current` (`"page"` on links). The current row is tinted and carries a bar on
  its inline-start edge in the role's text tone; the tint alone is too faint to mark it.
- **`disabled`** disables a button row; a link row drops its `href` and gets `aria-disabled`.
- `OriList` is a `<ul role="list">`; `divided` draws hairlines between rows.
- `@oriui/css` adds `list.css`: `.ori-list`, `_divided`, `__item`, `__row`, `__start`, `__main`,
  `__label`, `__description`, `__end`, `__hint` and `__chevron`.
