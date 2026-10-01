---
title: Table
---

# Table

A styled native `<table>`: a rule under the header row, hairlines between body rows, start-aligned cells, and a few
modifiers for stripes, a hover tint, a sticky header and cell density. The CSS layer works on any `<table>` with
no JavaScript; `OriTable` adds the caption and the accessibility of the box a wide table scrolls in.

It is not a data grid: sorting, row selection, column resizing and virtualization are a data grid's job, and the
table has none of them. For rows of settings or actions rather than columns of data, use a
[list](/components/list).

The examples are organized by **layer**: the [class reference](#classes) is the standalone
**`@oriui/css`** layer, and the [Framework API](#framework-api) is the **`@oriui/vue`** component. Every
example is live — flip its code between **HTML** (the standalone classes, also your htmx / Astro / Svelte /
plain-HTML usage), **Vue**; HTML is the default.

## Classes

A table is a block class plus modifiers. The Vue props in [Framework API](#framework-api) map to these, except
`caption` (a `caption` element) and `maxHeight` (an inline `max-height` on the scroll box).

<!-- prettier-ignore -->
:class-table{:rows='[{"class":"ori-table","type":"Block","description":"Required base class, on a <code>table</code>. Full width, collapsed borders, start-aligned cells; a rule under the header row and a hairline between body rows (and above a footer row). Bakes the primary accent at zero specificity."},{"class":"ori-table_striped","type":"Modifier","description":"Tints every even body row."},{"class":"ori-table_hover","type":"Modifier","description":"Tints the body row under the pointer, on devices that hover."},{"class":"ori-table_sticky-header","type":"Modifier","description":"Keeps the header cells at the top of the scroll box while the rows scroll under them, painted with the surface color. Needs a box with a height."},{"class":"ori-table_sm · ori-table_lg","type":"Size","description":"Denser / roomier cells; <b>md</b> is the default. They repoint <code>--ori-table-cell-padding</code>: md 0.6em 0.75em, sm 0.35em 0.5em, lg 0.9em 1em."},{"class":"ori-table_caption-hidden","type":"Modifier","description":"Takes the caption off the page and keeps it for assistive technology."},{"class":"ori-color_*","type":"Color","description":"<b>primary</b> · secondary · success · warning · danger · info — the accent of the current row tint. Put it on the <code>table</code>."},{"class":"ori-table__num","type":"Part","description":"On a <code>th</code> or <code>td</code>: end-aligned, tabular figures, so a column of numbers lines up. Put it on the column header too."},{"class":"ori-table-scroll","type":"Block","description":"The box a wide table sits in: it scrolls, at most as wide as its parent, so a phone scrolls the table instead of the page. Give it a max-height for a sticky header. Focus is a 2px primary outline."},{"class":"aria-current","type":"State","description":"On a <code>tr</code>: the current row, tinted with the accent. A real attribute, not a class; the value false marks nothing."}]'}

**À la carte:** the classes above ship in `@oriui/css/components/table.css`. Import a foundation
(`@oriui/css/base.css` or `@oriui/css/tokens.css`) first — the token utilities (`ori-color_*`, …) and the color
tokens the table reads live there, not in the component file. The full bundle `@oriui/css` is the default and
already carries both; see [à-la-carte imports](/guides/css).

Accent `primary` is baked in at zero specificity, so a bare `ori-table` is already complete and one `ori-color_*`
class on the table repoints it. Cells inherit the font and are sized in `em`, so a `font-size` on the table (or
any ancestor) scales the text and the padding together.

## Anatomy

```
div.ori-table-scroll              the scroll box; OriTable always renders it, with CSS alone you add it
  table.ori-table                 modifiers: _striped · _hover · _sticky-header · _sm / _lg · _caption-hidden
    caption                       the table's name; drawn, or kept for assistive technology only
    thead > tr > th[scope=col]    the header row; .ori-table__num on a numeric column
    tbody > tr                    the rows; aria-current marks the current one
      th[scope=row] | td          a row header, then the cells
    tfoot > tr                    totals, with a hairline above
```

The rules use child selectors, so `thead`, `tbody` and `tfoot` must be direct children of the table. Always write
`tbody` yourself: a browser inserts one when it parses HTML, but a Vue render does not, so a `tr` placed straight
in the `table` would miss the body-row rules.

## Basic

A native `<table>` with the class on it. The preview is plain markup, with no Vue and no JavaScript. Name the
table with a `<caption>`, mark the header cells `scope="col"` and the row headers `scope="row"`.

::example
<table class="ori-table" style="width: 100%; max-width: 28rem">
<caption>Team</caption>
<thead>
<tr><th scope="col">Name</th><th scope="col">Role</th><th scope="col">Location</th></tr>
</thead>
<tbody>
<tr><th scope="row">Mira Chen</th><td>Design</td><td>Lisbon</td></tr>
<tr><th scope="row">Tomas Reyes</th><td>Engineering</td><td>Madrid</td></tr>
<tr><th scope="row">Noor Haddad</th><td>Product</td><td>Cairo</td></tr>
</tbody>
</table>

#vue

```vue
<OriTable caption="Team">
    <thead>
        <tr>
            <th scope="col">Name</th>
            <th scope="col">Role</th>
            <th scope="col">Location</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <th scope="row">Mira Chen</th>
            <td>Design</td>
            <td>Lisbon</td>
        </tr>
        <tr>
            <th scope="row">Tomas Reyes</th>
            <td>Engineering</td>
            <td>Madrid</td>
        </tr>
        <tr>
            <th scope="row">Noor Haddad</th>
            <td>Product</td>
            <td>Cairo</td>
        </tr>
    </tbody>
</OriTable>
```

#html

```html
<table class="ori-table">
    <caption>
        Team
    </caption>
    <thead>
        <tr>
            <th scope="col">Name</th>
            <th scope="col">Role</th>
            <th scope="col">Location</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <th scope="row">Mira Chen</th>
            <td>Design</td>
            <td>Lisbon</td>
        </tr>
        <!-- … Tomas Reyes, Noor Haddad -->
    </tbody>
</table>
```

::

## Numbers

Put `ori-table__num` on the cells of a numeric column, and on its header: the text is end-aligned and the digits
are tabular, so every digit takes the same width and a column of numbers lines up. A `tfoot` row gets the same
hairline as a body row, above it.

::example
:table-demo{kind="numbers"}

#vue

```vue
<OriTable caption="Quarterly sales">
    <thead>
        <tr>
            <th scope="col">Region</th>
            <th scope="col" class="ori-table__num">Units</th>
            <th scope="col" class="ori-table__num">Revenue</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <th scope="row">North</th>
            <td class="ori-table__num">1,284</td>
            <td class="ori-table__num">$48,210</td>
        </tr>
        <!-- … South, East -->
    </tbody>
    <tfoot>
        <tr>
            <th scope="row">Total</th>
            <td class="ori-table__num">4,293</td>
            <td class="ori-table__num">$163,385</td>
        </tr>
    </tfoot>
</OriTable>
```

#html

```html
<table class="ori-table">
    <caption>
        Quarterly sales
    </caption>
    <thead>
        <tr>
            <th scope="col">Region</th>
            <th scope="col" class="ori-table__num">Units</th>
            <th scope="col" class="ori-table__num">Revenue</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <th scope="row">North</th>
            <td class="ori-table__num">1,284</td>
            <td class="ori-table__num">$48,210</td>
        </tr>
        <!-- … South, East -->
    </tbody>
    <tfoot>
        <tr>
            <th scope="row">Total</th>
            <td class="ori-table__num">4,293</td>
            <td class="ori-table__num">$163,385</td>
        </tr>
    </tfoot>
</table>
```

::

## Striped and hover

`striped` tints every even body row. `hover` tints the row under the pointer, and only on devices that hover
(`@media (hover: hover)`). They combine. Move the pointer over the last two tables.

::example
:table-demo{kind="rows"}

#vue

```vue
<OriTable caption="Striped" striped>…</OriTable>
<OriTable caption="Hover" hover>…</OriTable>
<OriTable caption="Striped and hover" striped hover>
    <thead>
        <tr>
            <th scope="col">Task</th>
            <th scope="col">Owner</th>
            <th scope="col">Status</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>Write the release notes</td>
            <td>Mira</td>
            <td>Done</td>
        </tr>
        <!-- … -->
    </tbody>
</OriTable>
```

#html

```html
<!-- ori-table_striped · ori-table_hover: use either or both -->
<table class="ori-table ori-table_striped ori-table_hover">
    <caption>
        Striped and hover
    </caption>
    <thead>
        <tr>
            <th scope="col">Task</th>
            <th scope="col">Owner</th>
            <th scope="col">Status</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>Write the release notes</td>
            <td>Mira</td>
            <td>Done</td>
        </tr>
        <!-- … -->
    </tbody>
</table>
```

::

## Sizes

`sm` and `lg` repoint the cell padding (`--ori-table-cell-padding`); `md` is the default and needs no class. The
text size comes from the surroundings, so a `font-size` on the table or an ancestor scales the text and the
padding together.

::example
:table-demo{kind="sizes"}

#vue

```vue
<OriTable caption="sm" size="sm">…</OriTable>
<OriTable caption="md (default)">…</OriTable>
<OriTable caption="lg" size="lg">…</OriTable>
```

#html

```html
<!-- ori-table_sm · (md: no class) · ori-table_lg -->
<table class="ori-table ori-table_sm">
    …
</table>
<table class="ori-table ori-table_lg">
    …
</table>
```

::

## Sticky header

`stickyHeader` keeps the header at the top of the scroll box while the rows scroll under it. It needs a box with a
height: `maxHeight` takes any CSS length. The header cells are painted with `--ori-table-header-bg` (the surface color by
default), so the rows do not show through; on a page with another background, set that variable to match. This one is also
`striped`. It scrolls, so the box is a named, focusable region: `Tab` to it and use
the arrow keys.

::example
:table-demo{kind="sticky"}

#vue

```vue
<script setup lang="ts">
const orders = [
    { id: '#1001', customer: 'Mira Chen', total: '$40.00' }
    // …
]
</script>

<template>
    <OriTable caption="Recent orders" sticky-header striped max-height="200px">
        <thead>
            <tr>
                <th scope="col">Order</th>
                <th scope="col">Customer</th>
                <th scope="col" class="ori-table__num">Total</th>
            </tr>
        </thead>
        <tbody>
            <tr v-for="order in orders" :key="order.id">
                <th scope="row">{{ order.id }}</th>
                <td>{{ order.customer }}</td>
                <td class="ori-table__num">{{ order.total }}</td>
            </tr>
        </tbody>
    </OriTable>
</template>
```

#html

```html
<!-- the box gives the height, and it scrolls, so it is a named, focusable region -->
<div class="ori-table-scroll" style="max-height: 200px" role="region" aria-labelledby="orders-caption" tabindex="0">
    <table class="ori-table ori-table_striped ori-table_sticky-header">
        <caption id="orders-caption">
            Recent orders
        </caption>
        <thead>
            <tr>
                <th scope="col">Order</th>
                <th scope="col">Customer</th>
                <th scope="col" class="ori-table__num">Total</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <th scope="row">#1001</th>
                <td>Mira Chen</td>
                <td class="ori-table__num">$40.00</td>
            </tr>
            <!-- … -->
        </tbody>
    </table>
</div>
```

::

## Current row

`aria-current` marks the current row: it is tinted with the accent, and the tint wins over the stripe and the
hover tint. It is an attribute, not a class, and the value `false` marks nothing. Use `aria-current` here:
`aria-selected` is not valid on a row of a plain table.

A tint is decoration, so give the row a text cue too — here a "Current plan" tag — and do not rely on the tint
alone.

::example
:table-demo{kind="current"}

#vue

```vue
<OriTable caption="Plans">
    <thead>
        <tr>
            <th scope="col">Plan</th>
            <th scope="col" class="ori-table__num">Price</th>
            <th scope="col" class="ori-table__num">Seats</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <th scope="row">Free</th>
            <td class="ori-table__num">$0</td>
            <td class="ori-table__num">1</td>
        </tr>
        <tr aria-current="true">
            <th scope="row">Pro <OriTag label="Current plan" size="xs" /></th>
            <td class="ori-table__num">$12</td>
            <td class="ori-table__num">5</td>
        </tr>
        <!-- … Team -->
    </tbody>
</OriTable>
```

#html

```html
<table class="ori-table">
    <caption>
        Plans
    </caption>
    <thead>
        <tr>
            <th scope="col">Plan</th>
            <th scope="col" class="ori-table__num">Price</th>
            <th scope="col" class="ori-table__num">Seats</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <th scope="row">Free</th>
            <td class="ori-table__num">$0</td>
            <td class="ori-table__num">1</td>
        </tr>
        <!-- state is an attribute; the tag is the text cue (see the Tag page for its markup) -->
        <tr aria-current="true">
            <th scope="row">
                Pro
                <span class="ori-tag ori-variant_soft ori-color_primary ori-font-size_xs ori-size-radius_full">
                    <span class="ori-tag__text">Current plan</span>
                </span>
            </th>
            <td class="ori-table__num">$12</td>
            <td class="ori-table__num">5</td>
        </tr>
        <!-- … Team -->
    </tbody>
</table>
```

::

## Colors

The accent paints the current row's tint. Put an `ori-color_*` class on the table — `OriTable` has no `color`
prop, and a class falls through to the `<table>`.

::example
:table-demo{kind="colors"}

#vue

```vue
<OriTable caption="success" class="ori-color_success">
    <tbody>
        <tr aria-current="true">
            <td>Current row</td>
        </tr>
        <tr>
            <td>Another row</td>
        </tr>
    </tbody>
</OriTable>
<OriTable caption="danger" class="ori-color_danger">…</OriTable>
```

#html

```html
<!-- swap the color: ori-color_primary → _secondary / _success / _warning / _danger / _info -->
<table class="ori-table ori-color_success">
    <caption>
        success
    </caption>
    <tbody>
        <tr aria-current="true">
            <td>Current row</td>
        </tr>
        <tr>
            <td>Another row</td>
        </tr>
    </tbody>
</table>
```

::

## Hidden caption

`captionHidden` keeps the caption for assistive technology only. Use it when the page already names the table for
sighted readers — a heading right above it — but a screen reader that jumps straight to the table still needs the
name. The caption is clipped, not `display: none`, so it is still read.

::example
:table-demo{kind="hidden"}

#vue

```vue
<OriTable caption="Team members" caption-hidden>
    <thead>
        <tr>
            <th scope="col">Name</th>
            <th scope="col">Role</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>Mira Chen</td>
            <td>Design</td>
        </tr>
        <!-- … -->
    </tbody>
</OriTable>
```

#html

```html
<table class="ori-table ori-table_caption-hidden">
    <caption>
        Team members
    </caption>
    <thead>
        <tr>
            <th scope="col">Name</th>
            <th scope="col">Role</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>Mira Chen</td>
            <td>Design</td>
        </tr>
        <!-- … -->
    </tbody>
</table>
```

::

## Wide table on a phone

A table wider than its container sits in `ori-table-scroll`, so a phone scrolls the table and not the page.
`OriTable` always renders the box. Here the box is as wide as a phone and the table keeps each cell on one line
(`white-space: nowrap`), so it overflows: the box becomes a region named by the caption and one tab stop, and the
arrow keys scroll it. A table that fits adds no tab stop; see [Accessibility](#accessibility).

::example
:table-demo{kind="wide"}

#vue

```vue
<!-- style goes to the table, not to the box -->
<OriTable caption="Recent orders" style="white-space: nowrap">
    <thead>
        <tr>
            <th scope="col">Order</th>
            <th scope="col">Customer</th>
            <th scope="col">Email</th>
            <th scope="col">Date</th>
            <th scope="col">Status</th>
            <th scope="col" class="ori-table__num">Total</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <th scope="row">#1001</th>
            <td>Mira Chen</td>
            <td>mira@example.com</td>
            <td>12 Mar 2026</td>
            <td>Shipped</td>
            <td class="ori-table__num">$84.00</td>
        </tr>
        <!-- … -->
    </tbody>
</OriTable>
```

#html

```html
<!-- With CSS alone the box is your markup. Add the region, the name and the tab stop only when the
     table really overflows: a box that does not scroll should not be a tab stop. -->
<div class="ori-table-scroll" role="region" aria-labelledby="orders-caption" tabindex="0">
    <table class="ori-table" style="white-space: nowrap">
        <caption id="orders-caption">
            Recent orders
        </caption>
        <thead>
            <tr>
                <th scope="col">Order</th>
                <th scope="col">Customer</th>
                <th scope="col">Email</th>
                <th scope="col">Date</th>
                <th scope="col">Status</th>
                <th scope="col" class="ori-table__num">Total</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <th scope="row">#1001</th>
                <td>Mira Chen</td>
                <td>mira@example.com</td>
                <td>12 Mar 2026</td>
                <td>Shipped</td>
                <td class="ori-table__num">$84.00</td>
            </tr>
            <!-- … -->
        </tbody>
    </table>
</div>
```

::

## Common patterns

A leaderboard: a rank, a player with an avatar, a rating and a record. The numbers are end-aligned, the player is
the row header, and `hover` helps the eye follow a row across. The current player's row carries `aria-current`
and a "You" tag, so the mark is text and not only a tint.

::example
:table-demo{kind="leaderboard"}

#vue

```vue
<script setup lang="ts">
import { OriAvatar, OriTable, OriTag } from '@oriui/vue'

const players = [
    { rank: 1, name: 'Mira Chen', rating: 2140, record: '34–12', you: false },
    { rank: 2, name: 'Tomas Reyes', rating: 2098, record: '31–15', you: false },
    { rank: 3, name: 'Noor Haddad', rating: 2054, record: '29–17', you: true }
    // …
]
</script>

<template>
    <OriTable caption="Leaderboard" hover>
        <thead>
            <tr>
                <th scope="col" class="ori-table__num">Rank</th>
                <th scope="col">Player</th>
                <th scope="col" class="ori-table__num">Rating</th>
                <th scope="col" class="ori-table__num">Wins–losses</th>
            </tr>
        </thead>
        <tbody>
            <tr v-for="player in players" :key="player.rank" :aria-current="player.you ? 'true' : undefined">
                <td class="ori-table__num">{{ player.rank }}</td>
                <th scope="row">
                    <div style="display: flex; gap: 0.5rem; align-items: center">
                        <OriAvatar :name="player.name" size="sm" />
                        <span>{{ player.name }}</span>
                        <OriTag v-if="player.you" label="You" size="xs" />
                    </div>
                </th>
                <td class="ori-table__num">{{ player.rating }}</td>
                <td class="ori-table__num">{{ player.record }}</td>
            </tr>
        </tbody>
    </OriTable>
</template>
```

#html

```html
<table class="ori-table ori-table_hover">
    <caption>
        Leaderboard
    </caption>
    <thead>
        <tr>
            <th scope="col" class="ori-table__num">Rank</th>
            <th scope="col">Player</th>
            <th scope="col" class="ori-table__num">Rating</th>
            <th scope="col" class="ori-table__num">Wins–losses</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td class="ori-table__num">1</td>
            <th scope="row">
                <div style="display: flex; gap: 0.5rem; align-items: center">
                    <!-- see the Avatar page for the markup -->
                    <div class="ori-avatar ori-avatar_sm ori-size-radius_full ori-font-size_sm">
                        <div class="ori-avatar__backdrop" aria-hidden="true">MC</div>
                    </div>
                    <span>Mira Chen</span>
                </div>
            </th>
            <td class="ori-table__num">2140</td>
            <td class="ori-table__num">34–12</td>
        </tr>
        <!-- … -->
        <!-- the current player: the attribute for the tint, the tag for the text cue -->
        <tr aria-current="true">
            <td class="ori-table__num">3</td>
            <th scope="row">
                <div style="display: flex; gap: 0.5rem; align-items: center">
                    <div class="ori-avatar ori-avatar_sm ori-size-radius_full ori-font-size_sm">
                        <div class="ori-avatar__backdrop" aria-hidden="true">NH</div>
                    </div>
                    <span>Noor Haddad</span>
                    <span class="ori-tag ori-variant_soft ori-color_primary ori-font-size_xs ori-size-radius_full">
                        <span class="ori-tag__text">You</span>
                    </span>
                </div>
            </th>
            <td class="ori-table__num">2054</td>
            <td class="ori-table__num">29–17</td>
        </tr>
        <!-- … -->
    </tbody>
</table>
```

::

## Accessibility

The accessibility contract holds across every layer — the standalone classes and the Vue component render the
same table; `OriTable` adds the scroll box's accessibility for you.

- It is a real `<table>`: rows, columns and header cells are exposed natively, and the classes change only how it
  looks. Write `thead`, `tbody` and `tfoot` and use `th` for headers.
- Name every table with a `<caption>` (the `caption` prop or the `caption` slot). `captionHidden` clips it
  visually, not with `display: none`, so assistive technology still reads it.
- Mark the header cells: `scope="col"` in the header row, and `scope="row"` on a row's header cell.
- A table wider or taller than its box must make the box a **named, focusable region**: `role="region"`,
  `aria-labelledby` pointing at the caption, and `tabindex="0"`. Without it a keyboard user cannot scroll the box
  (axe rule `scrollable-region-focusable`). With CSS alone that is your markup; add it when the table overflows.
- `OriTable` does it for you, and only **while** the table overflows: it measures the box and the table with a
  `ResizeObserver` (width and height), so a table that fits adds no tab stop, and the region follows a resize in
  either direction. On the server nothing is measured, so the region appears once the page has loaded. A table with
  no caption still gets the tab stop, but the region has no name: always give it a caption.
- The current row is marked with `aria-current` on the `tr`, not `aria-selected`, which is not valid on a row of a
  plain table. The tint is decoration: also show a text cue in the row, such as a "You" tag.
- The stripe, hover and current-row tints are light mixes over the background and the text keeps its color; our
  contrast suite measures the text on the striped and the current row. Hover is feedback only: nothing depends on
  it, and it is limited to devices that hover.
- Focus on the scroll box is a 2px `outline` in the primary color, offset by 2px, on `:focus-visible`.
- Alignment is logical (`text-align: start` and `end`), so `dir="rtl"` mirrors the table with no extra class.

The table itself is not interactive; only the scroll box takes focus, and only when it scrolls. The keys on a
focused box are the browser's own.

| Key                        | Action                                                             |
| -------------------------- | ------------------------------------------------------------------ |
| `Tab` / `Shift+Tab`        | Moves focus to / from the scroll box, when the table overflows it. |
| `ArrowLeft` / `ArrowRight` | Scrolls the focused box sideways (browser).                        |
| `ArrowUp` / `ArrowDown`    | Scrolls the focused box up and down (browser).                     |
| `PageUp` / `PageDown`      | Scrolls a page at a time (browser).                                |
| `Home` / `End`             | Scrolls to the start / end (browser).                              |

## Framework API

The props, attributes and slots of the **Vue** component. The standalone CSS layer has no component API — its
surface is the [classes](#classes) above.

### Props

| Prop            | Type                   | Default | Description                                                                                         |
| --------------- | ---------------------- | ------- | --------------------------------------------------------------------------------------------------- |
| `caption`       | `string`               | —       | The table's name, rendered as its `<caption>`. The `caption` slot replaces it.                      |
| `captionHidden` | `boolean`              | `false` | Keeps the caption for assistive technology only (`ori-table_caption-hidden`).                       |
| `hover`         | `boolean`              | `false` | Tints the row under the pointer (`ori-table_hover`).                                                |
| `maxHeight`     | `string`               | —       | A `max-height` for the scroll box, any CSS length (`'200px'`, `'40vh'`). Pairs with `stickyHeader`. |
| `size`          | `'sm' \| 'md' \| 'lg'` | `'md'`  | Cell density.                                                                                       |
| `stickyHeader`  | `boolean`              | `false` | Keeps the header row in view while the rows scroll (`ori-table_sticky-header`).                     |
| `striped`       | `boolean`              | `false` | Shades every other body row (`ori-table_striped`).                                                  |

### Events & attributes

OriTable declares **no custom events**. It sets `inheritAttrs: false` and binds every attribute and listener to the
**`<table>`**, not to the scroll box around it: `class` is merged with the `ori-table` classes, and `style`, `id`,
`data-*` and `aria-*` land on the table. The box's own `role`, `aria-labelledby` and `tabindex` are set by the
component, while the table overflows.

### Slots

| Slot      | Description                                                                                                                  |
| --------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `default` | Your `thead`, `tbody` and `tfoot`, rendered in the table after the caption. Write the `tbody` yourself.                      |
| `caption` | Replaces the `caption` prop with your own content (inline markup, a link). It is still the `<caption>` that names the table. |
