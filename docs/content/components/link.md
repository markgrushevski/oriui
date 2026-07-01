---
title: Link
---

# Link

An inline prose link — the right choice when a destination lives in running text. Distinct from
`OriButton` rendered `as="a"`: a button that navigates is still a button; a link in a sentence is
`OriLink`. Underlined by default (the affordance survives without color), with a `_hover` mode that
hides the underline at rest and reveals it on hover. A visible `:focus-visible` ring uses the same
color as the text.

The examples are organised by **layer**: the [class reference](#classes) is the standalone
**`@oriui/css`** layer, and the [Framework API](#framework-api) is the **`@oriui/vue`** component. Every
example is live — flip its code between **HTML** (the standalone classes, also your htmx / Astro / Svelte /
plain-HTML usage), **Vue**, and **Svelte** _(soon)_; HTML is the default.

## Classes

A link is a block class plus single-class token utilities — one class repoints one token, no base
class needed. The Vue props in [Framework API](#framework-api) map 1:1 to these.

<!-- prettier-ignore -->
:class-table{:rows='[{"class":"ori-link","type":"Block","description":"Required base class. Underlined, inherits currentcolor, cursor pointer."},{"class":"ori-color_*","type":"Color","description":"primary · secondary · success · warn · danger · info · surface — omit to inherit currentcolor from the parent"},{"class":"ori-link_hover","type":"Modifier","description":"Removes the underline at rest; adds it on hover (pointer device only)."}]'}

## Default

An unstyled link in running text — inherits `currentcolor` from the parent, always underlined.

::example
:ori-link[Read the introduction]{href="/overview/introduction"}

#vue

```vue
<OriLink href="/overview/introduction">Read the introduction</OriLink>
```

#html

```html
<a class="ori-link" href="/overview/introduction">Read the introduction</a>
```

::

## Colors

Apply a semantic role with `ori-color_*`. The color drives both the text and the focus ring.

::example
:ori-link[primary]{href="#" color="primary"}
:ori-link[secondary]{href="#" color="secondary"}
:ori-link[success]{href="#" color="success"}
:ori-link[warn]{href="#" color="warn"}
:ori-link[danger]{href="#" color="danger"}
:ori-link[info]{href="#" color="info"}

#vue

```vue
<OriLink href="#" color="primary">primary</OriLink>
<OriLink href="#" color="secondary">secondary</OriLink>
<OriLink href="#" color="success">success</OriLink>
<OriLink href="#" color="warn">warn</OriLink>
<OriLink href="#" color="danger">danger</OriLink>
<OriLink href="#" color="info">info</OriLink>
```

#html

```html
<!-- swap the color class: ori-color_primary → _secondary / _success / _warn / _danger / _info -->
<a class="ori-link ori-color_primary" href="#">primary</a>
<a class="ori-link ori-color_danger" href="#">danger</a>
```

::

## Hover underline

`hover` (/ `ori-link_hover`) removes the underline at rest and reveals it only when the pointer
hovers. Useful in navigation clusters or card bodies where a permanent underline feels noisy.

::example
:ori-link[Underline only on hover]{href="#" color="primary" :hover="true"}

#vue

```vue
<OriLink href="#" color="primary" hover>Underline only on hover</OriLink>
```

#html

```html
<a class="ori-link ori-link_hover ori-color_primary" href="#">Underline only on hover</a>
```

::

## External link

`external` sets `target="_blank"` and `rel="noopener noreferrer"` automatically — no attributes
to remember.

::example
:ori-link[oriUI on GitHub]{href="https://github.com" color="primary" :external="true"}

#vue

```vue
<OriLink href="https://github.com" color="primary" external>oriUI on GitHub</OriLink>
```

#html

```html
<a class="ori-link ori-color_primary" href="https://github.com" target="_blank" rel="noopener noreferrer">
    oriUI on GitHub
</a>
```

::

## Common patterns

A prose paragraph with inline links — the everyday composition.

::example
:ori-link[Get started]{href="/overview/introduction" color="primary"}
:ori-link[View on GitHub]{href="https://github.com" color="primary" :external="true" :hover="true"}

#vue

```vue
<p>
    Read the
    <OriLink href="/overview/introduction" color="primary">Get started</OriLink>
    guide, or browse the source on
    <OriLink href="https://github.com" color="primary" external hover>GitHub</OriLink>.
</p>
```

#html

```html
<p>
    Read the
    <a class="ori-link ori-color_primary" href="/overview/introduction">Get started</a>
    guide, or browse the source on
    <a
        class="ori-link ori-link_hover ori-color_primary"
        href="https://github.com"
        target="_blank"
        rel="noopener noreferrer"
        >GitHub</a
    >.
</p>
```

::

## Accessibility

The accessibility contract holds across every layer — the standalone classes and the Vue component
render the same attributes.

- Renders a real `<a>` by default; `as` accepts any tag or component (e.g. a router link). Pass
  `href` so the element is keyboard-reachable and announced as a link by assistive technology. A
  link without `href` is not focusable by default — add `tabindex="0"` if needed.
- `external` injects `rel="noopener noreferrer"` for security (prevents the opened page from
  accessing `window.opener`) alongside `target="_blank"`.
- Visible `:focus-visible` outline uses `var(--ori-color)` (same as the text) with a `2px` offset
  so it contrasts the surrounding text surface.
- Color is never the sole differentiator — the default underline ensures the link is perceivable
  without relying on hue alone (WCAG 1.4.1).

| Key     | Action                        |
| ------- | ----------------------------- |
| `Enter` | Follows the link.             |
| `Tab`   | Moves focus to the next link. |

## Framework API

The props, events, and slots of the **Vue** component. The standalone CSS layer has no component
API — its surface is the [classes](#classes) above. (Svelte bindings are planned.)

### Props

| Prop       | Type               | Default | Description                                                                        |
| ---------- | ------------------ | ------- | ---------------------------------------------------------------------------------- |
| `as`       | `string \| object` | `'a'`   | HTML tag name or component to render (e.g. `'a'`, a router-link component).        |
| `color`    | `ThemeColor`       | —       | Semantic color role. Omit to inherit `currentcolor` from the parent.               |
| `external` | `boolean`          | `false` | Sets `target="_blank"` and `rel="noopener noreferrer"` on the rendered element.    |
| `hover`    | `boolean`          | `false` | Hides the underline at rest; shows it only on hover (`ori-link_hover`).            |
| `href`     | `string`           | —       | The link destination. Required for the element to be keyboard-focusable as a link. |

`ThemeColor`: `'primary' | 'secondary' | 'success' | 'warn' | 'danger' | 'info' | 'surface' | 'background'`

### Events & attributes

OriLink declares **no custom events** and does not set `inheritAttrs: false`, so native listeners
(`@click`, `@focus`, …) and attributes (`aria-label`, `download`, `data-*`, …) fall through to the
rendered element — the tag given by `as`.

### Slots

| Slot      | Description                      |
| --------- | -------------------------------- |
| `default` | The link text or inline content. |

### Polymorphic (`as`)

Render any tag or component. The most common alternative is a router-link (Vue Router or
NuxtLink) — pass the component reference and use its own navigation props alongside `href`.

::example
:ori-link[Go to Components]{href="/components/button" color="primary" :hover="true"}

#vue

```vue
<!-- plain anchor (default) -->
<OriLink href="/components/button" color="primary">Go to Components</OriLink>

<!-- with a router link -->
<OriLink :as="RouterLink" to="/components/button" color="primary">Go to Components</OriLink>
```

#html

```html
<a class="ori-link ori-color_primary" href="/components/button">Go to Components</a>
```

::
