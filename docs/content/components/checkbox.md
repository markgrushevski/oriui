---
title: Checkbox
---

# Checkbox

A styled checkbox built on a **real `<input type="checkbox">`** — kept in the DOM (visually hidden
over a custom box) so keyboard, focus, and native form submission work for free. `v-model` takes a
boolean for a single box, or an array with the `value` prop for a native group. The accent and the
`:focus-visible` ring come from the `ori-color` token.

Every example is live; flip its source between **Vue** and **HTML** (the standalone `oriui/css`
classes — same markup for htmx, Astro, Svelte, or plain HTML).

## Classes

| Class                                       | Category | Values (default in **bold**)                                                |
| ------------------------------------------- | -------- | --------------------------------------------------------------------------- |
| `ori-checkbox`                              | Block    | required base class (the `<label>` wrapper)                                 |
| `ori-color` + `ori-color_*`                 | Accent   | **`primary`** · `secondary` · `success` · `warn` · `danger` · `info`        |
| `ori-font-size` + `ori-font-size_*`         | Size     | `xs` · `sm` · **`md`** · `lg` · `xl` · `xxl` (the box scales with the text) |
| `ori-checkbox__input` · `__box` · `__label` | Parts    | native input / visual box / text label                                      |
| `disabled` · `aria-invalid`                 | State    | real attributes, not classes                                                |

## Colors

::example
:ori-checkbox{label="Primary" color="primary"}
:ori-checkbox{label="Success" color="success"}
:ori-checkbox{label="Danger" color="danger"}

#vue

```vue
<OriCheckbox v-model="checked" label="Primary" color="primary" />
<OriCheckbox v-model="checked" label="Success" color="success" />
```

#html

```html
<label class="ori-checkbox ori-color ori-color_primary ori-font-size ori-font-size_md" for="c1">
    <input id="c1" type="checkbox" class="ori-checkbox__input" />
    <span class="ori-checkbox__box" aria-hidden="true"></span>
    <span class="ori-checkbox__label">Primary</span>
</label>
```

::

## Sizes

::example
:ori-checkbox{label="sm" size="sm"}
:ori-checkbox{label="md" size="md"}
:ori-checkbox{label="lg" size="lg"}

#vue

```vue
<OriCheckbox v-model="checked" label="sm" size="sm" />
<OriCheckbox v-model="checked" label="lg" size="lg" />
```

#html

```html
<!-- the box and label scale together off ori-font-size -->
<label class="ori-checkbox ori-color ori-color_primary ori-font-size ori-font-size_lg" for="big">
    <input id="big" type="checkbox" class="ori-checkbox__input" />
    <span class="ori-checkbox__box" aria-hidden="true"></span>
    <span class="ori-checkbox__label">lg</span>
</label>
```

::

## States

::example
:ori-checkbox{label="Disabled" :disabled="true"}

#vue

```vue
<OriCheckbox v-model="checked" label="Disabled" disabled />
```

#html

```html
<label class="ori-checkbox ori-checkbox_disabled ori-color ori-color_primary ori-font-size ori-font-size_md" for="d1">
    <input id="d1" type="checkbox" class="ori-checkbox__input" disabled />
    <span class="ori-checkbox__box" aria-hidden="true"></span>
    <span class="ori-checkbox__label">Disabled</span>
</label>
```

::

## Accessibility

- A real `<input type="checkbox">` drives all keyboard and form behavior; the visual `__box` is
  `aria-hidden`.
- The wrapping `<label>` (with `for`/`id`, auto `useId`) names the control — clicking the label or
  text toggles it.
- Focus is visible via `:focus-visible` on the box; `disabled` is the native attribute; `invalid`
  sets `aria-invalid="true"`.
