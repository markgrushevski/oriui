---
'@oriui/vue': minor
'@oriui/css': minor
---

**New: a styled `<table>` — `.ori-table` in `@oriui/css` and `OriTable` in `@oriui/vue`.**

The CSS works on any native `<table>`: a header row with a rule, hairlines between body rows and
start-aligned cells, with `ori-table_striped`, `ori-table_hover`, `ori-table_sticky-header`, density
(`ori-table_sm`, `ori-table_lg`) and `ori-table_caption-hidden`. `.ori-table__num` aligns a column of
numbers to the end with tabular figures. A `<tr aria-current>` marks the current row. `.ori-table-scroll`
is the box a wide table scrolls in, so a phone scrolls the table instead of the page.

`<OriTable caption="Leaderboard" striped>` takes your `thead` / `tbody` / `tfoot` rows in its default slot
and renders the caption and the scroll box. While the table overflows the box, the box is a region named
by the caption and a tab stop, so a keyboard can scroll it; a table that fits adds no tab stop. Props:
`caption` (or `#caption`), `captionHidden`, `hover`, `maxHeight`, `size`, `stickyHeader`, `striped`.

It is not a data grid: sorting, row selection and virtualization are not part of it.
