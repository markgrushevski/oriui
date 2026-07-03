---
title: Stack
---

# Stack

The workhorse layout primitive — two flex modes in one component. A **stack** (`ori-stack`) is a
flex column: children flow top-to-bottom with a consistent gap. A **cluster** (`ori-cluster`) is a
wrapping flex row: children flow left-to-right, wrap onto new lines, and are centered on the
cross-axis — ideal for tag clouds, button groups, and badge sets.

The examples are organised by **layer**: the [class reference](#classes) is the standalone
**`@oriui/css`** layer, and the [Framework API](#framework-api) is the **`@oriui/vue`** component. Every
example is live — flip its code between **HTML** (the standalone classes, also your htmx / Astro / Svelte /
plain-HTML usage), **Vue**; HTML is the default.

## Classes

Stack and cluster each have one block class. Gap is a single-class token utility —
one class repoints `--ori-size-gap`, no cascade conflict. The Vue props in
[Framework API](#framework-api) map 1:1 to these.

<!-- prettier-ignore -->
:class-table{:rows='[{"class":"ori-stack","type":"Block","description":"Flex column. Children stack top-to-bottom, separated by the gap token."},{"class":"ori-cluster","type":"Block","description":"Flex row that wraps. Children flow left-to-right and wrap; cross-axis centered by default."},{"class":"ori-size-gap_*","type":"Gap","description":"zero · xs · sm · <b>md</b> · lg · xl — repoints --ori-size-gap on the container."}]'}

## Vertical stack

Children laid out in a column, separated by `gap`. Default gap is `md` when the `gap` prop is
provided; without a gap class the gap is whatever `--ori-size-gap` resolves to at that scope.

::example
::ori-stack{gap="md"}
:ori-button{text="First item" variant="outline"}
:ori-button{text="Second item" variant="outline"}
:ori-button{text="Third item" variant="outline"}
::

#vue

```vue
<OriStack gap="md">
    <OriButton text="First item" variant="outline" />
    <OriButton text="Second item" variant="outline" />
    <OriButton text="Third item" variant="outline" />
</OriStack>
```

#html

```html
<div class="ori-stack ori-size-gap_md">
    <button class="ori-button ori-variant_outline">First item</button>
    <button class="ori-button ori-variant_outline">Second item</button>
    <button class="ori-button ori-variant_outline">Third item</button>
</div>
```

::

## Cluster (wrapping row)

Set `cluster` to switch to the wrapping row. Tags, chips, and button groups all fit here — the
cluster wraps gracefully at narrow widths.

::example
::ori-stack{:cluster="true" gap="sm"}
:ori-button{text="Vue 3" variant="tonal"}
:ori-button{text="TypeScript" variant="tonal"}
:ori-button{text="Vite" variant="tonal"}
:ori-button{text="Nuxt" variant="tonal"}
:ori-button{text="Vitest" variant="tonal"}
:ori-button{text="axe-core" variant="tonal"}
::

#vue

```vue
<OriStack cluster gap="sm">
    <OriButton text="Vue 3" variant="tonal" />
    <OriButton text="TypeScript" variant="tonal" />
    <OriButton text="Vite" variant="tonal" />
    <OriButton text="Nuxt" variant="tonal" />
    <OriButton text="Vitest" variant="tonal" />
    <OriButton text="axe-core" variant="tonal" />
</OriStack>
```

#html

```html
<div class="ori-cluster ori-size-gap_sm">
    <button class="ori-button ori-variant_tonal">Vue 3</button>
    <button class="ori-button ori-variant_tonal">TypeScript</button>
    <button class="ori-button ori-variant_tonal">Vite</button>
    <button class="ori-button ori-variant_tonal">Nuxt</button>
    <button class="ori-button ori-variant_tonal">Vitest</button>
    <button class="ori-button ori-variant_tonal">axe-core</button>
</div>
```

::

## Gap scale

`zero` collapses the gap entirely; `xl` spreads items wide. The `gap` prop emits a single
`ori-size-gap_<size>` class — the token does the rest.

::example
::ori-stack{gap="zero"}
:ori-button{text="zero" size="sm" variant="fill"}
:ori-button{text="zero" size="sm" variant="fill"}
::
::ori-stack{gap="xs"}
:ori-button{text="xs" size="sm" variant="tonal"}
:ori-button{text="xs" size="sm" variant="tonal"}
::
::ori-stack{gap="sm"}
:ori-button{text="sm" size="sm" variant="outline"}
:ori-button{text="sm" size="sm" variant="outline"}
::
::ori-stack{gap="md"}
:ori-button{text="md" size="sm" variant="tonal"}
:ori-button{text="md" size="sm" variant="tonal"}
::
::ori-stack{gap="lg"}
:ori-button{text="lg" size="sm" variant="outline"}
:ori-button{text="lg" size="sm" variant="outline"}
::
::ori-stack{gap="xl"}
:ori-button{text="xl" size="sm" variant="fill"}
:ori-button{text="xl" size="sm" variant="fill"}
::

#vue

```vue
<OriStack gap="zero"> … </OriStack>
<OriStack gap="xs"> … </OriStack>
<OriStack gap="sm"> … </OriStack>
<OriStack gap="md"> … </OriStack>
<OriStack gap="lg"> … </OriStack>
<OriStack gap="xl"> … </OriStack>
```

#html

```html
<!-- swap the gap class: ori-size-gap_zero → _xs / _sm / _md / _lg / _xl -->
<div class="ori-stack ori-size-gap_lg">…</div>
```

::

## Alignment

`align` maps to CSS `align-items` and `justify` to `justify-content`, applied as inline styles.
Useful for centering a cluster horizontally, or stretching stack children to full width.

::example
::ori-stack{:cluster="true" gap="sm" justify="center"}
:ori-button{text="Centered" variant="fill"}
:ori-button{text="Cluster" variant="tonal"}
:ori-button{text="Row" variant="outline"}
::

#vue

```vue
<!-- Cluster with centered main axis -->
<OriStack cluster gap="sm" justify="center">
    <OriButton text="Centered" variant="fill" />
    <OriButton text="Cluster" variant="tonal" />
    <OriButton text="Row" variant="outline" />
</OriStack>

<!-- Stack with cross-axis centering (children narrower than the container) -->
<OriStack gap="md" align="center">
    <OriButton text="Narrow A" variant="outline" />
    <OriButton text="Narrow B" variant="outline" />
</OriStack>
```

#html

```html
<!-- justify-content via inline style -->
<div class="ori-cluster ori-size-gap_sm" style="justify-content: center">
    <button class="ori-button ori-variant_fill">Centered</button>
    <button class="ori-button ori-variant_tonal">Cluster</button>
    <button class="ori-button ori-variant_outline">Row</button>
</div>

<!-- align-items via inline style -->
<div class="ori-stack ori-size-gap_md" style="align-items: center">
    <button class="ori-button ori-variant_outline">Narrow A</button>
    <button class="ori-button ori-variant_outline">Narrow B</button>
</div>
```

::

## Polymorphic (`as`)

Stack renders a `<div>` by default. Pass `as` to use any tag — `ul` / `ol` for semantic lists,
`section` for document structure, or a router component.

::example
::ori-stack{as="ul" gap="sm"}
:ori-card{title="Item one" text="List item rendered in a stack."}
:ori-card{title="Item two" text="Same gap, semantic ul element."}
::

#vue

```vue
<!-- Semantic list: each child would be an <li> in a real component -->
<OriStack as="ul" gap="sm">
    <OriCard title="Item one" text="List item rendered in a stack." />
    <OriCard title="Item two" text="Same gap, semantic ul element." />
</OriStack>
```

#html

```html
<ul class="ori-stack ori-size-gap_sm">
    <li>…</li>
    <li>…</li>
</ul>
```

::

## Common patterns

### Form field column

A vertical stack holding labeled inputs — the most common use in forms.

::example
::ori-stack{gap="lg"}
:ori-input{label="Full name" placeholder="Jane Smith"}
:ori-input{label="Email" placeholder="jane@example.com"}
::ori-stack{:cluster="true" gap="sm" justify="flex-end"}
:ori-button{text="Cancel" variant="text"}
:ori-button{text="Save" variant="fill"}
::
::

#vue

```vue
<OriStack gap="lg">
    <OriInput label="Full name" placeholder="Jane Smith" />
    <OriInput label="Email" placeholder="jane@example.com" />
    <OriStack cluster gap="sm" justify="flex-end">
        <OriButton text="Cancel" variant="text" />
        <OriButton text="Save" variant="fill" />
    </OriStack>
</OriStack>
```

#html

```html
<div class="ori-stack ori-size-gap_lg">
    <!-- inputs -->
    <div class="ori-cluster ori-size-gap_sm" style="justify-content: flex-end">
        <button class="ori-button ori-variant_text">Cancel</button>
        <button class="ori-button ori-variant_fill">Save</button>
    </div>
</div>
```

::

### Card grid with a cluster header

A cluster for the header actions above a stack of cards.

::example
::ori-stack{gap="md"}
::ori-stack{:cluster="true" gap="sm" justify="space-between" align="center"}
:ori-button{text="Filter" variant="outline"}
:ori-button{text="New" variant="fill"}
::
:ori-card{title="Project Alpha" text="Design system refactor — in progress."}
:ori-card{title="Project Beta" text="Accessibility audit — review pending."}
::

#vue

```vue
<OriStack gap="md">
    <OriStack cluster gap="sm" justify="space-between" align="center">
        <OriButton text="Filter" variant="outline" />
        <OriButton text="New" variant="fill" />
    </OriStack>
    <OriCard title="Project Alpha" text="Design system refactor — in progress." />
    <OriCard title="Project Beta" text="Accessibility audit — review pending." />
</OriStack>
```

#html

```html
<div class="ori-stack ori-size-gap_md">
    <div class="ori-cluster ori-size-gap_sm" style="justify-content: space-between; align-items: center">
        <button class="ori-button ori-variant_outline">Filter</button>
        <button class="ori-button ori-variant_fill">New</button>
    </div>
    <div class="ori-card ori-size-radius_lg ori-variant_fill ori-color_surface">
        <div class="ori-card__header">
            <div class="ori-card__headline"><div class="ori-card__title">Project Alpha</div></div>
        </div>
        <div class="ori-card__body">Design system refactor — in progress.</div>
    </div>
    <div class="ori-card ori-size-radius_lg ori-variant_fill ori-color_surface">
        <div class="ori-card__header">
            <div class="ori-card__headline"><div class="ori-card__title">Project Beta</div></div>
        </div>
        <div class="ori-card__body">Accessibility audit — review pending.</div>
    </div>
</div>
```

::

## Accessibility

Stack and cluster are **purely presentational containers**. They carry no ARIA role, no
`tabindex`, and no focusable state of their own — they are transparent to assistive technology.

- Use a semantically appropriate `as` tag when the layout conveys document structure: `as="ul"` /
  `as="ol"` for lists, `as="section"` for landmark regions (add `aria-label`), `as="nav"` for
  navigation clusters.
- No keyboard interaction is defined for the container itself; keyboard behavior is owned entirely
  by the children.

## Framework API

The props, events, and slots of the **Vue** component. The standalone CSS layer has no component
API — its surface is the [classes](#classes) above. (Svelte bindings are planned.)

### Props

| Prop      | Type               | Default | Description                                                                                    |
| --------- | ------------------ | ------- | ---------------------------------------------------------------------------------------------- |
| `align`   | `string`           | —       | CSS `align-items` value applied as an inline style on the container.                           |
| `as`      | `string \| object` | `'div'` | HTML tag name or component reference to render (e.g. `'ul'`, `'section'`, a router component). |
| `cluster` | `boolean`          | `false` | Switches from a flex column (`ori-stack`) to a wrapping flex row (`ori-cluster`).              |
| `gap`     | `GapSize`          | —       | Gap between children: `zero` · `xs` · `sm` · `md` · `lg` · `xl`. Emits `ori-size-gap_<size>`.  |
| `justify` | `string`           | —       | CSS `justify-content` value applied as an inline style on the container.                       |

`GapSize = 'zero' | 'xs' | 'sm' | 'md' | 'lg' | 'xl'`

### Events & attributes

OriStack declares **no custom events** and does not set `inheritAttrs: false`, so extra attributes
(`id`, `class`, `style`, `data-*`, event listeners, etc.) fall through to the rendered root element.

### Slots

| Slot      | Description                                      |
| --------- | ------------------------------------------------ |
| `default` | The children to lay out in the stack or cluster. |
