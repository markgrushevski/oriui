---
title: Spinner
---

# Spinner

An accessible loading indicator — renders `role="status"` with an `aria-label` (default `Loading`)
so assistive tech announces the busy state. Flip its source between **Vue** (the styled component)
and **HTML** (the standalone `oriui/css` classes — the same markup for htmx, Astro, Svelte, or plain HTML).

## Classes

A spinner composes a block class plus paired token utilities — each pair is a base class (`ori-color`)
plus a scale value (`ori-color_primary`). The Vue `<OriSpinner>` props map 1:1 to these. There is no
variant or radius — a spinner only takes a size and an optional color.

| Class                                   | Category | Values (default in **bold**)                                                                |
| --------------------------------------- | -------- | ------------------------------------------------------------------------------------------- |
| `ori-spinner`                           | Block    | required base class                                                                         |
| `ori-size-action` + `ori-size-action_*` | Size     | `xs` · `sm` · `md` · `lg` · `xl` · `xxl` (default inherits text)                            |
| `ori-color` + `ori-color_*`             | Color    | `primary` · `secondary` · `success` · `warn` · `danger` · `info` · `surface` · `background` |
| `ori-spinner_inline`                    | Modifier | inline flow (`inline` prop)                                                                 |
| `role="status"` · `aria-label`          | State    | announces the busy state; label defaults to `Loading`                                       |

## Sizes

::example
:ori-spinner{size="sm" color="primary"}
:ori-spinner{size="md" color="primary"}
:ori-spinner{size="lg" color="primary"}
:ori-spinner{size="xl" color="primary"}

#vue

```vue
<OriSpinner size="sm" color="primary" />
<OriSpinner size="xl" color="primary" />
```

#html

```html
<!-- ori-size-action sizes the ring; role + aria-label announce the busy state -->
<div
    class="ori-spinner ori-size-action ori-size-action_sm ori-color ori-color_primary"
    role="status"
    aria-label="Loading"
></div>
<div
    class="ori-spinner ori-size-action ori-size-action_xl ori-color ori-color_primary"
    role="status"
    aria-label="Loading"
></div>
```

::

## Colors

::example
:ori-spinner{color="primary" size="lg"}
:ori-spinner{color="danger" size="lg"}
:ori-spinner{color="success" size="lg"}
:ori-spinner{color="info" size="lg"}

#vue

```vue
<OriSpinner color="danger" size="lg" />
```

#html

```html
<!-- swap the color pair: ori-color_primary → ori-color_danger / _success / _info -->
<div
    class="ori-spinner ori-size-action ori-size-action_lg ori-color ori-color_danger"
    role="status"
    aria-label="Loading"
></div>
```

::

## Accessibility

- `role="status"` + `aria-label` (override with the `label` prop).
- Inside a labelled control (e.g. a loading button) the parent owns the announcement and the
  spinner is marked `aria-hidden`.
