---
title: Button
---

# Button

A styled, accessible button. Dynamic state is expressed through real attributes — `disabled` becomes
a true `disabled` (or `aria-disabled` for link buttons), `loading` sets `aria-busy`, and it ships a
visible `:focus-visible` ring.

Every example is live; flip its source between **Vue** (the styled component) and **HTML** (the
standalone `oriui/css` classes — the same markup for htmx, Astro, Svelte, or plain HTML).

## Variants

Five visual styles, all driven by the `ori-variant` token pair.

::example
:ori-button{text="Fill" variant="fill"}
:ori-button{text="Tonal" variant="tonal"}
:ori-button{text="Outline" variant="outline"}
:ori-button{text="Text" variant="text"}
:ori-button{text="Plain" variant="plain"}

#vue

```vue
<OriButton text="Fill" variant="fill" />
<OriButton text="Tonal" variant="tonal" />
<OriButton text="Outline" variant="outline" />
<OriButton text="Text" variant="text" />
<OriButton text="Plain" variant="plain" />
```

#html

```html
<button class="ori-button … ori-variant ori-variant_fill ori-color ori-color_primary">Fill</button>
<!-- swap the variant pair: ori-variant_fill → _tonal / _outline / _text / _plain -->
<button class="ori-button … ori-variant ori-variant_outline ori-color ori-color_primary">Outline</button>
```

::

## Colors

Every semantic role. `surface` / `background` are also available for neutral buttons.

::example
:ori-button{text="primary" color="primary"}
:ori-button{text="secondary" color="secondary"}
:ori-button{text="success" color="success"}
:ori-button{text="warn" color="warn"}
:ori-button{text="danger" color="danger"}
:ori-button{text="info" color="info"}

#vue

```vue
<OriButton text="primary" color="primary" />
<OriButton text="danger" color="danger" />
<OriButton text="info" color="info" />
```

#html

```html
<button class="ori-button … ori-variant ori-variant_fill ori-color ori-color_danger">danger</button>
```

::

Variant × color compose freely — e.g. a tonal danger button:

::example
:ori-button{text="Delete" variant="tonal" color="danger"}
:ori-button{text="Confirm" variant="outline" color="success"}
:ori-button{text="Note" variant="text" color="info"}

#vue

```vue
<OriButton text="Delete" variant="tonal" color="danger" />
<OriButton text="Confirm" variant="outline" color="success" />
```

#html

```html
<button class="ori-button … ori-variant ori-variant_tonal ori-color ori-color_danger">Delete</button>
```

::

## Sizes

`xs` → `xxl`. The size drives both the height (`ori-size-action`) and the label (`ori-font-size`).

::example
:ori-button{text="xs" size="xs"}
:ori-button{text="sm" size="sm"}
:ori-button{text="md" size="md"}
:ori-button{text="lg" size="lg"}
:ori-button{text="xl" size="xl"}

#vue

```vue
<OriButton text="sm" size="sm" />
<OriButton text="xl" size="xl" />
```

#html

```html
<button class="ori-button ori-size-action ori-size-action_sm … ori-font-size ori-font-size_sm …">sm</button>
<button class="ori-button ori-size-action ori-size-action_xl … ori-font-size ori-font-size_xl …">xl</button>
```

::

## Radius

From `zero` to the default `rounded` (pill).

::example
:ori-button{text="zero" radius="zero"}
:ori-button{text="sm" radius="sm"}
:ori-button{text="md" radius="md"}
:ori-button{text="lg" radius="lg"}
:ori-button{text="rounded" radius="rounded"}

#vue

```vue
<OriButton text="zero" radius="zero" />
<OriButton text="rounded" radius="rounded" />
```

#html

```html
<button class="ori-button … ori-size-radius ori-size-radius_zero …">zero</button>
```

::

## With icon

Pass an SVG path to `icon`. `iconPosition` places it; omit `text` for an icon-only button (give it an
`aria-label`).

::example
:ori-button{text="Add" icon="M11 13H5v-2h6V5h2v6h6v2h-6v6h-2z"}
:ori-button{text="Next" icon="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z" iconPosition="right"}
:ori-button{icon="M11 13H5v-2h6V5h2v6h6v2h-6v6h-2z" aria-label="Add" variant="tonal"}

#vue

```vue
<OriButton text="Add" icon="M11 13H5v-2h6V5h2v6h6v2h-6v6h-2z" />
<OriButton text="Next" icon="M12 4l-1.41…" iconPosition="right" />
<!-- icon-only: drop `text`, add an accessible name -->
<OriButton icon="M11 13H5v-2h6V5h2v6h6v2h-6v6h-2z" aria-label="Add" variant="tonal" />
```

#html

```html
<button class="ori-button …" aria-label="Add">
    <i class="ori-icon" aria-hidden="true"
        ><svg viewBox="0 0 24 24"><path d="M11 13H5v-2h6V5h2v6h6v2h-6v6h-2z" /></svg
    ></i>
</button>
```

::

## Loading

`loading` swaps the icon for a spinner, sets `aria-busy="true"`, and blocks interaction.

::example
:ori-button{text="Saving" :loading="true"}
:ori-button{text="Saving" :loading="true" variant="tonal"}
:ori-button{icon="M11 13H5v-2h6V5h2v6h6v2h-6v6h-2z" aria-label="Saving" :loading="true"}

#vue

```vue
<OriButton text="Saving" loading />
<OriButton icon="…" aria-label="Saving" loading />
```

#html

```html
<button class="ori-button …" aria-busy="true">
    <span class="ori-spinner ori-spinner_inline …" role="status" aria-hidden="true"></span>
    <span class="ori-button__text">Saving</span>
</button>
```

::

## States

`active` paints the pressed look (`data-active`); `disabled` is the real attribute.

::example
:ori-button{text="Active" :active="true"}
:ori-button{text="Disabled" :disabled="true"}
:ori-button{text="Disabled outline" :disabled="true" variant="outline"}

#vue

```vue
<OriButton text="Active" active />
<OriButton text="Disabled" disabled />
```

#html

```html
<button class="ori-button …" data-active>Active</button> <button class="ori-button …" disabled>Disabled</button>
```

::

## Block

`fluid` stretches the button to the full width of its container.

::example
:ori-button{text="Full width" :fluid="true"}

#vue

```vue
<OriButton text="Full width" fluid />
```

#html

```html
<button class="ori-button ori-button_fluid …">Full width</button>
```

::

## Polymorphic (`as`)

Render any tag or component. As a non-`<button>`, `disabled` becomes `aria-disabled` + `tabindex="-1"`
instead of the boolean attribute.

::example
:ori-button{text="Link button" as="a" href="#button" variant="outline"}

#vue

```vue
<!-- a real link… -->
<OriButton as="a" href="/docs" text="Link button" variant="outline" />
<!-- …or a router link -->
<OriButton :as="RouterLink" to="/docs" text="Go to docs" />
```

#html

```html
<a href="/docs" class="ori-button … ori-variant ori-variant_outline …">Link button</a>
```

::

## Common patterns

A confirm / cancel pair and an icon toolbar — the everyday compositions.

::example
:ori-button{text="Cancel" variant="text"}
:ori-button{text="Save changes" variant="fill"}

#vue

```vue
<div style="display: flex; gap: 0.5rem">
    <OriButton text="Cancel" variant="text" />
    <OriButton text="Save changes" variant="fill" />
</div>
```

#html

```html
<div style="display: flex; gap: 0.5rem">
    <button class="ori-button … ori-variant_text …">Cancel</button>
    <button class="ori-button … ori-variant_fill …">Save changes</button>
</div>
```

::

## Props

| Prop           | Type                                                  | Default     | Description                                                                    |
| -------------- | ----------------------------------------------------- | ----------- | ------------------------------------------------------------------------------ |
| `text`         | `string`                                              | —           | Label. Omit for an icon-only button (adds `ori-button_icon`).                  |
| `variant`      | `'fill' \| 'tonal' \| 'outline' \| 'text' \| 'plain'` | `'fill'`    | Visual style.                                                                  |
| `color`        | `ThemeColor`                                          | `'primary'` | Semantic role: primary · secondary · success · warn · danger · info · surface. |
| `size`         | `ActionSize`                                          | `'md'`      | Height + label scale (`xs`–`xxl`).                                             |
| `radius`       | `RadiusSize`                                          | `'rounded'` | Corner radius (`zero`–`rounded`).                                              |
| `icon`         | `string`                                              | —           | SVG path for an icon; hidden while `loading`.                                  |
| `iconPosition` | `'left' \| 'right' \| 'top' \| 'bottom'`              | `'left'`    | Icon placement around the label.                                               |
| `loading`      | `boolean`                                             | `false`     | Shows a spinner, sets `aria-busy`, and blocks interaction.                     |
| `disabled`     | `boolean`                                             | `false`     | Real `disabled` (button) or `aria-disabled` + `tabindex="-1"` (other tags).    |
| `active`       | `boolean`                                             | `false`     | Pressed look via `data-active`.                                                |
| `fluid`        | `boolean`                                             | `false`     | Full-width (block) button.                                                     |
| `as`           | `string \| Component`                                 | `'button'`  | Element or component to render (e.g. `'a'`, a router link).                    |

## Events & attributes

OriButton declares **no custom events**. It doesn't set `inheritAttrs: false`, so native listeners
(`@click`, `@focus`, …) and attributes (`type`, `aria-label`, `name`, `form`, …) fall through to the
rendered element — the tag given by `as`.

## Slots

| Slot      | Description                                                                                      |
| --------- | ------------------------------------------------------------------------------------------------ |
| `default` | Replaces the built-in content (icon + text). Supply your own markup; you own its layout/spacing. |

## CSS classes

The CSS layer composes a button from a block class plus paired token utilities — each pair is a base
class (`ori-color`) plus a scale value (`ori-color_primary`), so a class repoints one token. The Vue
props above map 1:1 to these.

| Class                                    | Category | Values (default in **bold**)                                                     |
| ---------------------------------------- | -------- | -------------------------------------------------------------------------------- |
| `ori-button`                             | Block    | required base class                                                              |
| `ori-variant` + `ori-variant_*`          | Variant  | **`fill`** · `tonal` · `outline` · `text` · `plain`                              |
| `ori-color` + `ori-color_*`              | Color    | **`primary`** · `secondary` · `success` · `warn` · `danger` · `info` · `surface` |
| `ori-size-action` + `ori-size-action_*`  | Size     | `xs` · `sm` · **`md`** · `lg` · `xl` · `xxl`                                     |
| `ori-size-radius` + `ori-size-radius_*`  | Radius   | `zero` · `xs` · `sm` · `md` · `lg` · `xl` · **`rounded`**                        |
| `ori-button_fluid` · `ori-button_icon`   | Layout   | full-width · icon-only                                                           |
| `ori-button__icon` · `ori-button__text`  | Parts    | icon / label elements                                                            |
| `disabled` · `aria-busy` · `data-active` | State    | real attributes, not classes                                                     |

## Accessibility

- Renders a real `<button type="button">` by default; `as="a"` (or a router link) switches the tag
  and uses `aria-disabled` + `tabindex="-1"` instead of the boolean `disabled`.
- `loading` sets `aria-busy="true"`; the spinner is `aria-hidden`. An icon-only button needs an
  `aria-label`.
- Visible `:focus-visible` outline; state lives in attributes, not classes.

| Key     | Action                              |
| ------- | ----------------------------------- |
| `Enter` | Activates the button.               |
| `Space` | Activates the button (native only). |
