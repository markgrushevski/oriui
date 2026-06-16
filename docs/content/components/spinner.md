---
title: Spinner
---

# Spinner

An accessible loading indicator — renders `role="status"` with an `aria-label` (default `Loading`)
so assistive tech announces the busy state.

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

#svelte

```svelte
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

#svelte

```svelte
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
