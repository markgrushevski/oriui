---
title: Button
---

# Button

A styled, accessible button. Dynamic state is expressed through real attributes — `disabled` becomes
a true `disabled` (or `aria-disabled` for link buttons), `loading` sets `aria-busy`, and it ships a
visible `:focus-visible` ring.

Every example is live; flip its source between **Vue** (the styled component) and **HTML** (the
standalone `oriui/css` classes — the same markup for htmx, Astro, Svelte, or plain HTML).

## Classes

The CSS layer composes a button from a block class plus paired token utilities — each pair is a base
class (`ori-color`) plus a scale value (`ori-color_primary`), so a class repoints one token. The Vue
`<OriButton>` props map 1:1 to these.

| Class                                    | Category | Values (default in **bold**)                                                     |
| ---------------------------------------- | -------- | -------------------------------------------------------------------------------- |
| `ori-button`                             | Block    | required base class                                                              |
| `ori-variant` + `ori-variant_*`          | Variant  | **`fill`** · `tonal` · `outline` · `text` · `plain`                              |
| `ori-color` + `ori-color_*`              | Color    | **`primary`** · `secondary` · `success` · `warn` · `danger` · `info` · `surface` |
| `ori-size-action` + `ori-size-action_*`  | Size     | `xs` · `sm` · **`md`** · `lg` · `xl` · `xxl`                                     |
| `ori-size-radius` + `ori-size-radius_*`  | Radius   | `zero` · `xs` · `sm` · `md` · `lg` · `xl` · **`rounded`**                        |
| `ori-button__icon` · `ori-button__text`  | Parts    | icon / label elements                                                            |
| `disabled` · `aria-busy` · `data-active` | State    | real attributes, not classes                                                     |

## Variants

::example
:ori-button{text="Fill" variant="fill" color="primary"}
:ori-button{text="Tonal" variant="tonal" color="primary"}
:ori-button{text="Outline" variant="outline" color="primary"}
:ori-button{text="Text" variant="text" color="primary"}
:ori-button{text="Plain" variant="plain" color="primary"}

#vue

```vue
<OriButton text="Fill" variant="fill" color="primary" />
<OriButton text="Tonal" variant="tonal" color="primary" />
<OriButton text="Outline" variant="outline" color="primary" />
<OriButton text="Text" variant="text" color="primary" />
<OriButton text="Plain" variant="plain" color="primary" />
```

#html

```html
<button
    class="ori-button ori-size-action ori-size-action_md ori-size-radius ori-size-radius_rounded ori-font-size ori-font-size_md ori-variant ori-variant_fill ori-color ori-color_primary"
>
    Fill
</button>

<!-- swap the variant pair: ori-variant_fill → ori-variant_tonal / _outline / _text / _plain -->
<button class="ori-button … ori-variant ori-variant_outline ori-color ori-color_primary">Outline</button>
```

::

## Sizes

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
<!-- ori-size-action drives padding/height; ori-font-size scales the label -->
<button
    class="ori-button ori-size-action ori-size-action_sm ori-size-radius ori-size-radius_rounded ori-font-size ori-font-size_sm ori-variant ori-variant_fill ori-color ori-color_primary"
>
    sm
</button>
<button
    class="ori-button ori-size-action ori-size-action_xl ori-size-radius ori-size-radius_rounded ori-font-size ori-font-size_xl ori-variant ori-variant_fill ori-color ori-color_primary"
>
    xl
</button>
```

::

## Colors

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
<button class="ori-button … ori-variant ori-variant_fill ori-color ori-color_primary">primary</button>
<button class="ori-button … ori-variant ori-variant_fill ori-color ori-color_danger">danger</button>
<button class="ori-button … ori-variant ori-variant_fill ori-color ori-color_info">info</button>
```

::

## States

::example
:ori-button{text="loading" :loading="true" color="primary"}
:ori-button{text="disabled" :disabled="true" color="primary"}

#vue

```vue
<OriButton text="loading" loading color="primary" />
<OriButton text="disabled" disabled color="primary" />
```

#html

```html
<!-- state is real attributes, not classes -->
<button class="ori-button … ori-variant ori-variant_fill ori-color ori-color_primary" aria-busy="true">loading</button>
<button class="ori-button … ori-variant ori-variant_fill ori-color ori-color_primary" disabled>disabled</button>
```

::

## Accessibility

- Renders a real `<button type="button">` by default; `as="a"` (or a router link) switches the tag
  and uses `aria-disabled` + `tabindex` instead of the boolean `disabled`.
- `loading` sets `aria-busy="true"`; the spinner is `aria-hidden`.
- Visible `:focus-visible` outline; state lives in attributes, not classes.
