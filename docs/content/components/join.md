---
title: Join
---

# Join

A thin wrapper that collapses the shared radii and borders of adjacent controls so they read as one
segmented unit — button groups, input+button combos, segmented toolbars. No visual styling of its
own: all colour, size, and variant tokens live on the children.

The examples are organised by **layer**: the [class reference](#classes) is the standalone
**`@oriui/css`** layer, and the [Framework API](#framework-api) is the **`@oriui/vue`** component. Every
example is live — flip its code between **HTML** (the standalone classes, also your htmx / Astro / Svelte /
plain-HTML usage), **Vue**, and **Svelte** _(soon)_; HTML is the default.

## Classes

<!-- prettier-ignore -->
:class-table{:rows='[{"class":"ori-join","type":"Block","description":"Required base class. inline-flex container; collapses shared radii and borders between adjacent children."},{"class":"ori-join_vertical","type":"Modifier","description":"Stack children vertically instead of horizontally. Collapses block edges instead of inline edges."},{"class":"role=group","type":"Semantics","description":"Always present on the root element. Wrap logically related controls; supply aria-label or aria-labelledby so screen readers announce the group purpose."}]'}

## Horizontal button group

Three outline buttons joined into one segmented control. The shared interior borders collapse to a
single 1 px line; the outer corners keep their radius.

::example
::ori-join{aria-label="Text alignment"}
:ori-button{variant="outline" text="Left"}
:ori-button{variant="outline" text="Center"}
:ori-button{variant="outline" text="Right"}
::

#vue

```vue
<OriJoin aria-label="Text alignment">
    <OriButton variant="outline" text="Left" />
    <OriButton variant="outline" text="Center" />
    <OriButton variant="outline" text="Right" />
</OriJoin>
```

#html

```html
<div class="ori-join" role="group" aria-label="Text alignment">
    <button class="ori-button ori-variant_outline ori-color_primary">Left</button>
    <button class="ori-button ori-variant_outline ori-color_primary">Center</button>
    <button class="ori-button ori-variant_outline ori-color_primary">Right</button>
</div>
```

::

## Input + button (search)

An input field joined with a submit button — the canonical search-box pattern. The shared border
between the field and the button merges into one line.

::example
::ori-join{aria-label="Search"}
:ori-input{placeholder="Search…" aria-label="Search query"}
:ori-button{variant="fill" text="Go"}
::

#vue

```vue
<OriJoin aria-label="Search">
    <OriInput placeholder="Search…" aria-label="Search query" />
    <OriButton variant="fill" text="Go" />
</OriJoin>
```

#html

```html
<div class="ori-join" role="group" aria-label="Search">
    <input class="ori-input" type="search" placeholder="Search…" aria-label="Search query" />
    <button class="ori-button ori-variant_fill ori-color_primary">Go</button>
</div>
```

::

## Vertical

`vertical` stacks children in a column and collapses the block edges instead of the inline edges.

::example
::ori-join{:vertical="true" aria-label="View mode"}
:ori-button{variant="outline" text="List"}
:ori-button{variant="outline" text="Grid"}
:ori-button{variant="outline" text="Table"}
::

#vue

```vue
<OriJoin :vertical="true" aria-label="View mode">
    <OriButton variant="outline" text="List" />
    <OriButton variant="outline" text="Grid" />
    <OriButton variant="outline" text="Table" />
</OriJoin>
```

#html

```html
<div class="ori-join ori-join_vertical" role="group" aria-label="View mode">
    <button class="ori-button ori-variant_outline ori-color_primary">List</button>
    <button class="ori-button ori-variant_outline ori-color_primary">Grid</button>
    <button class="ori-button ori-variant_outline ori-color_primary">Table</button>
</div>
```

::

## Common patterns

A tonal colour swatch group and a quantity stepper — two everyday compositions showing how variant
and color on the children drive all the visual weight.

### Colour swatch group

::example
::ori-join{aria-label="Highlight colour"}
:ori-button{variant="tonal" color="danger" text="Red"}
:ori-button{variant="tonal" color="warn" text="Amber"}
:ori-button{variant="tonal" color="success" text="Green"}
:ori-button{variant="tonal" color="info" text="Blue"}
::

#vue

```vue
<!-- Colour swatch toolbar — tonal buttons, each its own semantic colour -->
<OriJoin aria-label="Highlight colour">
    <OriButton variant="tonal" color="danger" text="Red" />
    <OriButton variant="tonal" color="warn" text="Amber" />
    <OriButton variant="tonal" color="success" text="Green" />
    <OriButton variant="tonal" color="info" text="Blue" />
</OriJoin>
```

#html

```html
<div class="ori-join" role="group" aria-label="Highlight colour">
    <button class="ori-button ori-variant_tonal ori-color_danger">Red</button>
    <button class="ori-button ori-variant_tonal ori-color_warn">Amber</button>
    <button class="ori-button ori-variant_tonal ori-color_success">Green</button>
    <button class="ori-button ori-variant_tonal ori-color_info">Blue</button>
</div>
```

::

### Quantity stepper

::example
::ori-join{aria-label="Quantity"}
:ori-button{variant="outline" text="−" aria-label="Decrease quantity"}
:ori-input{:value="1" aria-label="Current quantity"}
:ori-button{variant="outline" text="+" aria-label="Increase quantity"}
::

#vue

```vue
<!-- Quantity stepper: decrement · value display · increment -->
<OriJoin aria-label="Quantity">
    <OriButton variant="outline" text="−" aria-label="Decrease quantity" />
    <OriInput :value="1" aria-label="Current quantity" style="width: 4rem; text-align: center" />
    <OriButton variant="outline" text="+" aria-label="Increase quantity" />
</OriJoin>
```

#html

```html
<div class="ori-join" role="group" aria-label="Quantity">
    <button class="ori-button ori-variant_outline ori-color_primary" aria-label="Decrease quantity">−</button>
    <input
        class="ori-input"
        type="number"
        value="1"
        aria-label="Current quantity"
        style="width: 4rem; text-align: center"
    />
    <button class="ori-button ori-variant_outline ori-color_primary" aria-label="Increase quantity">+</button>
</div>
```

::

## Accessibility

The accessibility contract holds across every layer — the standalone classes and the Vue component
render the same markup.

- The root element always carries `role="group"`. A group that contains multiple controls **should**
  have an accessible name so screen readers announce its purpose. Pass `aria-label` (or
  `aria-labelledby` referencing a visible heading) directly on `<OriJoin>` — it falls through to the
  root element unchanged.
- Children keep their own roles, labels, and keyboard behaviour. The join wrapper adds no tab stop
  and intercepts no keys.
- When a child is focused or hovered its `z-index` is raised to `1` so its full `:focus-visible`
  ring is not clipped by the adjacent collapsed border.
- Icon-only children still need their own `aria-label`.

| Key        | Action                                            |
| ---------- | ------------------------------------------------- |
| `Tab`      | Moves focus between child controls.               |
| `Enter`    | Activates the focused child control.              |
| `Space`    | Activates a focused button child.                 |
| Arrow keys | Within a radiogroup child, moves between options. |

## Framework API

The props, events, and slots of the **Vue** component. The standalone CSS layer has no component
API — its surface is the [classes](#classes) above.

### Props

| Prop       | Type               | Default | Description                                                                         |
| ---------- | ------------------ | ------- | ----------------------------------------------------------------------------------- |
| `as`       | `string \| object` | `'div'` | Element or component to render. Accepts any HTML tag name or a Component reference. |
| `vertical` | `boolean`          | `false` | Stack children in a column and collapse block edges instead of inline edges.        |

### Events & attributes

OriJoin declares **no custom events** and does not set `inheritAttrs: false`, so native attributes
(`aria-label`, `aria-labelledby`, `id`, `class`, `style`, `data-*`) fall through to the root
element. Pass `aria-label` here to name the group.

### Slots

| Slot      | Description                                                                                              |
| --------- | -------------------------------------------------------------------------------------------------------- |
| `default` | The controls to group — buttons, inputs, or any element that carries `ori-button` / `ori-input` classes. |

### Polymorphic (`as`)

Render any tag or component. Useful when the join is semantically a toolbar (`role="toolbar"` via
`aria-label` on an `<OriJoin as="div">`) or when a router wrapper is needed.

```vue
<!-- Use a semantic toolbar role for a group of action buttons -->
<OriJoin as="div" role="toolbar" aria-label="Formatting options">
    <OriButton variant="outline" text="Bold" aria-pressed="false" />
    <OriButton variant="outline" text="Italic" aria-pressed="false" />
    <OriButton variant="outline" text="Underline" aria-pressed="false" />
</OriJoin>
```
