---
title: Skeleton
---

# Skeleton

A loading placeholder that signals content is on its way. An animated shimmer sweep sweeps across the
block; on devices that request reduced motion the shimmer stops and the tinted block alone signals the
loading state. Size it with an inline `style` or a utility class — the skeleton itself carries no
intrinsic width or height beyond a `1em` minimum height.

Every example is live and shows the standalone **HTML / `@oriui/css`** markup by default — the same
classes you'd use in htmx, Astro, Svelte, or plain HTML. Flip any example to **Vue** for the styled
component.

## Classes

A skeleton is a single block class. Radius is a single-class token utility — one class repoints
`--ori-size-radius`, no base class needed. The Vue props in [Framework API](#framework-api) map 1:1
to these. There is no variant or color — a skeleton reads `currentcolor` from its parent for both the
tinted base and the shimmer highlight.

<!-- prettier-ignore -->
:class-table{:rows='[{"class":"ori-skeleton","type":"Block","description":"Required base class. Renders a tinted, animated shimmer block."},{"class":"ori-size-radius_*","type":"Radius","description":"zero · xs · <b>sm</b> · md · lg · xl · rounded — <b>sm</b> is the default; repoints --ori-size-radius on the element."},{"class":"aria-hidden=true","type":"State","description":"Always present. The skeleton is decorative; the loading region that owns the announcement should carry aria-busy on the consumer side."}]'}

## Text line

A single line — size it to match the text it is standing in for.

::example
:ori-skeleton{style="width: 12rem; height: 1rem"}

#vue

```vue
<OriSkeleton style="width: 12rem; height: 1rem" />
```

#html

```html
<div class="ori-skeleton" aria-hidden="true" style="width: 12rem; height: 1rem"></div>
```

::

## Circle (avatar)

`radius="rounded"` produces a pill / circle. Pair equal width and height for a round avatar
placeholder.

::example
:ori-skeleton{radius="rounded" style="width: 3rem; height: 3rem"}

#vue

```vue
<OriSkeleton radius="rounded" style="width: 3rem; height: 3rem" />
```

#html

```html
<div class="ori-skeleton ori-size-radius_rounded" aria-hidden="true" style="width: 3rem; height: 3rem"></div>
```

::

## Stacked text lines

Simulate a paragraph with a few lines of varying width.

::example
::ori-stack{gap="xs"}
:ori-skeleton{style="width: 100%; height: 1rem"}
:ori-skeleton{style="width: 80%; height: 1rem"}
:ori-skeleton{style="width: 90%; height: 1rem"}
:ori-skeleton{style="width: 60%; height: 1rem"}
::

#vue

```vue
<OriStack gap="xs">
    <OriSkeleton style="width: 100%; height: 1rem" />
    <OriSkeleton style="width: 80%; height: 1rem" />
    <OriSkeleton style="width: 90%; height: 1rem" />
    <OriSkeleton style="width: 60%; height: 1rem" />
</OriStack>
```

#html

```html
<div class="ori-stack ori-size-gap_xs" aria-busy="true" aria-label="Loading">
    <div class="ori-skeleton" aria-hidden="true" style="width: 100%; height: 1rem"></div>
    <div class="ori-skeleton" aria-hidden="true" style="width: 80%; height: 1rem"></div>
    <div class="ori-skeleton" aria-hidden="true" style="width: 90%; height: 1rem"></div>
    <div class="ori-skeleton" aria-hidden="true" style="width: 60%; height: 1rem"></div>
</div>
```

::

## Card composition

Combine a circle avatar, a title line, and a body block to stand in for a card while its data loads.
The wrapping region carries `aria-busy`.

::example
::ori-stack{gap="md" style="max-width: 20rem; padding: 1rem; border-radius: 0.5rem; background: color-mix(in srgb, currentcolor 5%, transparent)"}
::ori-stack{:cluster="true" gap="sm" style="align-items: center"}
:ori-skeleton{radius="rounded" style="width: 2.5rem; height: 2.5rem; flex-shrink: 0"}
::ori-stack{gap="xs" style="flex: 1"}
:ori-skeleton{style="width: 60%; height: 0.875rem"}
:ori-skeleton{style="width: 40%; height: 0.75rem"}
::
::
:ori-skeleton{style="width: 100%; height: 6rem; margin-top: 0.25rem"}
::

#vue

```vue
<OriStack gap="md" style="max-width: 20rem" aria-busy="true" aria-label="Loading card">
    <!-- header: avatar + two title lines -->
    <OriStack cluster gap="sm" style="align-items: center">
        <OriSkeleton radius="rounded" style="width: 2.5rem; height: 2.5rem; flex-shrink: 0" />
        <OriStack gap="xs" style="flex: 1">
            <OriSkeleton style="width: 60%; height: 0.875rem" />
            <OriSkeleton style="width: 40%; height: 0.75rem" />
        </OriStack>
    </OriStack>
    <!-- body block -->
    <OriSkeleton style="width: 100%; height: 6rem" />
</OriStack>
```

#html

```html
<div class="ori-stack ori-size-gap_md" style="max-width: 20rem" aria-busy="true" aria-label="Loading card">
    <!-- header: avatar + two title lines -->
    <div class="ori-cluster ori-size-gap_sm" style="align-items: center">
        <div
            class="ori-skeleton ori-size-radius_rounded"
            aria-hidden="true"
            style="width: 2.5rem; height: 2.5rem; flex-shrink: 0"
        ></div>
        <div class="ori-stack ori-size-gap_xs" style="flex: 1">
            <div class="ori-skeleton" aria-hidden="true" style="width: 60%; height: 0.875rem"></div>
            <div class="ori-skeleton" aria-hidden="true" style="width: 40%; height: 0.75rem"></div>
        </div>
    </div>
    <!-- body block -->
    <div class="ori-skeleton" aria-hidden="true" style="width: 100%; height: 6rem"></div>
</div>
```

::

## Radius scale

The default `sm` gives a subtle rounded corner. Use `rounded` for circles and pill shapes; `zero` for
a perfectly square placeholder.

::example
:ori-skeleton{radius="zero" style="width: 4rem; height: 2rem"}
:ori-skeleton{radius="xs" style="width: 4rem; height: 2rem"}
:ori-skeleton{radius="sm" style="width: 4rem; height: 2rem"}
:ori-skeleton{radius="md" style="width: 4rem; height: 2rem"}
:ori-skeleton{radius="lg" style="width: 4rem; height: 2rem"}
:ori-skeleton{radius="xl" style="width: 4rem; height: 2rem"}
:ori-skeleton{radius="rounded" style="width: 4rem; height: 2rem"}

#vue

```vue
<OriSkeleton radius="zero" style="width: 4rem; height: 2rem" />
<OriSkeleton radius="xs" style="width: 4rem; height: 2rem" />
<OriSkeleton radius="sm" style="width: 4rem; height: 2rem" />
<OriSkeleton radius="md" style="width: 4rem; height: 2rem" />
<OriSkeleton radius="lg" style="width: 4rem; height: 2rem" />
<OriSkeleton radius="xl" style="width: 4rem; height: 2rem" />
<OriSkeleton radius="rounded" style="width: 4rem; height: 2rem" />
```

#html

```html
<!-- swap the radius class: ori-size-radius_zero → _xs / _sm / _md / _lg / _xl / _rounded -->
<div class="ori-skeleton ori-size-radius_zero" aria-hidden="true" style="width: 4rem; height: 2rem"></div>
<div class="ori-skeleton ori-size-radius_rounded" aria-hidden="true" style="width: 4rem; height: 2rem"></div>
```

::

## Accessibility

The accessibility contract holds across every layer — the standalone classes and the Vue component
render the same attributes.

- The skeleton is **decorative** — it renders `aria-hidden="true"` on every instance. A skeleton by
  itself makes no announcement.
- **The consumer owns the loading announcement.** Place `aria-busy="true"` and an `aria-label` (e.g.
  `"Loading"`) on the container that wraps one or more skeletons. Screen readers then announce the
  label when the region appears and again when `aria-busy` is removed once data arrives.
- When `prefers-reduced-motion: reduce` is active the shimmer animation is suppressed (`animation:
none`). The tinted base block remains visible and continues to communicate that content is loading.
- No keyboard interaction is required; the skeleton is not focusable.

## Framework API

The props, events, and slots of the **Vue** component. The standalone CSS layer has no component
API — its surface is the [classes](#classes) above. (Svelte bindings are planned.)

### Props

| Prop     | Type               | Default | Description                                                           |
| -------- | ------------------ | ------- | --------------------------------------------------------------------- |
| `as`     | `string \| object` | `'div'` | HTML tag name or component reference to render.                       |
| `radius` | `RadiusSize`       | `'sm'`  | Corner radius: `zero` · `xs` · `sm` · `md` · `lg` · `xl` · `rounded`. |

`RadiusSize`: `'zero' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'rounded'`

### Events & attributes

OriSkeleton declares **no custom events** and does not set `inheritAttrs: false`, so extra attributes
(`style`, `class`, `data-*`) fall through to the rendered root element. `aria-hidden="true"` is bound
directly in the template and is always present; do not override it.

### Slots

OriSkeleton has **no slots**. Size it via an inline `style` or a utility class on the element — the
skeleton expands to whatever dimensions you give it.
