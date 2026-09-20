---
title: Button
---

# Button

A styled, accessible button. Dynamic state is expressed through real attributes — `disabled` becomes
a true `disabled` (or `aria-disabled` for link buttons), `loading` sets `aria-busy`, and it ships a
visible `:focus-visible` ring.

The examples are organised by **layer**: the [class reference](#classes) is the standalone
**`@oriui/css`** layer, and the [Framework API](#framework-api) is the **`@oriui/vue`** component. Every
example is live — flip its code between **HTML** (the standalone classes, also your htmx / Astro / Svelte /
plain-HTML usage), **Vue**; HTML is the default.

## Classes

A button is a block class plus single-class token utilities — one class repoints one token, no base
class needed. The Vue props in [Framework API](#framework-api) map 1:1 to these.

<!-- prettier-ignore -->
:class-table{:rows='[{"class":"ori-button","type":"Block","description":"Required base class."},{"class":"ori-variant_*","type":"Style","description":"<b>solid</b> · soft · outline · text · plain"},{"class":"ori-color_*","type":"Color","description":"<b>primary</b> · secondary · success · warning · danger · info · surface"},{"class":"ori-button_* (size)","type":"Size","description":"xs · sm · <b>md</b> · lg · xl · xxl"},{"class":"ori-font-size_*","type":"Font","description":"xs · sm · <b>md</b> · lg · xl · xxl (scales the label)"},{"class":"ori-size-radius_*","type":"Radius","description":"none · xs · sm · md · lg · xl · <b>full</b>"},{"class":"ori-button_fluid · ori-button_icon","type":"Layout","description":"full-width · icon-only"},{"class":"ori-button__icon · ori-button__text","type":"Part","description":"icon / label elements"},{"class":"disabled · aria-busy · data-active","type":"State","description":"real attributes, not classes"}]'}

**À la carte:** the classes above ship in `@oriui/css/components/button.css`. Import a foundation
(`@oriui/css/base.css` or `@oriui/css/tokens.css`) first — the token utilities (`ori-color_*`,
`ori-size-radius_*`, …) live there, not in the component file. The full bundle `@oriui/css` is the default and
already carries both; see [à-la-carte imports](/guides/css).

The non-fill variants (`soft` / `outline` / `text` / `plain`) paint the label with the AA-safe
`--ori-color-text` tone rather than the raw role; `solid` keeps `--ori-color-on` for its solid
background — see [Design tokens](/guides/design-tokens#text-the-on-surface-foreground).

## Variants

Five visual styles, all driven by the `ori-variant_*` single-class token.

::example
:ori-button{label="Solid" variant="solid"}
:ori-button{label="Tonal" variant="soft"}
:ori-button{label="Outline" variant="outline"}
:ori-button{label="Text" variant="text"}
:ori-button{label="Plain" variant="plain"}

#vue

```vue
<OriButton label="Solid" variant="solid" />
<OriButton label="Tonal" variant="soft" />
<OriButton label="Outline" variant="outline" />
<OriButton label="Text" variant="text" />
<OriButton label="Plain" variant="plain" />
```

#html

```html
<button class="ori-button ori-variant_solid ori-color_primary">Fill</button>
<!-- swap the variant: ori-variant_solid → _tonal / _outline / _text / _plain -->
<button class="ori-button ori-variant_outline ori-color_primary">Outline</button>
```

::

## Colors

Every semantic role. `surface` / `background` are also available for neutral buttons.

::example
:ori-button{label="primary" color="primary"}
:ori-button{label="secondary" color="secondary"}
:ori-button{label="success" color="success"}
:ori-button{label="warning" color="warning"}
:ori-button{label="danger" color="danger"}
:ori-button{label="info" color="info"}

#vue

```vue
<OriButton label="primary" color="primary" />
<OriButton label="danger" color="danger" />
<OriButton label="info" color="info" />
```

#html

```html
<button class="ori-button ori-variant_solid ori-color_danger">danger</button>
```

::

Variant × color compose freely — e.g. a tonal danger button:

::example
:ori-button{label="Delete" variant="soft" color="danger"}
:ori-button{label="Confirm" variant="outline" color="success"}
:ori-button{label="Note" variant="text" color="info"}

#vue

```vue
<OriButton label="Delete" variant="soft" color="danger" />
<OriButton label="Confirm" variant="outline" color="success" />
```

#html

```html
<button class="ori-button ori-variant_soft ori-color_danger">Delete</button>
```

::

## Sizes

`xs` → `xxl`. The size sugar `ori-button_*` drives the height; `ori-font-size_*` scales the label.

::example
:ori-button{label="xs" size="xs"}
:ori-button{label="sm" size="sm"}
:ori-button{label="md" size="md"}
:ori-button{label="lg" size="lg"}
:ori-button{label="xl" size="xl"}

#vue

```vue
<OriButton label="sm" size="sm" />
<OriButton label="xl" size="xl" />
```

#html

```html
<button class="ori-button ori-button_sm ori-font-size_sm">sm</button>
<button class="ori-button ori-button_xl ori-font-size_xl">xl</button>
```

::

## Radius

From `none` to the default `full` (pill).

::example
:ori-button{label="none" radius="none"}
:ori-button{label="sm" radius="sm"}
:ori-button{label="md" radius="md"}
:ori-button{label="lg" radius="lg"}
:ori-button{label="full" radius="full"}

#vue

```vue
<OriButton label="none" radius="none" />
<OriButton label="full" radius="full" />
```

#html

```html
<button class="ori-button ori-size-radius_none">none</button>
```

::

## With icon

Pass an SVG path to `icon`. `iconPosition` places it. For an icon-only square, pass `icon` **without**
`label` (give it an `aria-label`) — icon mode is triggered by the explicit `icon` prop, so a slot-only or
text button is never forced into a square.

::example
:ori-button{label="Add" icon="M11 13H5v-2h6V5h2v6h6v2h-6v6h-2z"}
:ori-button{label="Next" icon="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z" iconPosition="right"}
:ori-button{icon="M11 13H5v-2h6V5h2v6h6v2h-6v6h-2z" aria-label="Add" variant="soft"}

#vue

```vue
<OriButton label="Add" icon="M11 13H5v-2h6V5h2v6h6v2h-6v6h-2z" />
<OriButton label="Next" icon="M12 4l-1.41…" iconPosition="right" />
<!-- icon-only square: pass `icon` with no `label`, add an accessible name -->
<OriButton icon="M11 13H5v-2h6V5h2v6h6v2h-6v6h-2z" aria-label="Add" variant="soft" />
```

#html

```html
<button class="ori-button ori-button_icon ori-variant_soft" aria-label="Add">
    <i class="ori-icon" aria-hidden="true"
        ><svg viewBox="0 0 24 24"><path d="M11 13H5v-2h6V5h2v6h6v2h-6v6h-2z" /></svg
    ></i>
</button>
```

::

## Loading

`loading` swaps the icon for a spinner, sets `aria-busy="true"`, and blocks interaction.

::example
:ori-button{label="Saving" :loading="true"}
:ori-button{label="Saving" :loading="true" variant="soft"}
:ori-button{icon="M11 13H5v-2h6V5h2v6h6v2h-6v6h-2z" aria-label="Saving" :loading="true"}

#vue

```vue
<OriButton label="Saving" loading />
<OriButton icon="…" aria-label="Saving" loading />
```

#html

```html
<button class="ori-button" aria-busy="true">
    <span class="ori-spinner ori-spinner_inline" role="status" aria-hidden="true"></span>
    <span class="ori-button__text">Saving</span>
</button>
```

::

## States

`active` and `pressed` are different things, and the difference is the whole toggle contract.

`active` paints a forced `:active` **look** (`data-active`) and announces nothing — use it for a transient
highlight. `pressed` is the toggle **state**: it renders `aria-pressed`, so assistive tech reports the
button as on or off, and it paints the pressed affordance (a tint plus an inset ring) on the button itself,
with no toolbar ancestor required. Omit `pressed` entirely on a plain action button — binding it to `false`
is a claim that the control is a toggle that happens to be off.

`disabled` is the real attribute.

::example
:ori-button{label="Active" :active="true"}
:ori-button{label="Disabled" :disabled="true"}
:ori-button{label="Disabled outline" :disabled="true" variant="outline"}

#vue

```vue
<OriButton label="Active" active />
<OriButton label="Disabled" disabled />
```

#html

```html
<button class="ori-button" data-active>Active</button> <button class="ori-button" disabled>Disabled</button>
```

::

## Block

`fluid` stretches the button to the full width of its container.

::example
:ori-button{label="Full width" :fluid="true"}

#vue

```vue
<OriButton label="Full width" fluid />
```

#html

```html
<button class="ori-button ori-button_fluid">Full width</button>
```

::

## Common patterns

A confirm / cancel pair and an icon toolbar — the everyday compositions.

::example
:ori-button{label="Cancel" variant="text"}
:ori-button{label="Save changes" variant="solid"}

#vue

```vue
<div style="display: flex; gap: 0.5rem">
    <OriButton label="Cancel" variant="text" />
    <OriButton label="Save changes" variant="solid" />
</div>
```

#html

```html
<div style="display: flex; gap: 0.5rem">
    <button class="ori-button ori-variant_text">Cancel</button>
    <button class="ori-button ori-variant_solid">Save changes</button>
</div>
```

::

## Accessibility

The accessibility contract holds across every layer — the standalone classes and the Vue component
render the same attributes and keyboard behaviour.

- Renders a real `<button type="button">` by default; `as="a"` (or a router link) switches the tag
  and uses `aria-disabled` + `tabindex="-1"` instead of the boolean `disabled`.
- `loading` sets `aria-busy="true"`; the spinner is `aria-hidden`. An icon-only button needs an
  `aria-label`.
- Visible `:focus-visible` outline; state lives in attributes, not classes.

| Key     | Action                              |
| ------- | ----------------------------------- |
| `Enter` | Activates the button.               |
| `Space` | Activates the button (native only). |

## Framework API

The props, events, slots, and polymorphism of the **Vue** component. The standalone CSS layer has no
component API — its surface is the [classes](#classes) above. (Svelte bindings are planned.)

### Props

| Prop           | Type                                                  | Default     | Description                                                                                                     |
| -------------- | ----------------------------------------------------- | ----------- | --------------------------------------------------------------------------------------------------------------- |
| `label`        | `string`                                              | —           | Visible button text. A labelled (or slotted) button is a normal button, never an icon square.                   |
| `variant`      | `'solid' \| 'soft' \| 'outline' \| 'text' \| 'plain'` | `'solid'`   | Visual style.                                                                                                   |
| `color`        | `ThemeColor`                                          | `'primary'` | Semantic role: primary · secondary · success · warning · danger · info · surface.                               |
| `size`         | `ActionSize`                                          | `'md'`      | Height + label scale (`xs`–`xxl`).                                                                              |
| `radius`       | `RadiusSize`                                          | `'full'`    | Corner radius (`none`–`full`).                                                                                  |
| `icon`         | `string`                                              | —           | SVG path for an icon; hidden while `loading`. `icon` with no `label` → an icon-only square (`ori-button_icon`). |
| `iconPosition` | `'left' \| 'right' \| 'top' \| 'bottom'`              | `'left'`    | Icon placement around the label.                                                                                |
| `loading`      | `boolean`                                             | `false`     | Shows a spinner, sets `aria-busy`, and blocks interaction.                                                      |
| `disabled`     | `boolean`                                             | `false`     | Real `disabled` (button) or `aria-disabled` + `tabindex="-1"` (other tags).                                     |
| `active`       | `boolean`                                             | `false`     | Forced `:active` LOOK via `data-active`. Not a toggle state — see `pressed`.                                    |
| `pressed`      | `boolean`                                             | —           | Toggle STATE: renders `aria-pressed` and the pressed affordance. Omit it on a plain action button.              |
| `fluid`        | `boolean`                                             | `false`     | Full-width (block) button.                                                                                      |
| `as`           | `string \| Component`                                 | `'button'`  | Element or component to render (e.g. `'a'`, a router link).                                                     |

### Events & attributes

OriButton declares **no custom events**. It doesn't set `inheritAttrs: false`, so native listeners
(`@click`, `@focus`, …) and attributes (`type`, `aria-label`, `name`, `form`, …) fall through to the
rendered element — the tag given by `as`.

### Slots

| Slot      | Description                                                                                      |
| --------- | ------------------------------------------------------------------------------------------------ |
| `default` | Replaces the built-in content (icon + text). Supply your own markup; you own its layout/spacing. |

### Polymorphic (`as`)

Render any tag or component. As a non-`<button>`, `disabled` becomes `aria-disabled` + `tabindex="-1"`
instead of the boolean attribute.

::example
:ori-button{label="Link button" as="a" href="#button" variant="outline"}

#vue

```vue
<!-- a real link… -->
<OriButton as="a" href="/docs" label="Link button" variant="outline" />
<!-- …or a router link -->
<OriButton :as="RouterLink" to="/docs" label="Go to docs" />
```

#html

```html
<a href="/docs" class="ori-button ori-variant_outline">Link button</a>
```

::
