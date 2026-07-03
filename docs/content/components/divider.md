---
title: Divider
---

# Divider

A horizontal (default) or vertical rule that separates content. An optional centered label turns it
into a visual break like the classic "OR" between form sections. A pure layout/structure primitive —
no interactive behaviour, no variants, no size scale.

The examples are organised by **layer**: the [class reference](#classes) is the standalone
**`@oriui/css`** layer, and the [Framework API](#framework-api) is the **`@oriui/vue`** component. Every
example is live — flip its code between **HTML** (the standalone classes, also your htmx / Astro / Svelte /
plain-HTML usage), **Vue**; HTML is the default.

## Classes

A divider is a block class plus an optional modifier and a color utility. The Vue props in
[Framework API](#framework-api) map 1:1 to these. There is no variant or size scale — the line
inherits thickness and gap from the surrounding context via `--ori-size-gap`.

<!-- prettier-ignore -->
:class-table{:rows='[{"class":"ori-divider","type":"Block","description":"Required base class. Renders a subtle horizontal rule using a 25% currentcolor mix."},{"class":"ori-divider_vertical","type":"Modifier","description":"Switches to a vertical rule. Needs a flex/grid parent that provides height; the divider aligns-self: stretch."},{"class":"ori-divider_text","type":"Modifier","description":"Auto-applied when a label is present. Splits the line into two segments around the centered label."},{"class":"ori-divider__label","type":"Part","description":"The centered label span. Rendered inside the block when text or a default slot is supplied."},{"class":"ori-color_*","type":"Color","description":"primary · secondary · success · warn · danger · info · surface · background — repoints --ori-color to a full role color. Omit for the default subtle 25% currentcolor mix."}]'}

## Plain rule

A bare horizontal divider with no label — the most common use: separating sections of a page or a
card body.

::example
:ori-divider

#vue

```vue
<OriDivider />
```

#html

```html
<div class="ori-divider" role="separator"></div>
```

::

## With label

Pass `text` to insert a centered label. The block class gains `ori-divider_text` automatically and
the line splits around a `<span class="ori-divider__label">`.

::example
:ori-divider{text="OR"}

#vue

```vue
<OriDivider text="OR" />
```

#html

```html
<div class="ori-divider ori-divider_text" role="separator">
    <span class="ori-divider__label">OR</span>
</div>
```

::

## Slot label

The default slot overrides `text` when you need richer content inside the label — an icon, a badge,
or styled text.

::example
::ori-divider
Section break
::

#vue

```vue
<OriDivider>Section break</OriDivider>
```

#html

```html
<div class="ori-divider ori-divider_text" role="separator">
    <span class="ori-divider__label">Section break</span>
</div>
```

::

## Colors

An optional `color` repoints `--ori-color` to a full semantic role, making the line more prominent.
Omit for the default subtle mix.

::example
:ori-divider{color="primary"}
:ori-divider{color="secondary"}
:ori-divider{color="success"}
:ori-divider{color="warn"}
:ori-divider{color="danger"}
:ori-divider{color="info"}

#vue

```vue
<OriDivider color="primary" />
<OriDivider color="secondary" />
<OriDivider color="success" />
<OriDivider color="warn" />
<OriDivider color="danger" />
<OriDivider color="info" />
```

#html

```html
<!-- swap the color class: ori-color_primary → _secondary / _success / _warn / _danger / _info -->
<div class="ori-divider ori-color_primary" role="separator"></div>
```

::

A colored label divider:

::example
:ori-divider{text="Continue with" color="primary"}

#vue

```vue
<OriDivider text="Continue with" color="primary" />
```

#html

```html
<div class="ori-divider ori-divider_text ori-color_primary" role="separator">
    <span class="ori-divider__label">Continue with</span>
</div>
```

::

## Vertical

`vertical` renders a column rule that stretches to the parent's cross-axis height. The parent must
be a flex or grid container with a defined height — the divider uses `align-self: stretch` to fill
it. Spacing around the vertical rule comes from `margin-inline` (driven by `--ori-size-gap`).

::example
::ori-stack{:cluster="true" gap="sm"}
:ori-button{variant="text" text="Item one"}
:ori-divider{:vertical="true"}
:ori-button{variant="text" text="Item two"}
:ori-divider{:vertical="true"}
:ori-button{variant="text" text="Item three"}
::

#vue

```vue
<div style="display: flex; align-items: center; height: 3rem">
    <span>Item one</span>
    <OriDivider vertical />
    <span>Item two</span>
    <OriDivider vertical />
    <span>Item three</span>
</div>
```

#html

```html
<div style="display: flex; align-items: center; height: 3rem">
    <span>Item one</span>
    <div class="ori-divider ori-divider_vertical" role="separator" aria-orientation="vertical"></div>
    <span>Item two</span>
    <div class="ori-divider ori-divider_vertical" role="separator" aria-orientation="vertical"></div>
    <span>Item three</span>
</div>
```

::

## Common patterns

A sign-in form with an "OR" break and a toolbar that uses vertical rules between action groups.

::example
:ori-divider{text="OR"}

#vue

```vue
<!-- sign-in form: email/password block → divider → social login -->
<form style="display: flex; flex-direction: column; gap: 1rem; max-width: 22rem">
    <input type="email" placeholder="Email" />
    <input type="password" placeholder="Password" />
    <OriButton text="Sign in" variant="fill" fluid />
    <OriDivider text="OR" />
    <OriButton text="Continue with Google" variant="outline" fluid />
</form>
```

#html

```html
<form style="display: flex; flex-direction: column; gap: 1rem; max-width: 22rem">
    <input type="email" placeholder="Email" />
    <input type="password" placeholder="Password" />
    <button class="ori-button ori-button_fluid ori-variant_fill ori-color_primary">Sign in</button>

    <div class="ori-divider ori-divider_text" role="separator">
        <span class="ori-divider__label">OR</span>
    </div>

    <button class="ori-button ori-button_fluid ori-variant_outline ori-color_primary">Continue with Google</button>
</form>
```

::

## Accessibility

The accessibility contract holds across every layer — the standalone classes and the Vue component
render the same attributes.

- Renders `<div role="separator">` — the correct ARIA landmark for a thematic break between content
  regions.
- `aria-orientation="vertical"` is set only when `vertical` is `true`. For the default horizontal
  orientation the attribute is omitted (horizontal is the implied default per the ARIA spec).
- The line itself is purely decorative. When a label is present it is plain text inside a `<span>`;
  no additional ARIA is needed — the `role="separator"` communicates structure, not the label.
- The component is not interactive and is never focusable. No keyboard contract applies.

| Attribute                     | Element      | Notes                                                                 |
| ----------------------------- | ------------ | --------------------------------------------------------------------- |
| `role="separator"`            | Root `<div>` | Always present; communicates a thematic break.                        |
| `aria-orientation="vertical"` | Root `<div>` | Set only when `vertical` is `true`; omitted for horizontal (default). |

## Framework API

The props, events, and slots of the **Vue** component. The standalone CSS layer has no component
API — its surface is the [classes](#classes) above. (Svelte bindings are planned.)

### Props

| Prop       | Type         | Default | Description                                                                                                                                    |
| ---------- | ------------ | ------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `color`    | `ThemeColor` | —       | Semantic color role. Omit to use the default subtle 25% `currentcolor` mix.                                                                    |
| `text`     | `string`     | —       | Centered label. Adds `ori-divider_text` and renders `<span class="ori-divider__label">`. Overridden by the default slot when both are present. |
| `vertical` | `boolean`    | `false` | Renders a vertical rule. Requires a flex or grid parent with a defined height; the rule stretches to fill it.                                  |

`ThemeColor`: `'primary' | 'secondary' | 'success' | 'warn' | 'danger' | 'info' | 'surface' | 'background'`

### Events & attributes

OriDivider declares **no custom events** and does not set `inheritAttrs: false`, so any extra
attributes you pass (`class`, `style`, `data-*`, …) fall through to the root `<div role="separator">`.

### Slots

| Slot      | Description                                                                                                                             |
| --------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `default` | Centered label content. Overrides `text` when both are supplied. Adds `ori-divider_text` and wraps the content in `ori-divider__label`. |
