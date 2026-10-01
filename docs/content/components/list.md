---
title: List
---

# List

A vertical list of rows for settings panels, action panels and navigation. Each row reads **start → label →
end**: an icon, a label with an optional description line, and at the end a shortcut hint, a chevron into a
sub-panel, or a control of your own.

A list is not a [menu](/components/menu). A menu is a transient popup of actions with `role="menu"` and roving
arrow keys. A list is part of the page, reached with `Tab`, and a row can hold a control — a switch, a segmented
control — in a static row, which `role="menu"` forbids.

The examples are organized by **layer**: the [class reference](#classes) is the standalone
**`@oriui/css`** layer, and the [Framework API](#framework-api) is the **`@oriui/vue`** components, `OriList`
and `OriListItem`. Every example is live — flip its code between **HTML** (the standalone classes, also your
htmx / Astro / Svelte / plain-HTML usage), **Vue**; HTML is the default.

## When to use

| Control                            | Pick it when                                                                                                   |
| ---------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| **List**                           | Rows that stay on the page: a settings panel, a panel of actions, a navigation column. Rows may hold controls. |
| [Menu](/components/menu)           | A transient popup opened from a trigger; arrow keys move through it, one action is chosen and it closes.       |
| [Tabs](/components/tabs)           | Entries that switch panels of content in place.                                                                |
| [Accordion](/components/accordion) | Sections that open and close to reveal their own content.                                                      |

## Classes

A list is a block class plus single-class token utilities — one class repoints one token. A row is a
`ori-list__row` inside an `ori-list__item`; its parts are the `__start`, `__main` and `__end` cells. The Vue
props in [Framework API](#framework-api) map 1:1 to these.

<!-- prettier-ignore -->
:class-table{:rows='[{"class":"ori-list","type":"Block","description":"Required base class, on a <code>ul</code> with role=list. A flex column with a 2px gap and no marker, margin or padding. Bakes the primary accent and the md radius at zero specificity."},{"class":"ori-list_divided","type":"Modifier","description":"No gap; a 1px hairline in the outline color between rows."},{"class":"ori-color_*","type":"Color","description":"<b>primary</b> · secondary · success · warning · danger · info — the accent of the current row: its tint, its bar and the focus ring. Put it on the <code>ul</code>."},{"class":"ori-size-radius_*","type":"Radius","description":"none · xs · sm · <b>md</b> · lg · xl · full — the corner radius of a row. Put it on the <code>ul</code>."},{"class":"ori-list__item","type":"Part","description":"The <code>li</code> that wraps one row."},{"class":"ori-list__row","type":"Part","description":"One row: a <code>button</code>, an <code>a</code> or a <code>div</code>. A flex row with a 0.75em gap and a 2.5em minimum height. Only a button or a link gets the hover tint and the pointer cursor."},{"class":"ori-list__start · ori-list__end","type":"Part","description":"The leading and the trailing cell; neither shrinks. Start holds an icon (faded to 0.8); end holds a hint, a chevron or a control."},{"class":"ori-list__main","type":"Part","description":"The text column; it takes the remaining width and holds the label and the description."},{"class":"ori-list__label · ori-list__description","type":"Part","description":"The label (one line, truncated with an ellipsis) / a second line under it (0.85em, faded to 0.7)."},{"class":"ori-list__hint · ori-list__chevron","type":"Part","description":"Text at the end, such as a shortcut (0.8em, faded to 0.7) / an arrow into a sub-panel (faded to 0.6, mirrored in RTL)."},{"class":"aria-current · disabled · aria-disabled","type":"State","description":"real attributes, not classes — the current row gets a tint and a bar; a disabled row is dimmed to 45% with a not-allowed cursor."}]'}

**À la carte:** the classes above ship in `@oriui/css/components/list.css`, which inlines the icon styles a row
needs. Import a foundation (`@oriui/css/base.css` or `@oriui/css/tokens.css`) first — the token utilities
(`ori-color_*`, `ori-size-radius_*`, …) live there, not in the component file. The full bundle `@oriui/css` is
the default and already carries both; see [à-la-carte imports](/guides/css).

Accent `primary` and radius `md` are baked in at zero specificity, so a bare `ori-list` is already complete and
one utility class on the `<ul>` repoints either. Rows inherit the font and are sized in `em`, so a `font-size`
on the list (or any ancestor) scales them.

## Anatomy

```
ul.ori-list                           [role="list"]; ori-list_divided adds hairlines
  li.ori-list__item                   one per row
    button | a | div .ori-list__row   the row element: what it does decides which
      span.ori-list__start            icon (optional, aria-hidden)
      span.ori-list__main
        span.ori-list__label          the label
        span.ori-list__description    second line (optional)
      span.ori-list__end              optional
        span.ori-list__hint           a shortcut, or any short text
        svg.ori-list__chevron         arrow into a sub-panel (aria-hidden)
                                      — or a control of your own, in a static row
```

## Basic

Rows that only show information are static: no listener, no `href`, so each is a plain `<div>`. A `hint` puts
a value or a shortcut at the end.

::example
::ori-list{style="width: 100%; max-width: 22rem"}
:ori-list-item{label="Storage" hint="2.4 of 5 GB"}
:ori-list-item{label="Last sync" hint="2 minutes ago"}
:ori-list-item{label="Version" hint="1.4.0"}
::

#vue

```vue
<OriList>
    <OriListItem label="Storage" hint="2.4 of 5 GB" />
    <OriListItem label="Last sync" hint="2 minutes ago" />
    <OriListItem label="Version" hint="1.4.0" />
</OriList>
```

#html

```html
<!-- accent primary and radius md are the baked defaults; role="list" is stated on purpose, see Accessibility -->
<ul class="ori-list" role="list">
    <li class="ori-list__item">
        <div class="ori-list__row">
            <span class="ori-list__main"><span class="ori-list__label">Storage</span></span>
            <span class="ori-list__end"><span class="ori-list__hint">2.4 of 5 GB</span></span>
        </div>
    </li>
    <li class="ori-list__item">
        <div class="ori-list__row">
            <span class="ori-list__main"><span class="ori-list__label">Last sync</span></span>
            <span class="ori-list__end"><span class="ori-list__hint">2 minutes ago</span></span>
        </div>
    </li>
    <li class="ori-list__item">
        <div class="ori-list__row">
            <span class="ori-list__main"><span class="ori-list__label">Version</span></span>
            <span class="ori-list__end"><span class="ori-list__hint">1.4.0</span></span>
        </div>
    </li>
</ul>
```

::

## Start, description, hint and chevron

The four parts of a row. `icon` is an SVG path drawn by [OriIcon](/components/icon) at the start;
`description` is a second line under the label; `hint` is text at the end; `chevron` is an arrow at the end
that says the row opens a sub-panel. They compose — the last row uses all four.

::example
::ori-list{style="width: 100%; max-width: 22rem"}
:ori-list-item{icon="M11 13H5v-2h6V5h2v6h6v2h-6v6h-2z" label="Icon"}
:ori-list-item{label="Description" description="A second line under the label"}
:ori-list-item{label="Hint" hint="Ctrl+S"}
:ori-list-item{label="Chevron" :chevron="true"}
:ori-list-item{icon="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" label="All four" description="Export the drawing" hint="Ctrl+E" :chevron="true"}
::

#vue

```vue
<OriList>
    <OriListItem icon="M11 13H5v-2h6V5h2v6h6v2h-6v6h-2z" label="Icon" />
    <OriListItem label="Description" description="A second line under the label" />
    <OriListItem label="Hint" hint="Ctrl+S" />
    <OriListItem label="Chevron" chevron />
    <OriListItem
        icon="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"
        label="All four"
        description="Export the drawing"
        hint="Ctrl+E"
        chevron
    />
</OriList>
```

#html

```html
<ul class="ori-list" role="list">
    <li class="ori-list__item">
        <div class="ori-list__row">
            <!-- the icon is an OriIcon: a decorative <i> carrying an inline SVG -->
            <span class="ori-list__start">
                <i class="ori-icon ori-icon_inherit" aria-hidden="true">
                    <svg viewBox="0 0 24 24"><path d="M11 13H5v-2h6V5h2v6h6v2h-6v6h-2z" /></svg>
                </i>
            </span>
            <span class="ori-list__main"><span class="ori-list__label">Icon</span></span>
        </div>
    </li>
    <li class="ori-list__item">
        <div class="ori-list__row">
            <span class="ori-list__main">
                <span class="ori-list__label">Description</span>
                <span class="ori-list__description">A second line under the label</span>
            </span>
        </div>
    </li>
    <li class="ori-list__item">
        <div class="ori-list__row">
            <span class="ori-list__main"><span class="ori-list__label">Hint</span></span>
            <span class="ori-list__end"><span class="ori-list__hint">Ctrl+S</span></span>
        </div>
    </li>
    <li class="ori-list__item">
        <div class="ori-list__row">
            <span class="ori-list__main"><span class="ori-list__label">Chevron</span></span>
            <span class="ori-list__end">
                <svg class="ori-list__chevron" viewBox="0 0 24 24" width="1em" height="1em" aria-hidden="true">
                    <path
                        d="m9 6 6 6-6 6"
                        fill="none"
                        stroke="currentcolor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                    />
                </svg>
            </span>
        </div>
    </li>
    <!-- … and a row with all four: start, main (label + description), end (hint + chevron) -->
</ul>
```

::

The chevron is drawn on the inline-end side and mirrored in RTL — see [Right to left](#right-to-left).

## Divided

`divided` removes the gap between rows and draws a hairline between them instead — the shape of a settings
panel or a stack of actions.

::example
::ori-list{:divided="true" style="width: 100%; max-width: 22rem"}
:ori-list-item{label="Profile" description="Name, photo and bio"}
:ori-list-item{label="Privacy" description="Who can see your drawings"}
:ori-list-item{label="Storage" description="2.4 of 5 GB used"}
::

#vue

```vue
<OriList divided>
    <OriListItem label="Profile" description="Name, photo and bio" />
    <OriListItem label="Privacy" description="Who can see your drawings" />
    <OriListItem label="Storage" description="2.4 of 5 GB used" />
</OriList>
```

#html

```html
<ul class="ori-list ori-list_divided" role="list">
    <li class="ori-list__item">
        <div class="ori-list__row">
            <span class="ori-list__main">
                <span class="ori-list__label">Profile</span>
                <span class="ori-list__description">Name, photo and bio</span>
            </span>
        </div>
    </li>
    <!-- … Privacy, Storage -->
</ul>
```

::

## Rows that act

The row element follows what the row does. The first rule that matches wins:

| You pass                    | The row is               | Use it for                                             |
| --------------------------- | ------------------------ | ------------------------------------------------------ |
| `as`                        | that tag or component    | A router link, or any element of your own.             |
| `href`                      | `<a>`                    | Navigation.                                            |
| a click listener (`@click`) | `<button type="button">` | An action: save, export, open a sub-panel.             |
| none of these               | `<div>`                  | Information, or a row that holds a control of its own. |

Only a static `<div>` row may hold a control, since a control inside a button or a link is invalid HTML — see
[Control in a row](#control-in-a-row). Attributes and listeners go to the row element, not to the `<li>`.

A button row is activated with `Enter` or `Space`. Click one below; the last, `disabled`, is a real
`disabled` button and is skipped by `Tab`.

::example
:list-demo{kind="actions"}

#vue

```vue
<script setup lang="ts">
import { ref } from 'vue'

const last = ref('')
</script>

<template>
    <OriList divided>
        <OriListItem label="New drawing" hint="Ctrl+N" @click="last = 'New drawing'" />
        <OriListItem label="Save" hint="Ctrl+S" @click="last = 'Save'" />
        <OriListItem label="Export" chevron @click="last = 'Export'" />
        <OriListItem label="Revert to saved" disabled @click="last = 'Revert to saved'" />
    </OriList>
    <p>Last activated: {{ last || 'nothing yet' }}</p>
</template>
```

#html

```html
<ul class="ori-list ori-list_divided" role="list">
    <li class="ori-list__item">
        <!-- an action is a real <button type="button"> -->
        <button type="button" class="ori-list__row">
            <span class="ori-list__main"><span class="ori-list__label">New drawing</span></span>
            <span class="ori-list__end"><span class="ori-list__hint">Ctrl+N</span></span>
        </button>
    </li>
    <!-- … Save, Export (with the chevron) -->
    <li class="ori-list__item">
        <!-- the real disabled attribute drives the dimming -->
        <button type="button" class="ori-list__row" disabled>
            <span class="ori-list__main"><span class="ori-list__label">Revert to saved</span></span>
        </button>
    </li>
</ul>
```

::

## Current

`current` marks the current page or the selected entry. The row is tinted **and** carries a bar on its
inline-start edge in the accent's text tone: the tint alone is too faint to mark it (WCAG 1.4.11), so the bar
carries the signal. The bar flips to the right edge in RTL. On the tint the description and the hint fade less
(0.85 instead of 0.7), so they stay AA.

It renders `aria-current`: `"page"` on a link — a navigation list — and `"true"` on any other row. A
navigation list goes in a `<nav aria-label="…">`, which the list does not add itself.

::::example
:::nav{aria-label="Related components" style="width: 100%; max-width: 22rem"}
::ori-list
:ori-list-item{label="Menu" href="/components/menu" description="A popup of actions"}
:ori-list-item{label="List" href="/components/list" description="Rows that stay on the page" :current="true"}
:ori-list-item{label="Tabs" href="/components/tabs" description="Switch panels of content"}
::
:::

#vue

```vue
<nav aria-label="Related components">
    <OriList>
        <OriListItem label="Menu" href="/components/menu" description="A popup of actions" />
        <OriListItem label="List" href="/components/list" description="Rows that stay on the page" current />
        <OriListItem label="Tabs" href="/components/tabs" description="Switch panels of content" />
    </OriList>
</nav>
```

#html

```html
<nav aria-label="Related components">
    <ul class="ori-list" role="list">
        <li class="ori-list__item">
            <a class="ori-list__row" href="/components/menu">
                <span class="ori-list__main">
                    <span class="ori-list__label">Menu</span>
                    <span class="ori-list__description">A popup of actions</span>
                </span>
            </a>
        </li>
        <li class="ori-list__item">
            <!-- state is an attribute: aria-current="page" on a link, "true" on any other row -->
            <a class="ori-list__row" href="/components/list" aria-current="page">
                <span class="ori-list__main">
                    <span class="ori-list__label">List</span>
                    <span class="ori-list__description">Rows that stay on the page</span>
                </span>
            </a>
        </li>
        <!-- … Tabs -->
    </ul>
</nav>
```

::::

A selection that is not navigation — a view, a panel, a tool — is a button row whose `current` follows the
click. Here the current row reads `aria-current="true"`.

::example
:list-demo{kind="selectable"}

#vue

```vue
<script setup lang="ts">
import { ref } from 'vue'

const views = [
    { value: 'layers', label: 'Layers', description: 'Stack, reorder and hide' },
    { value: 'brushes', label: 'Brushes', description: 'Size, opacity and shape' },
    { value: 'palette', label: 'Palette', description: 'Swatches and recent colors' }
]
const view = ref('layers')
</script>

<template>
    <OriList>
        <OriListItem
            v-for="v in views"
            :key="v.value"
            :label="v.label"
            :description="v.description"
            :current="view === v.value"
            @click="view = v.value"
        />
    </OriList>
</template>
```

#html

```html
<ul class="ori-list" role="list">
    <li class="ori-list__item">
        <button type="button" class="ori-list__row" aria-current="true">
            <span class="ori-list__main">
                <span class="ori-list__label">Layers</span>
                <span class="ori-list__description">Stack, reorder and hide</span>
            </span>
        </button>
    </li>
    <li class="ori-list__item">
        <!-- no attribute at all when the row is not current: move aria-current as the selection moves -->
        <button type="button" class="ori-list__row">
            <span class="ori-list__main">
                <span class="ori-list__label">Brushes</span>
                <span class="ori-list__description">Size, opacity and shape</span>
            </span>
        </button>
    </li>
    <!-- … Palette -->
</ul>
```

::

## Disabled

`disabled` on a button row is the real `disabled` attribute: the row is dimmed and `Tab` skips it. A link row
cannot be disabled natively, so it drops its `href` and gets `aria-disabled="true"` — an `<a>` without an
`href` is neither followed nor focused.

`disabled` removes the `href` the row was given and swallows clicks on a link or component row before any
listener runs, so a router link passed to `as` does not navigate either. A static row ignores `disabled`.

::example
::ori-list{style="width: 100%; max-width: 22rem"}
:ori-list-item{label="Gallery" href="/components/list" description="Your saved drawings"}
:ori-list-item{label="Shared with me" href="/components/list" description="Sign in to see shared drawings" :disabled="true"}
::

#vue

```vue
<OriList>
    <OriListItem label="Gallery" href="/gallery" description="Your saved drawings" />
    <OriListItem label="Shared with me" href="/shared" description="Sign in to see shared drawings" disabled />
    <!-- a button row: the real disabled attribute -->
    <OriListItem label="Revert to saved" disabled @click="revert" />
</OriList>
```

#html

```html
<ul class="ori-list" role="list">
    <li class="ori-list__item">
        <a class="ori-list__row" href="/gallery">
            <span class="ori-list__main">
                <span class="ori-list__label">Gallery</span>
                <span class="ori-list__description">Your saved drawings</span>
            </span>
        </a>
    </li>
    <li class="ori-list__item">
        <!-- a link row: no href (so it is not followed or focused) and aria-disabled -->
        <a class="ori-list__row" aria-disabled="true">
            <span class="ori-list__main">
                <span class="ori-list__label">Shared with me</span>
                <span class="ori-list__description">Sign in to see shared drawings</span>
            </span>
        </a>
    </li>
    <li class="ori-list__item">
        <!-- a button row: the real disabled attribute -->
        <button type="button" class="ori-list__row" disabled>
            <span class="ori-list__main"><span class="ori-list__label">Revert to saved</span></span>
        </button>
    </li>
</ul>
```

::

## Colors

The accent paints the current row: the tint, the bar and the focus ring. Put an `ori-color_*` utility on the
list — the component has no `color` prop, and a class falls through to the `<ul>`. The bar reads the accent's
AA-safe text tone rather than the raw role.

::example
::ori-list{class="ori-color_primary" style="width: 13rem"}
:ori-list-item{label="primary" :current="true"}
:ori-list-item{label="Another row"}
::
::ori-list{class="ori-color_secondary" style="width: 13rem"}
:ori-list-item{label="secondary" :current="true"}
:ori-list-item{label="Another row"}
::
::ori-list{class="ori-color_success" style="width: 13rem"}
:ori-list-item{label="success" :current="true"}
:ori-list-item{label="Another row"}
::
::ori-list{class="ori-color_warning" style="width: 13rem"}
:ori-list-item{label="warning" :current="true"}
:ori-list-item{label="Another row"}
::
::ori-list{class="ori-color_danger" style="width: 13rem"}
:ori-list-item{label="danger" :current="true"}
:ori-list-item{label="Another row"}
::
::ori-list{class="ori-color_info" style="width: 13rem"}
:ori-list-item{label="info" :current="true"}
:ori-list-item{label="Another row"}
::

#vue

```vue
<OriList class="ori-color_success">
    <OriListItem label="success" current />
    <OriListItem label="Another row" />
</OriList>
<OriList class="ori-color_danger">
    <OriListItem label="danger" current />
    <OriListItem label="Another row" />
</OriList>
```

#html

```html
<!-- swap the color: ori-color_primary → _secondary / _success / _warning / _danger / _info -->
<ul class="ori-list ori-color_success" role="list">
    <li class="ori-list__item">
        <div class="ori-list__row" aria-current="true">
            <span class="ori-list__main"><span class="ori-list__label">success</span></span>
        </div>
    </li>
    <!-- … Another row -->
</ul>
```

::

## Radius

The rows follow the shared `ori-size-radius_*` token: `none` to `full` (pill). The component has no `radius`
prop — put the utility on the list. The bar is an inset shadow, so on a large radius it curves with the row.

::example
::ori-list{class="ori-size-radius_none" style="width: 13rem"}
:ori-list-item{label="none" :current="true"}
:ori-list-item{label="Another row"}
::
::ori-list{class="ori-size-radius_lg" style="width: 13rem"}
:ori-list-item{label="lg" :current="true"}
:ori-list-item{label="Another row"}
::
::ori-list{class="ori-size-radius_full" style="width: 13rem"}
:ori-list-item{label="full" :current="true"}
:ori-list-item{label="Another row"}
::

#vue

```vue
<OriList class="ori-size-radius_none">…</OriList>
<OriList class="ori-size-radius_full">…</OriList>
```

#html

```html
<!-- ori-size-radius_*: none · xs · sm · md · lg · xl · full -->
<ul class="ori-list ori-size-radius_full" role="list">
    …
</ul>
```

::

## Control in a row

A static row may hold a control in its `end` cell: a switch, a segmented control, anything that is its own
focus stop. The row is a `<div>`, so the control is not nested in a button or a link. The row's label does not
name the control — give the control its own `aria-label`.

::example
:list-demo{kind="control"}

#vue

```vue
<script setup lang="ts">
import { ref } from 'vue'

const notify = ref(true)
const theme = ref('auto')
const themes = [
    { label: 'Light', value: 'light' },
    { label: 'Dark', value: 'dark' },
    { label: 'Auto', value: 'auto' }
]
</script>

<template>
    <OriList divided>
        <OriListItem icon="…" label="Notifications" description="Mentions and replies">
            <template #end>
                <OriSwitch v-model="notify" aria-label="Notifications" />
            </template>
        </OriListItem>
        <OriListItem icon="…" label="Theme">
            <template #end>
                <OriSegmentedControl v-model="theme" aria-label="Theme" size="sm" :options="themes" />
            </template>
        </OriListItem>
    </OriList>
</template>
```

#html

```html
<ul class="ori-list ori-list_divided" role="list">
    <li class="ori-list__item">
        <!-- a static row: a <div>, so the control inside is valid HTML -->
        <div class="ori-list__row">
            <span class="ori-list__main">
                <span class="ori-list__label">Notifications</span>
                <span class="ori-list__description">Mentions and replies</span>
            </span>
            <span class="ori-list__end">
                <label class="ori-switch ori-color_primary ori-font-size_md">
                    <input class="ori-switch__input" type="checkbox" role="switch" aria-label="Notifications" checked />
                    <span class="ori-switch__track" aria-hidden="true"><span class="ori-switch__thumb"></span></span>
                </label>
            </span>
        </div>
    </li>
    <li class="ori-list__item">
        <div class="ori-list__row">
            <span class="ori-list__main"><span class="ori-list__label">Theme</span></span>
            <span class="ori-list__end">
                <!-- see the Segmented control page for the full markup -->
                <div
                    class="ori-segmented-control ori-segmented-control_sm ori-font-size_sm"
                    role="radiogroup"
                    aria-label="Theme"
                >
                    …
                </div>
            </span>
        </div>
    </li>
</ul>
```

::

Do not put a control in a link or a button row: that nests an interactive element in another, which is
invalid HTML and breaks both keyboard and screen-reader use. If the whole row must act as well, make the
control the only action.

## Custom content

The slots replace the built-in cells. `start` replaces the icon, `end` replaces the hint and the chevron, and
the default slot replaces the label and the description — the content you pass sits inside `ori-list__main`.
Here a status icon at the start and a tag at the end.

::example
:list-demo{kind="custom"}

#vue

```vue
<OriList divided>
    <OriListItem label="Build 128" description="Deployed 4 minutes ago">
        <template #start>
            <OriIcon icon="M12 2C6.48 2 2 6.48…" color="success" />
        </template>
        <template #end>
            <OriTag label="Passed" color="success" />
        </template>
    </OriListItem>
    <OriListItem label="Build 127" description="Failed 1 hour ago">
        <template #start>
            <OriIcon icon="M12 2C6.48 2 2 6.48…" color="danger" />
        </template>
        <template #end>
            <OriTag label="Failed" color="danger" />
        </template>
    </OriListItem>
</OriList>
```

#html

```html
<ul class="ori-list ori-list_divided" role="list">
    <li class="ori-list__item">
        <div class="ori-list__row">
            <span class="ori-list__start">
                <i class="ori-icon ori-icon_inherit ori-color_success" aria-hidden="true">
                    <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48…" /></svg>
                </i>
            </span>
            <span class="ori-list__main">
                <span class="ori-list__label">Build 128</span>
                <span class="ori-list__description">Deployed 4 minutes ago</span>
            </span>
            <span class="ori-list__end">
                <!-- see the Tag page for the markup -->
                <span class="ori-tag ori-color_success">…</span>
            </span>
        </div>
    </li>
    <!-- … Build 127 -->
</ul>
```

::

The icon is decorative (`aria-hidden`); the text that says what happened — here the tag — stays in the row, so
the status never rests on color alone.

## Right to left

The bar and the chevron are logical: they sit on the inline-start and inline-end edges, and a `dir="rtl"`
mirrors them with no extra class. Rows lay out start → end, so the icon, the label and the end cell swap sides
too.

::example
::ori-list{dir="rtl" style="width: 100%; max-width: 22rem"}
:ori-list-item{icon="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" label="Home" :current="true"}
:ori-list-item{icon="M11 13H5v-2h6V5h2v6h6v2h-6v6h-2z" label="Projects" hint="12" :chevron="true"}
::

#vue

```vue
<OriList dir="rtl">
    <OriListItem icon="…" label="Home" current />
    <OriListItem icon="…" label="Projects" hint="12" chevron />
</OriList>
```

#html

```html
<!-- dir="rtl" on the list (or any ancestor): the bar moves to the right edge, the chevron is mirrored -->
<ul class="ori-list" role="list" dir="rtl">
    …
</ul>
```

::

## Common patterns

A panel of an app: a file menu of actions with shortcut hints and a chevron into a sub-panel, a theme row that
holds a segmented control, and a link row into another page. The first three rows are buttons, the fourth is a
static row holding a control, the last is a link — one list, four kinds of row.

::example
:list-demo{kind="panel"}

#vue

```vue
<script setup lang="ts">
import { ref } from 'vue'

const theme = ref('auto')
const themes = [
    { label: 'Light', value: 'light' },
    { label: 'Dark', value: 'dark' },
    { label: 'Auto', value: 'auto' }
]
</script>

<template>
    <OriSurface style="padding: 0.375rem">
        <OriList divided>
            <OriListItem :icon="plusPath" label="New drawing" hint="Ctrl+N" @click="newDrawing" />
            <OriListItem :icon="savePath" label="Save" hint="Ctrl+S" @click="save" />
            <OriListItem :icon="exportPath" label="Export" chevron @click="openExport" />
            <OriListItem :icon="themePath" label="Theme">
                <template #end>
                    <OriSegmentedControl v-model="theme" aria-label="Theme" size="sm" :options="themes" />
                </template>
            </OriListItem>
            <OriListItem :icon="galleryPath" label="Gallery" description="Your saved drawings" href="/gallery" />
        </OriList>
    </OriSurface>
</template>
```

#html

```html
<div class="ori-surface ori-surface_elevation-lg ori-surface_bordered ori-size-radius_lg" style="padding: 0.375rem">
    <ul class="ori-list ori-list_divided" role="list">
        <li class="ori-list__item">
            <button type="button" class="ori-list__row">
                <span class="ori-list__start">
                    <i class="ori-icon ori-icon_inherit" aria-hidden="true">
                        <svg viewBox="0 0 24 24"><path d="M11 13H5v-2h6V5h2v6h6v2h-6v6h-2z" /></svg>
                    </i>
                </span>
                <span class="ori-list__main"><span class="ori-list__label">New drawing</span></span>
                <span class="ori-list__end"><span class="ori-list__hint">Ctrl+N</span></span>
            </button>
        </li>
        <!-- … Save (Ctrl+S) -->
        <li class="ori-list__item">
            <button type="button" class="ori-list__row">
                <span class="ori-list__start">
                    <i class="ori-icon ori-icon_inherit" aria-hidden="true"><svg viewBox="0 0 24 24">…</svg></i>
                </span>
                <span class="ori-list__main"><span class="ori-list__label">Export</span></span>
                <span class="ori-list__end">
                    <svg class="ori-list__chevron" viewBox="0 0 24 24" width="1em" height="1em" aria-hidden="true">
                        <path
                            d="m9 6 6 6-6 6"
                            fill="none"
                            stroke="currentcolor"
                            stroke-width="2"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                        />
                    </svg>
                </span>
            </button>
        </li>
        <li class="ori-list__item">
            <!-- a static row: the control lives in the end cell and names itself -->
            <div class="ori-list__row">
                <span class="ori-list__start">
                    <i class="ori-icon ori-icon_inherit" aria-hidden="true"><svg viewBox="0 0 24 24">…</svg></i>
                </span>
                <span class="ori-list__main"><span class="ori-list__label">Theme</span></span>
                <span class="ori-list__end">
                    <div
                        class="ori-segmented-control ori-segmented-control_sm ori-font-size_sm"
                        role="radiogroup"
                        aria-label="Theme"
                    >
                        …
                    </div>
                </span>
            </div>
        </li>
        <li class="ori-list__item">
            <a class="ori-list__row" href="/gallery">
                <span class="ori-list__start">
                    <i class="ori-icon ori-icon_inherit" aria-hidden="true"><svg viewBox="0 0 24 24">…</svg></i>
                </span>
                <span class="ori-list__main">
                    <span class="ori-list__label">Gallery</span>
                    <span class="ori-list__description">Your saved drawings</span>
                </span>
            </a>
        </li>
    </ul>
</div>
```

::

## Accessibility

The accessibility contract holds across every layer — the standalone classes and the Vue components render the
same attributes and keyboard behavior.

- The list is a `<ul>` with `role="list"` **stated**: Safari drops list semantics from a `<ul>` styled
  `list-style: none`, and the explicit role keeps it announced as a list. Each row sits in an `<li>`.
- A navigation list goes in a `<nav aria-label="…">`. The list adds no landmark of its own, and an unlabeled
  `<nav>` is announced as just "navigation".
- A row that acts is a real `<button type="button">` or `<a href>`; a row that only holds content is a
  `<div>`. Its accessible name is its content: the label, the description and the hint read as one string
  ("New drawing Ctrl+N"). The icon and the chevron are `aria-hidden`.
- `current` renders `aria-current`: `"page"` on a link — and on any element other than a `<button>` or a
  `<div>` — and `"true"` on a button or a static row. Set it through `current`, not as a raw attribute.
- The current row is not marked by tint alone: the tint is too faint (WCAG 1.4.11), so it also carries a bar on
  its inline-start edge in the accent's AA-safe text tone. Do not remove the bar when restyling.
- `disabled`: a button row is a native `disabled` button (dimmed to 45%, skipped by `Tab`); a link row drops its
  `href` and gets `aria-disabled="true"`, so it is neither a followable nor a focusable link. A static row
  ignores `disabled`.
- A control in a row's `end` cell needs its own accessible name (`aria-label`): the row's label text is not
  wired to it. Never put a control in a link or a button row.
- The description and the hint are faded to 0.7 of the text color, and to 0.85 on the current row's tint, so
  they stay readable (AA) on both backgrounds.
- Focus is drawn on the row: a 2 px `outline` in the accent color, inset by 2 px so it is not clipped by the
  list's edge, on `:focus-visible`. The hover tint sits inside `@media (hover: hover)` and the tint transition
  is off under `prefers-reduced-motion`.
- There is no arrow-key roving: the rows are ordinary tab stops, because a list of navigation links is not a
  menu in the WAI-ARIA Authoring Practices. Use a [menu](/components/menu) when you want one tab stop and
  arrow keys.
- Writing direction is respected: the bar sits on the inline-start edge, the chevron is mirrored, and `ori-list__start`
  and `ori-list__end` swap sides with `dir`.

| Key                 | Action                                                                                                                     |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `Tab` / `Shift+Tab` | Moves focus to the next / previous interactive row, then on to the controls inside static rows. A disabled row is skipped. |
| `Enter`             | Activates a button row or follows a link row.                                                                              |
| `Space`             | Activates a button row (native). A link row is activated with `Enter` only.                                                |

A control inside a static row keeps its own keys: a switch toggles on `Space`, a segmented control moves with
the arrows. The list takes none of them.

## Framework API

The props, attributes and slots of the **Vue** components. The standalone CSS layer has no component API — its
surface is the [classes](#classes) above.

### Props

`OriList`:

| Prop      | Type      | Default | Description                                                        |
| --------- | --------- | ------- | ------------------------------------------------------------------ |
| `divided` | `boolean` | `false` | No gap between rows; a hairline between them (`ori-list_divided`). |

`OriListItem`:

| Prop          | Type               | Default                                                   | Description                                                                                                            |
| ------------- | ------------------ | --------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| `as`          | `string \| object` | `'a'` with `href`, `'button'` with `@click`, else `'div'` | The row element: a tag name or a component (a router link). Wins over `href` and a click listener.                     |
| `chevron`     | `boolean`          | `false`                                                   | A chevron at the end: the row opens a sub-panel. Mirrored in RTL.                                                      |
| `current`     | `boolean`          | `false`                                                   | The current page or the selected entry: `aria-current` (`"page"` on a link, `"true"` otherwise), the tint and the bar. |
| `description` | `string`           | —                                                         | A second line under the label.                                                                                         |
| `disabled`    | `boolean`          | `false`                                                   | A button row gets `disabled`; a link row drops its `href` and gets `aria-disabled`. A static row ignores it.           |
| `hint`        | `string`           | —                                                         | Text at the end, such as a shortcut (`Ctrl+S`).                                                                        |
| `href`        | `string`           | —                                                         | Renders the row as a link.                                                                                             |
| `icon`        | `string`           | —                                                         | An SVG path drawn at the start (`OriIcon`).                                                                            |
| `label`       | `string`           | —                                                         | The row text.                                                                                                          |

### Events & attributes

Neither component declares **custom events**.

`OriList` does not set `inheritAttrs: false`, so `class`, `style`, `dir` and `aria-*` (an `aria-label` on a list
that stands alone) fall through to the `<ul>`.

`OriListItem` sets `inheritAttrs: false` and binds every attribute and listener to the **row element**, not to
the `<li>`. `class` is merged with `ori-list__row`. A listener is also what decides the element: an
`@click` makes the row a `<button>`; other listeners (`@keydown`, `@focus`) do not. An attribute you pass
overrides the ones the row sets itself (`type`, `href`), except `aria-current`, which always follows `current`.

### Slots

| Slot      | Description                                                                                                                                                              |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `start`   | Replaces the icon in `ori-list__start`. The cell is rendered when this slot or `icon` is set.                                                                            |
| `default` | Replaces the label and the description inside `ori-list__main`. You own the markup of the text column.                                                                   |
| `end`     | Replaces the hint and the chevron in `ori-list__end` — put a control of your own here, in a static row. The cell is rendered when this slot, `hint` or `chevron` is set. |

### Polymorphic (`as`)

`as` takes a tag name or a component and wins over `href` and a click listener. Pass a router link and give it
its own navigation props; the row renders it with `class="ori-list__row"`. An `<a>` and a component are
treated as links: `current` renders `aria-current="page"`, and `disabled` sets `aria-disabled` and swallows
clicks. Any other tag is a static row, like the `<div>`.

```vue
<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>

<template>
    <nav aria-label="Main">
        <OriList>
            <OriListItem :as="RouterLink" to="/gallery" label="Gallery" />
            <OriListItem :as="RouterLink" to="/settings" label="Settings" current />
        </OriList>
    </nav>
</template>
```
