---
title: Tag
---

# Tag

A compact label for categorising, filtering, or annotating content — status chips, keyword
badges, and removable filter pills. State is expressed through real attributes: `aria-disabled`
disables the tag and its close button without removing it from the DOM.

The examples are organised by **layer**: the [class reference](#classes) is the standalone
**`@oriui/css`** layer, and the [Framework API](#framework-api) is the **`@oriui/vue`** component. Every
example is live — flip its code between **HTML** (the standalone classes, also your htmx / Astro / Svelte /
plain-HTML usage), **Vue**, and **Svelte** _(soon)_; HTML is the default.

## Classes

A tag is a block class plus single-class token utilities — one class repoints one token, no base
class needed. The Vue props in [Framework API](#framework-api) map 1:1 to these.

<!-- prettier-ignore -->
:class-table{:rows='[{"class":"ori-tag","type":"Block","description":"Required base class."},{"class":"ori-variant_*","type":"Style","description":"fill · <b>tonal</b> · outline · text · plain"},{"class":"ori-color_*","type":"Color","description":"<b>primary</b> · secondary · success · warn · danger · info · surface"},{"class":"ori-font-size_*","type":"Size","description":"xs · <b>sm</b> · md · lg · xl · xxl — drives the label scale"},{"class":"ori-size-radius_*","type":"Radius","description":"zero · xs · sm · md · lg · xl · <b>rounded</b>"},{"class":"ori-tag__icon","type":"Part","description":"icon element (prepend or append)"},{"class":"ori-tag__text","type":"Part","description":"label text element"},{"class":"ori-tag__close · ori-tag__close-icon","type":"Part","description":"close button and its icon (present when closable)"},{"class":"aria-disabled=true","type":"State","description":"real attribute — dims the tag and blocks pointer events"}]'}

## Variants

Five visual styles, all driven by the `ori-variant_*` single-class token.

::example
:ori-tag{text="Fill" variant="fill"}
:ori-tag{text="Tonal" variant="tonal"}
:ori-tag{text="Outline" variant="outline"}
:ori-tag{text="Text" variant="text"}
:ori-tag{text="Plain" variant="plain"}

#vue

```vue
<OriTag text="Fill" variant="fill" />
<OriTag text="Tonal" variant="tonal" />
<OriTag text="Outline" variant="outline" />
<OriTag text="Text" variant="text" />
<OriTag text="Plain" variant="plain" />
```

#html

```html
<span class="ori-tag ori-variant_fill ori-color_primary ori-font-size_sm ori-size-radius_rounded">
    <span class="ori-tag__text">Fill</span>
</span>
<!-- swap the variant: ori-variant_fill → _tonal / _outline / _text / _plain -->
<span class="ori-tag ori-variant_tonal ori-color_primary ori-font-size_sm ori-size-radius_rounded">
    <span class="ori-tag__text">Tonal</span>
</span>
```

::

## Colors

Every semantic role. Variant and color compose freely.

::example
:ori-tag{text="primary" color="primary"}
:ori-tag{text="secondary" color="secondary"}
:ori-tag{text="success" color="success"}
:ori-tag{text="warn" color="warn"}
:ori-tag{text="danger" color="danger"}
:ori-tag{text="info" color="info"}
:ori-tag{text="surface" color="surface"}

#vue

```vue
<OriTag text="primary" color="primary" />
<OriTag text="secondary" color="secondary" />
<OriTag text="success" color="success" />
<OriTag text="warn" color="warn" />
<OriTag text="danger" color="danger" />
<OriTag text="info" color="info" />
<OriTag text="surface" color="surface" />
```

#html

```html
<span class="ori-tag ori-variant_tonal ori-color_danger ori-font-size_sm ori-size-radius_rounded">
    <span class="ori-tag__text">danger</span>
</span>
```

::

Variant x color compose freely — e.g. a filled success tag or an outlined danger one:

::example
:ori-tag{text="Published" variant="fill" color="success"}
:ori-tag{text="Blocked" variant="outline" color="danger"}
:ori-tag{text="Beta" variant="tonal" color="info"}
:ori-tag{text="Draft" variant="text" color="warn"}

#vue

```vue
<OriTag text="Published" variant="fill" color="success" />
<OriTag text="Blocked" variant="outline" color="danger" />
<OriTag text="Beta" variant="tonal" color="info" />
<OriTag text="Draft" variant="text" color="warn" />
```

#html

```html
<span class="ori-tag ori-variant_fill ori-color_success ori-font-size_sm ori-size-radius_rounded">
    <span class="ori-tag__text">Published</span>
</span>
```

::

## Sizes

`xs` → `xxl`. The size drives the label scale via `ori-font-size_*`. Default is `sm`.

::example
:ori-tag{text="xs" size="xs"}
:ori-tag{text="sm" size="sm"}
:ori-tag{text="md" size="md"}
:ori-tag{text="lg" size="lg"}
:ori-tag{text="xl" size="xl"}

#vue

```vue
<OriTag text="xs" size="xs" />
<OriTag text="sm" size="sm" />
<OriTag text="md" size="md" />
<OriTag text="lg" size="lg" />
<OriTag text="xl" size="xl" />
```

#html

```html
<span class="ori-tag ori-variant_tonal ori-color_primary ori-font-size_xs ori-size-radius_rounded">
    <span class="ori-tag__text">xs</span>
</span>
<span class="ori-tag ori-variant_tonal ori-color_primary ori-font-size_lg ori-size-radius_rounded">
    <span class="ori-tag__text">lg</span>
</span>
```

::

## Radius

From `zero` (square) to the default `rounded` (pill).

::example
:ori-tag{text="zero" radius="zero"}
:ori-tag{text="sm" radius="sm"}
:ori-tag{text="md" radius="md"}
:ori-tag{text="lg" radius="lg"}
:ori-tag{text="rounded" radius="rounded"}

#vue

```vue
<OriTag text="zero" radius="zero" />
<OriTag text="sm" radius="sm" />
<OriTag text="md" radius="md" />
<OriTag text="rounded" radius="rounded" />
```

#html

```html
<span class="ori-tag ori-variant_tonal ori-color_primary ori-font-size_sm ori-size-radius_zero">
    <span class="ori-tag__text">zero</span>
</span>
```

::

## With icons

`prependIcon` places an icon before the label; `appendIcon` places one after. Both accept an SVG
path string. They can be used together.

::example
:ori-tag{text="Verified" prependIcon="M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4z"}
:ori-tag{text="External" appendIcon="M19 19H5V5h7V3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z" color="info"}
:ori-tag{text="Warning" prependIcon="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" color="warn" variant="fill"}

#vue

```vue
<OriTag text="Verified" prependIcon="M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4z" />
<OriTag text="External" appendIcon="M19 19H5V5h7V3H5…" color="info" />
<OriTag text="Warning" prependIcon="M1 21h22L12 2…" color="warn" variant="fill" />
```

#html

```html
<span class="ori-tag ori-variant_tonal ori-color_primary ori-font-size_sm ori-size-radius_rounded">
    <i class="ori-icon ori-tag__icon" aria-hidden="true">
        <svg viewBox="0 0 24 24"><path d="M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4z" /></svg>
    </i>
    <span class="ori-tag__text">Verified</span>
</span>
```

::

## Closable

`closable` appends a close button. Clicking it emits a `close` event — your handler removes the tag.
`closeLabel` sets the button's `aria-label` (default `Remove`).

::example
:ori-tag{text="React" :closable="true"}
:ori-tag{text="Vue" :closable="true" color="success"}
:ori-tag{text="Svelte" :closable="true" variant="outline" color="danger"}

#vue

```vue
<OriTag v-for="tag in tags" :key="tag" :text="tag" closable @close="removeTag(tag)" />
```

#html

```html
<span class="ori-tag ori-variant_tonal ori-color_primary ori-font-size_sm ori-size-radius_rounded">
    <span class="ori-tag__text">React</span>
    <button type="button" class="ori-tag__close" aria-label="Remove">
        <i class="ori-icon ori-tag__close-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24">
                <path d="M6.4 19 5 17.6l5.6-5.6L5 6.4 6.4 5l5.6 5.6L17.6 5 19 6.4 13.4 12l5.6 5.6-1.4 1.4-5.6-5.6Z" />
            </svg>
        </i>
    </button>
</span>
```

::

## Disabled

`disabled` applies `aria-disabled="true"` to the root span, dimming the tag and blocking pointer
events including the close button.

::example
:ori-tag{text="Archived" :disabled="true"}
:ori-tag{text="Archived" :disabled="true" variant="outline"}
:ori-tag{text="Archived" :disabled="true" :closable="true"}

#vue

```vue
<OriTag text="Archived" disabled />
<OriTag text="Archived" disabled variant="outline" />
<OriTag text="Archived" disabled closable />
```

#html

```html
<span class="ori-tag ori-variant_tonal ori-color_primary ori-font-size_sm ori-size-radius_rounded" aria-disabled="true">
    <span class="ori-tag__text">Archived</span>
</span>
```

::

## Common patterns

A filter chip list and a status badge in a table row — the everyday compositions.

::example
:ori-tag{text="Vue" prependIcon="M2 3h3.5L12 15l6.5-12H22L12 21z" color="success" :closable="true"}
:ori-tag{text="TypeScript" prependIcon="M3 3h18v18H3V3zm10.71 14.29a3 3 0 0 0 4.24 0l-1.41-1.42a1 1 0 0 1-1.42 1.42 1 1 0 0 1 0-1.42l-1.41-1.41a3 3 0 0 0 0 4.24z" color="info" :closable="true"}
:ori-tag{text="Vite" color="warn" :closable="true"}

#vue

```vue
<!-- filter chip list -->
<div style="display: flex; flex-wrap: wrap; gap: 0.5rem">
    <OriTag
        v-for="filter in activeFilters"
        :key="filter.value"
        :text="filter.label"
        :color="filter.color"
        closable
        @close="removeFilter(filter.value)"
    />
</div>
```

#html

```html
<!-- filter chip list -->
<div style="display: flex; flex-wrap: wrap; gap: 0.5rem">
    <span class="ori-tag ori-variant_tonal ori-color_success ori-font-size_sm ori-size-radius_rounded">
        <span class="ori-tag__text">Vue</span>
        <button type="button" class="ori-tag__close" aria-label="Remove">
            <i class="ori-icon ori-tag__close-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24">
                    <path
                        d="M6.4 19 5 17.6l5.6-5.6L5 6.4 6.4 5l5.6 5.6L17.6 5 19 6.4 13.4 12l5.6 5.6-1.4 1.4-5.6-5.6Z"
                    />
                </svg>
            </i>
        </button>
    </span>
</div>
```

::

## Accessibility

The accessibility contract holds across every layer — the standalone classes and the Vue component
render the same attributes.

- The root element is a `<span>` (non-interactive). When the tag is purely decorative or
  informational, no additional role is required.
- `disabled` sets `aria-disabled="true"` (not the boolean `disabled`) on the root span — the tag
  stays in the accessibility tree. The nested close `<button>` gets the boolean `disabled`
  attribute so it is unreachable via keyboard when the tag is disabled.
- The close button has an explicit `aria-label` (default `Remove`); it is a real `<button
type="button">` with a visible `:focus-visible` ring.
- Icon elements inside the tag carry `aria-hidden="true"` — they are decorative.
- When tags are part of an interactive group (e.g. a filter chip list), wrap the group in an element
  with `role="group"` and an `aria-label` describing the set (e.g. `aria-label="Active filters"`).

| Key     | Element      | Action                                    |
| ------- | ------------ | ----------------------------------------- |
| `Tab`   | Close button | Moves focus to the close button.          |
| `Enter` | Close button | Activates the close button (emits close). |
| `Space` | Close button | Activates the close button (native).      |

## Framework API

The props, events, slots, and attributes of the **Vue** component. The standalone CSS layer has no
component API — its surface is the [classes](#classes) above. (Svelte bindings are planned.)

### Props

| Prop          | Type                                                  | Default     | Description                                                                                  |
| ------------- | ----------------------------------------------------- | ----------- | -------------------------------------------------------------------------------------------- |
| `appendIcon`  | `string`                                              | —           | SVG path for an icon rendered after the label.                                               |
| `closable`    | `boolean`                                             | `false`     | Shows a close button that emits `close` when clicked.                                        |
| `closeLabel`  | `string`                                              | `'Remove'`  | `aria-label` for the close button.                                                           |
| `color`       | `ThemeColor`                                          | `'primary'` | Semantic role: `primary` · `secondary` · `success` · `warn` · `danger` · `info` · `surface`. |
| `disabled`    | `boolean`                                             | `false`     | Sets `aria-disabled="true"` on the root and `disabled` on the close button.                  |
| `prependIcon` | `string`                                              | —           | SVG path for an icon rendered before the label.                                              |
| `radius`      | `RadiusSize`                                          | `'rounded'` | Corner radius (`zero` · `xs` · `sm` · `md` · `lg` · `xl` · `rounded`).                       |
| `size`        | `ActionSize`                                          | `'sm'`      | Label scale (`xs` · `sm` · `md` · `lg` · `xl` · `xxl`).                                      |
| `text`        | `string`                                              | —           | Tag label. Alternatively use the `default` slot.                                             |
| `variant`     | `'fill' \| 'tonal' \| 'outline' \| 'text' \| 'plain'` | `'tonal'`   | Visual style.                                                                                |

### Events & attributes

| Event   | Payload | Description                                               |
| ------- | ------- | --------------------------------------------------------- |
| `close` | —       | Emitted when the close button is clicked (closable only). |

OriTag does not set `inheritAttrs: false`, so any extra attributes (`class`, `data-*`,
`aria-label`, …) fall through to the root `<span>`.

### Slots

| Slot      | Description                                                                           |
| --------- | ------------------------------------------------------------------------------------- |
| `default` | Replaces the text prop content. Rendered inside `ori-tag__text`; use for rich labels. |
