---
'@oriui/vue': minor
'@oriui/css': minor
---

**New: `OriSegmentedControl`, a compact single-select row.**

`<OriSegmentedControl v-model="theme" label="Theme" :options="[{ value: 'light', label: 'Light' }, …]" />`
renders a row of equal-width segments over real radio inputs that share one `name`. The browser does the
rest: arrow keys move and select, the group is a single Tab stop, the value submits with a form, and RTL
mirrors the row.

- **Props:** `options` (`{ label, value, disabled?, icon? }`), `label` (or `aria-label`), `name`,
  `color` (default `primary`), `size`, `fluid`, `disabled`, `required`. Inside an `OriField` the field
  owns the label, hint and error wiring, as it does for `OriRadioGroup`. The `#option` slot replaces a
  segment's text.
- **Visible state:** the checked segment takes the accent fill and an edge in the role's text tone. The
  fill alone does not stand out 3:1 from the track in every role and theme; the edge does.
- `@oriui/css` adds `segmented-control.css`: `.ori-segmented-control` with `__label`, `__track`, `__item`,
  `__input`, `__icon` and `__text`, plus `_<size>` and `_fluid`. It works without JavaScript.
