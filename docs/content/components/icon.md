---
title: Icon
---

# Icon

A styled, accessible SVG icon. Decorative by default — renders with `aria-hidden="true"` and no
role. Pass a `label` to expose it to assistive technology as an image: the icon switches to
`role="img"` + `aria-label` automatically.

The examples are organised by **layer**: the [class reference](#classes) is the standalone
**`@oriui/css`** layer, and the [Framework API](#framework-api) is the **`@oriui/vue`** component. Every
example is live — flip its code between **HTML** (the standalone classes, also your htmx / Astro / Svelte /
plain-HTML usage), **Vue**; HTML is the default.

## Classes

An icon is a block class plus single-class token utilities — one class repoints one token; no
separate base class is needed. The Vue props in [Framework API](#framework-api) map 1:1 to these.
There is no variant or radius — an icon takes a size, an optional color, and optional layout
modifiers.

<!-- prettier-ignore -->
:class-table{:rows='[{"class":"ori-icon","type":"Block","description":"Required base class. Default size (text) and spacing are baked in — a bare block is valid."},{"class":"ori-icon_* (size sugar)","type":"Size","description":"text (inherits) · xs · sm · md · lg · xl · xxl — <b>text</b> is the default"},{"class":"ori-color_*","type":"Color","description":"primary · secondary · success · warn · danger · info · surface · background — omit to inherit"},{"class":"ori-size-action-space_*","type":"Layout","description":"adds margin equal to the action-space scale for the active size (the spaced opt-in); pair with a size modifier"},{"class":"ori-icon_inline","type":"Layout","description":"switches to inline-flex with a small em-based margin for flow text"},{"class":"aria-hidden · role=img","type":"State","description":"decorative by default (aria-hidden=true); a label switches to role=img + aria-label"}]'}

## Sizes

`xs` → `xxl`. The default `text` means the icon inherits the current font size — use `text` to keep
an icon visually matched to surrounding copy.

::example
:ori-icon{icon="M22,13H13V22H11V13H2V11H11V2H13V11H22V13Z" size="xs"}
:ori-icon{icon="M22,13H13V22H11V13H2V11H11V2H13V11H22V13Z" size="sm"}
:ori-icon{icon="M22,13H13V22H11V13H2V11H11V2H13V11H22V13Z" size="md"}
:ori-icon{icon="M22,13H13V22H11V13H2V11H11V2H13V11H22V13Z" size="lg"}
:ori-icon{icon="M22,13H13V22H11V13H2V11H11V2H13V11H22V13Z" size="xl"}
:ori-icon{icon="M22,13H13V22H11V13H2V11H11V2H13V11H22V13Z" size="xxl"}

The `text` default inherits the surrounding font size — the icon below sits inside a sentence and tracks the
paragraph's `font-size` with no explicit size prop:
:ori-icon{icon="M22,13H13V22H11V13H2V11H11V2H13V11H22V13Z" :inline="true"}

#html

```html
<!-- ori-icon_xs / _md / _xxl drive the icon box; aria-hidden because decorative -->
<i class="ori-icon ori-icon_xs" aria-hidden="true">
    <svg viewBox="0 0 24 24"><path d="M22,13H13V22H11V13H2V11H11V2H13V11H22V13Z" /></svg>
</i>
<i class="ori-icon ori-icon_md" aria-hidden="true">
    <svg viewBox="0 0 24 24"><path d="M22,13H13V22H11V13H2V11H11V2H13V11H22V13Z" /></svg>
</i>
<i class="ori-icon ori-icon_xxl" aria-hidden="true">
    <svg viewBox="0 0 24 24"><path d="M22,13H13V22H11V13H2V11H11V2H13V11H22V13Z" /></svg>
</i>
<!-- no size modifier: inherits font size (text default) -->
<i class="ori-icon ori-icon_inline" aria-hidden="true">
    <svg viewBox="0 0 24 24"><path d="M22,13H13V22H11V13H2V11H11V2H13V11H22V13Z" /></svg>
</i>
```

#vue

```vue
<OriIcon icon="M22,13H13V22H11V13H2V11H11V2H13V11H22V13Z" size="xs" />
<OriIcon icon="M22,13H13V22H11V13H2V11H11V2H13V11H22V13Z" size="md" />
<OriIcon icon="M22,13H13V22H11V13H2V11H11V2H13V11H22V13Z" size="xxl" />
<!-- default size="text": icon box matches the current font size -->
<OriIcon icon="M22,13H13V22H11V13H2V11H11V2H13V11H22V13Z" inline />
```

::

## Colors

Every semantic role. `surface` / `background` are also available. Omit `color` to inherit `currentcolor` from the parent.

::example
:ori-icon{icon="M22,13H13V22H11V13H2V11H11V2H13V11H22V13Z" color="primary" size="lg"}
:ori-icon{icon="M22,13H13V22H11V13H2V11H11V2H13V11H22V13Z" color="secondary" size="lg"}
:ori-icon{icon="M22,13H13V22H11V13H2V11H11V2H13V11H22V13Z" color="success" size="lg"}
:ori-icon{icon="M22,13H13V22H11V13H2V11H11V2H13V11H22V13Z" color="warn" size="lg"}
:ori-icon{icon="M22,13H13V22H11V13H2V11H11V2H13V11H22V13Z" color="danger" size="lg"}
:ori-icon{icon="M22,13H13V22H11V13H2V11H11V2H13V11H22V13Z" color="info" size="lg"}

#html

```html
<!-- ori-color_<role> repoints the color token in one class -->
<i class="ori-icon ori-icon_lg ori-color_primary" aria-hidden="true">
    <svg viewBox="0 0 24 24"><path d="M22,13H13V22H11V13H2V11H11V2H13V11H22V13Z" /></svg>
</i>
<i class="ori-icon ori-icon_lg ori-color_danger" aria-hidden="true">
    <svg viewBox="0 0 24 24"><path d="M22,13H13V22H11V13H2V11H11V2H13V11H22V13Z" /></svg>
</i>
```

#vue

```vue
<OriIcon icon="…" color="primary" size="lg" />
<OriIcon icon="…" color="success" size="lg" />
<OriIcon icon="…" color="danger" size="lg" />
<OriIcon icon="…" color="warn" size="lg" />
```

::

## Inline

`inline` switches the icon to `inline-flex` with a small `em`-based margin so it flows naturally
inside a sentence or a label without a wrapper element.

::example
:ori-icon{icon="M13,9H11V7H13M13,17H11V11H13M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z" :inline="true" size="md"}

#html

```html
<p>
    Read the
    <i class="ori-icon ori-icon_inline ori-icon_md" aria-hidden="true">
        <svg viewBox="0 0 24 24"><path d="M13,9H11V7H13…" /></svg>
    </i>
    note carefully.
</p>
```

#vue

```vue
<p>
    Read the
    <OriIcon icon="M13,9H11V7H13M13,17H11V11H13M12,2A10,10…" inline size="md" />
    note carefully.
</p>
```

::

## Spaced

`spaced` adds a margin around the icon equal to the action-space scale for the active size — useful
when the icon floats in open space rather than inside a button or label.

::example
:ori-icon{icon="M22,13H13V22H11V13H2V11H11V2H13V11H22V13Z" :spaced="true" size="lg" color="primary"}

#html

```html
<i class="ori-icon ori-icon_lg ori-size-action-space_lg ori-color_primary" aria-hidden="true">
    <svg viewBox="0 0 24 24"><path d="M22,13H13V22H11V13H2V11H11V2H13V11H22V13Z" /></svg>
</i>
```

#vue

```vue
<OriIcon icon="…" spaced size="lg" color="primary" />
```

::

## Accessible (labelled)

Pass `label` to make the icon meaningful. The component sets `role="img"` and `aria-label`
automatically and removes `aria-hidden`.

::example
:ori-icon{icon="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20M13,10H17V8H11V13H13V10M13,14H11V16H13V14Z" size="lg" label="Warning"}

#html

```html
<!-- note: no aria-hidden; role="img" + aria-label carry the name -->
<i class="ori-icon ori-icon_lg" role="img" aria-label="Warning">
    <svg viewBox="0 0 24 24"><path d="M12,2A10,10…" /></svg>
</i>
```

#vue

```vue
<!-- standalone icon with meaning: add a label -->
<OriIcon icon="…" size="lg" label="Warning" />
```

::

## Custom SVG slot

Omit `icon` and place your own SVG (or any content) in the default slot. The slot content is sized
to 100% × 100% and filled with `currentcolor`.

::example
:ori-icon{size="lg" color="primary"}

#html

```html
<i class="ori-icon ori-icon_lg ori-color_primary" aria-hidden="true">
    <svg viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 8v4l3 3" stroke="white" stroke-width="2" fill="none" />
    </svg>
</i>
```

#vue

```vue
<!-- custom multi-path SVG -->
<OriIcon size="lg" color="primary">
    <svg viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 8v4l3 3" stroke="white" stroke-width="2" fill="none" />
    </svg>
</OriIcon>
```

::

## Common patterns

An icon placed beside a status badge — size matches the action row, color follows the semantic role.

::example
:ori-icon{icon="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z" color="success" size="md"}
:ori-icon{icon="M13,13H11V7H13M13,17H11V15H13M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z" color="warn" size="md"}
:ori-icon{icon="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" color="danger" size="md"}

#html

```html
<div style="display: flex; align-items: center; gap: 0.5rem">
    <i class="ori-icon ori-icon_md ori-color_success" aria-hidden="true">
        <svg viewBox="0 0 24 24"><path d="M21,7L9,19L3.5,13.5…" /></svg>
    </i>
    <span>Deployed</span>
</div>
```

#vue

```vue
<!-- status row: icon + label, icon is decorative (the text carries the meaning) -->
<div style="display: flex; align-items: center; gap: 0.5rem">
    <OriIcon icon="M21,7L9,19L3.5,13.5…" color="success" size="md" />
    <span>Deployed</span>
</div>
<div style="display: flex; align-items: center; gap: 0.5rem">
    <OriIcon icon="M13,13H11V7H13…" color="warn" size="md" />
    <span>Pending review</span>
</div>
<div style="display: flex; align-items: center; gap: 0.5rem">
    <OriIcon icon="M19,6.41L17.59,5…" color="danger" size="md" />
    <span>Build failed</span>
</div>
```

::

## Accessibility

The accessibility contract holds across every layer — the standalone classes and the Vue component
render the same attributes.

- **Decorative by default**: renders `<i aria-hidden="true">` with no role. Use this mode when the
  icon sits beside visible text that already communicates its meaning (status rows, labelled buttons,
  list items with text).
- **Meaningful icon**: pass `label` — the component adds `role="img"` and `aria-label` and removes
  `aria-hidden`. Use this mode for standalone icons that carry meaning not expressed in nearby text
  (e.g. a lone star meaning "favourited").
- When used inside an `OriButton` (or any control with its own accessible name), the icon is always
  decorative — let the button's own label or `aria-label` carry the name.
- `:focus-visible` is not applicable — OriIcon is a presentational element, not interactive.

| Attribute            | When set                                 |
| -------------------- | ---------------------------------------- |
| `aria-hidden="true"` | Default; no `label` prop.                |
| `role="img"`         | `label` prop is provided.                |
| `aria-label`         | Equal to the `label` prop when provided. |

## Framework API

The props, events, and slots of the **Vue** component. The standalone CSS layer has no component
API — its surface is the [classes](#classes) above. (Svelte bindings are planned.)

### Props

| Prop     | Type         | Default  | Description                                                                                      |
| -------- | ------------ | -------- | ------------------------------------------------------------------------------------------------ |
| `color`  | `ThemeColor` | —        | Semantic color role. Omit to inherit `currentcolor` from the parent.                             |
| `icon`   | `string`     | —        | SVG `<path d>` string. Renders inside a `24 × 24` viewBox. Omit to use the default slot instead. |
| `inline` | `boolean`    | `false`  | Switches to `inline-flex` with an `em`-based margin for use inside text flow.                    |
| `label`  | `string`     | —        | Accessible name. When set, adds `role="img"` and `aria-label`; removes `aria-hidden`.            |
| `size`   | `ActionSize` | `'text'` | Icon box size (`xs` · `sm` · `md` · `lg` · `xl` · `xxl`). `text` inherits the current font size. |
| `spaced` | `boolean`    | `false`  | Adds action-space margin scaled to the active `size`. Has no effect when `size` is not set.      |

### Events & attributes

OriIcon declares **no custom events** and does not set `inheritAttrs: false`, so native attributes
(`class`, `style`, `data-*`, event listeners, …) fall through directly to the rendered `<i>` element.
A fall-through `aria-label` alone does **not** name the icon: when the `label` prop is unset the
component always sets `aria-hidden="true"`, which removes the element from the accessibility tree and
causes assistive technology to ignore any `aria-label` on it. The `label` prop is the only correct
way to name an icon — it sets `role="img"`, `aria-label`, and removes `aria-hidden` together.

### Slots

| Slot      | Description                                                                                                            |
| --------- | ---------------------------------------------------------------------------------------------------------------------- |
| `default` | Custom icon content. When provided, the `icon` prop is ignored. Slot content is sized 100% × 100% via `.ori-icon > *`. |
