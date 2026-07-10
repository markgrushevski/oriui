---
title: Surface
---

# Surface

An **elevated floating surface** — a lifted panel with a surface background, an optional hairline, a
corner radius, and a mode-aware shadow, and **nothing else**. No padding, no header/title semantics: it
is just the box, and the caller owns the layout inside. It's the building block for chrome that floats
over content — a toolbar island, a zoom control, a side panel, a menu popout's container — and the
**elevation** counterpart to [Card](/components/card), which is a _content_ card (padding + header /
title / body / actions).

The examples are organised by **layer**: the [class reference](#classes) is the standalone
**`@oriui/css`** layer, and the [Framework API](#framework-api) is the **`@oriui/vue`** component.

## Classes

A block class plus two single-class axes — the elevation modifier and the shared `.ori-size-radius_*`
utility. Bordered is a modifier; the surface colour is fixed (it's chrome).

<!-- prettier-ignore -->
:class-table{:rows='[{"class":"ori-surface","type":"Block","description":"Required base class. Surface background + on-surface text + lg radius; a block-level box with no padding of its own."},{"class":"ori-surface_elevation-sm | -md | -lg","type":"Modifier","description":"Shadow depth, mapped to the mode-aware --ori-shadow-{sm,md,lg} tokens (light: tinted ink; dark: deeper shadow). Default lg."},{"class":"ori-surface_bordered","type":"Modifier","description":"Adds a hairline border (a color-mix of on-surface). Present by default via the bordered prop; drop it for a shadow-only surface."},{"class":"ori-size-radius_*","type":"Radius","description":"Repoints --ori-size-radius (zero · xs · sm · md · lg · xl · rounded). The block bakes lg as the default."}]'}

## Elevation

Three depths, mode-aware. Drag the theme toggle and the shadow re-tunes automatically (tinted ink in
light, deeper shadow in dark).

::example
::ori-surface{elevation="sm" style="padding: 1rem"}
Small
::

::ori-surface{elevation="md" style="padding: 1rem"}
Medium
::

::ori-surface{elevation="lg" style="padding: 1rem"}
Large (default)
::

#vue

```vue
<OriSurface elevation="sm" style="padding: 1rem">Small</OriSurface>
<OriSurface elevation="md" style="padding: 1rem">Medium</OriSurface>
<OriSurface elevation="lg" style="padding: 1rem">Large (default)</OriSurface>
```

#html

```html
<div class="ori-surface ori-surface_elevation-md ori-surface_bordered ori-size-radius_lg" style="padding: 1rem">
    Medium
</div>
```

::

## Radius & border

`radius` repoints the shared radius token; `bordered="false"` drops the hairline for a shadow-only
surface.

::example
::ori-surface{radius="sm" style="padding: 1rem"}
Tight corners
::

::ori-surface{:bordered="false" style="padding: 1rem"}
No border — shadow only
::

#vue

```vue
<OriSurface radius="sm" style="padding: 1rem">Tight corners</OriSurface>
<OriSurface :bordered="false" style="padding: 1rem">No border — shadow only</OriSurface>
```

::

## Composing chrome

The intended use: wrap floating chrome — a [toolbar](/components/toolbar), a control cluster — so it
lifts off the content beneath. `OriSurface` supplies the box; the toolbar supplies the behaviour.

::example
::ori-surface{style="padding: 0.5rem; display: inline-block"}
::ori-toolbar{label="Format"}
:ori-toolbar-button{text="Bold"}
:ori-toolbar-button{text="Italic"}
:ori-toolbar-separator
:ori-toolbar-button{text="Link" color="primary"}
::
::

#vue

```vue
<OriSurface style="padding: 0.5rem; display: inline-block">
    <OriToolbar label="Format">
        <OriToolbarButton text="Bold" />
        <OriToolbarButton text="Italic" />
        <OriToolbarSeparator />
        <OriToolbarButton text="Link" color="primary" />
    </OriToolbar>
</OriSurface>
```

::

## Framework API

The props of the **Vue** component. The standalone CSS layer's surface is the [classes](#classes)
above.

### Props

| Prop        | Type                   | Default | Description                                                                                 |
| ----------- | ---------------------- | ------- | ------------------------------------------------------------------------------------------- |
| `as`        | `string \| object`     | `'div'` | Element / component to render as.                                                           |
| `bordered`  | `boolean`              | `true`  | A hairline border around the surface. Set `false` for a shadow-only surface.                |
| `elevation` | `'sm' \| 'md' \| 'lg'` | `'lg'`  | Shadow depth → `--ori-shadow-{sm,md,lg}` (mode-aware).                                      |
| `radius`    | `RadiusSize`           | `'lg'`  | Corner radius; repoints `--ori-size-radius` via the utility (zero · xs · sm · md · lg · …). |

### Slots

| Slot      | Description                                                                 |
| --------- | --------------------------------------------------------------------------- |
| `default` | The surface content — the caller's own layout (OriSurface adds no padding). |

## Accessibility

`OriSurface` is a **presentational container** — by default a plain `<div>` with no role, so it adds
nothing to the accessibility tree (correct for pure chrome). If the surface is a **landmark** (a
complementary panel, a region worth navigating to), give it the semantics yourself: render `as="aside"`,
or add `role="region"` / `role="complementary"` with an `aria-label` — attributes fall through to the
element. Don't add a role without a name; an unnamed `region` is a nuisance to screen-reader users.
