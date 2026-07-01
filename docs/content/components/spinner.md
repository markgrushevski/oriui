---
title: Spinner
---

# Spinner

An accessible loading indicator — renders `role="status"` with an `aria-label` (default `"Loading"`)
so assistive technology announces the busy state without any extra work. Use it standalone for a
page-level or section-level loader, or embed it inline inside a button or label.

The examples are organised by **layer**: the [class reference](#classes) is the standalone
**`@oriui/css`** layer, and the [Framework API](#framework-api) is the **`@oriui/vue`** component. Every
example is live — flip its code between **HTML** (the standalone classes, also your htmx / Astro / Svelte /
plain-HTML usage), **Vue**, and **Svelte** _(soon)_; HTML is the default.

## Classes

A spinner is a single block class. Each axis is one class that repoints one token — no base class
needed. The Vue props in [Framework API](#framework-api) map 1:1 to these. There is no variant or
radius — a spinner only takes a size and an optional color.

<!-- prettier-ignore -->
:class-table{:rows='[{"class":"ori-spinner","type":"Block","description":"Required base class."},{"class":"ori-spinner_* (size)","type":"Size","description":"text (inherits) · xs · sm · md · lg · xl · xxl — <b>text</b> is the default; bare ori-spinner without a size modifier inherits its size from the surrounding font"},{"class":"ori-color_*","type":"Color","description":"primary · secondary · success · warn · danger · info · surface · background — inherits <code>currentcolor</code> when omitted"},{"class":"ori-spinner_inline","type":"Layout","description":"switches to <code>inline-block</code> with a small margin so it sits in a line of text"},{"class":"role=status · aria-label","type":"State","description":"live region that announces the busy state; label defaults to <b>Loading</b>"}]'}

## Sizes

`xs` → `xxl`, plus the default `text` which inherits its size from the surrounding font.

::example
:ori-spinner{size="xs" color="primary"}
:ori-spinner{size="sm" color="primary"}
:ori-spinner{size="md" color="primary"}
:ori-spinner{size="lg" color="primary"}
:ori-spinner{size="xl" color="primary"}
:ori-spinner{size="xxl" color="primary"}

#vue

```vue
<OriSpinner size="xs" color="primary" />
<OriSpinner size="sm" color="primary" />
<OriSpinner size="md" color="primary" />
<OriSpinner size="lg" color="primary" />
<OriSpinner size="xl" color="primary" />
<OriSpinner size="xxl" color="primary" />
```

#html

```html
<!-- ori-spinner_<size> sets the ring diameter; omit the size modifier to inherit from text -->
<div class="ori-spinner ori-spinner_sm ori-color_primary" role="status" aria-label="Loading"></div>
<div class="ori-spinner ori-spinner_xl ori-color_primary" role="status" aria-label="Loading"></div>
```

::

## Colors

Every semantic role. Omit `color` entirely to inherit `currentcolor` from the parent.

::example
:ori-spinner{color="primary" size="lg"}
:ori-spinner{color="secondary" size="lg"}
:ori-spinner{color="success" size="lg"}
:ori-spinner{color="warn" size="lg"}
:ori-spinner{color="danger" size="lg"}
:ori-spinner{color="info" size="lg"}

#vue

```vue
<OriSpinner color="primary" size="lg" />
<OriSpinner color="secondary" size="lg" />
<OriSpinner color="success" size="lg" />
<OriSpinner color="warn" size="lg" />
<OriSpinner color="danger" size="lg" />
<OriSpinner color="info" size="lg" />
```

#html

```html
<!-- swap the color class: ori-color_primary → _secondary / _success / _warn / _danger / _info -->
<div class="ori-spinner ori-spinner_lg ori-color_danger" role="status" aria-label="Loading"></div>
```

::

## Inline

`inline` switches the spinner to `inline-block` with a small margin so it flows in a sentence or
sits beside a label without breaking layout.

::example
:ori-spinner{:inline="true" size="sm" color="primary"}

#vue

```vue
<OriSpinner inline size="sm" color="primary" />
```

#html

```html
<div class="ori-spinner ori-spinner_inline ori-spinner_sm ori-color_primary" role="status" aria-label="Loading"></div>
```

::

## Custom label

Override the default `"Loading"` with a more descriptive message for the current context.

::example
:ori-spinner{size="md" color="primary" label="Saving your changes"}

#vue

```vue
<OriSpinner size="md" color="primary" label="Saving your changes" />
```

#html

```html
<div class="ori-spinner ori-spinner_md ori-color_primary" role="status" aria-label="Saving your changes"></div>
```

::

## Common patterns

A full-page loader and a button-level spinner — the everyday compositions.

::example
:ori-spinner{size="xl" color="primary" label="Loading page"}

#vue

```vue
<!-- page-level loader, centred by the parent -->
<div style="display: flex; justify-content: center; padding: 2rem">
    <OriSpinner size="xl" color="primary" label="Loading page" />
</div>

<!-- spinner hidden inside a labelled button (parent owns the announcement) -->
<button class="ori-button …" aria-busy="true">
    <OriSpinner :inline="true" size="sm" aria-hidden="true" />
    <span>Saving</span>
</button>
```

#html

```html
<!-- page-level -->
<div style="display: flex; justify-content: center; padding: 2rem">
    <div class="ori-spinner ori-spinner_xl ori-color_primary" role="status" aria-label="Loading page"></div>
</div>

<!-- inside a loading button: spinner is decorative, parent carries the announcement -->
<button class="ori-button …" aria-busy="true">
    <div class="ori-spinner ori-spinner_inline ori-spinner_sm" role="status" aria-hidden="true"></div>
    <span class="ori-button__text">Saving</span>
</button>
```

::

## Accessibility

The accessibility contract holds across every layer — the standalone classes and the Vue component
render the same attributes.

- Renders a `<div role="status">` — a polite live region that announces its `aria-label` to
  screen readers when it appears.
- The default `aria-label` is `"Loading"`. Use the `label` prop to provide a more specific
  message (`"Saving your changes"`, `"Fetching results"`, …).
- When the spinner is decorative — e.g. inside an `aria-busy` button that already carries the
  announcement — pass `aria-hidden="true"` as a fall-through attribute so it is invisible to
  assistive technology.
- No keyboard interaction is required; the spinner is not focusable.

## Framework API

The props, events, and slots of the **Vue** component. The standalone CSS layer has no component
API — its surface is the [classes](#classes) above. (Svelte bindings are planned.)

### Props

| Prop     | Type         | Default     | Description                                                                   |
| -------- | ------------ | ----------- | ----------------------------------------------------------------------------- |
| `color`  | `ThemeColor` | —           | Semantic color role. Omit to inherit `currentcolor` from the parent.          |
| `inline` | `boolean`    | `false`     | Renders as `inline-block` with a small margin for use inside text or buttons. |
| `label`  | `string`     | `'Loading'` | `aria-label` text read by assistive technology.                               |
| `size`   | `ActionSize` | `'text'`    | Ring size (`xs`–`xxl`). Default `'text'` inherits its size from the font.     |

`ThemeColor`: `'primary' | 'secondary' | 'success' | 'warn' | 'danger' | 'info' | 'surface' | 'background'`

`ActionSize`: `'text' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl'`

### Events & attributes

OriSpinner declares **no custom events** and does not set `inheritAttrs: false`, so any extra
attributes you pass (e.g. `class`, `style`, `data-*`) fall through to the root `<div>`. The
`aria-label` is set from the `label` prop (the template binds `:aria-label="label"` directly);
change it via that prop, not as a fall-through attribute.

When the spinner is embedded inside a control that already has an accessible name (a loading
button, for example), set `aria-hidden="true"` on the spinner — because `aria-hidden` is not
explicitly bound in the template it does fall through to the root element, so the live region
will be hidden from assistive technology.

### Slots

OriSpinner has **no slots**. Its visual output is a pure CSS ring driven entirely by class and
attribute props.
