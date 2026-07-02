---
title: Popover
---

# Popover

A positioned overlay for supplementary content — a menu, a filter panel, a rich hint — tethered to a
trigger. It runs entirely on the platform: the trigger opens the panel through the **Popover API**
(top-layer, light-dismiss, `Esc` — zero JS), and the panel is placed with **CSS Anchor Positioning**
(`anchor-name` / `position-anchor` + `position-area`, with a collision flip via
`position-try-fallbacks`) — zero positioning JS, no scroll/resize listeners. Baseline 2026, with
graceful degradation: an older engine still opens the panel and places it, just without the
collision-aware flip.

The examples are organised by **layer**: the [class reference](#classes) is the standalone
**`@oriui/css`** layer, and the [Framework API](#framework-api) is the **`@oriui/vue`** component. Every
example is live — flip its code between **HTML** (the standalone classes, also your htmx / Astro / Svelte /
plain-HTML usage), **Vue**, and **Svelte** _(soon)_; HTML is the default.

## Classes

A popover is the `.ori-popover` surface class plus the shared `.ori-anchored` placement primitive (and
one placement modifier). There is no variant or color axis — the panel takes its surface from the shared
surface tokens.

<!-- prettier-ignore -->
:class-table{:rows='[{"class":"ori-popover","type":"Block","description":"The panel surface: sizing, padding, border, surface background + ori-shadow-lg. Composed with .ori-anchored for placement; requires the native popover attribute for top-layer + light-dismiss."},{"class":"ori-anchored","type":"Placement base","description":"Shared floating-panel placement primitive — position:fixed + position-anchor + collision flip. Add alongside the surface class."},{"class":"ori-anchored_top / _top-end","type":"Placement","description":"Above the trigger, aligned to its inline-start / inline-end edge."},{"class":"ori-anchored_bottom / _bottom-end","type":"Placement","description":"Below the trigger (the default), aligned to its inline-start / inline-end edge."},{"class":"ori-anchored_left / _right","type":"Placement","description":"To the inline-start / inline-end of the trigger, aligned to its block-start edge."},{"class":"--ori-anchored-gap","type":"Custom prop","description":"Gap between trigger and panel on the facing side. Default 0.25rem."},{"class":"--ori-anchor","type":"Custom prop","description":"The anchor-name linking the panel to its trigger; set per-instance by the component (or by you in plain HTML)."}]'}

## Basic

Open the popover and observe it track the trigger with no JS positioning — the panel is a `[popover]`
element placed via `anchor-name` / `position-anchor`. Click outside, or press `Esc`, to dismiss (both
native to the Popover API).

::example
:popover-demo

#vue

```vue
<OriPopover aria-labelledby="popover-title">
    <template #trigger="{ props }">
        <OriButton v-bind="props" text="Open popover" variant="tonal" />
    </template>
    <div style="padding: 0.35rem">
        <strong id="popover-title">Weave a popover</strong>
        <p>Positioned with CSS Anchor Positioning, toggled by the Popover API.</p>
    </div>
</OriPopover>
```

#html

```html
<!-- The trigger's popovertarget links it to the panel id; anchor-name / position-anchor tether them. -->
<button popovertarget="pop-1" style="anchor-name: --pop-1" aria-haspopup="dialog" aria-controls="pop-1">
    Open popover
</button>
<div
    id="pop-1"
    popover
    role="dialog"
    class="ori-popover ori-anchored ori-anchored_bottom"
    style="--ori-anchor: --pop-1"
    aria-labelledby="popover-title"
>
    <strong id="popover-title">Weave a popover</strong>
    <p>Positioned with CSS Anchor Positioning, toggled by the Popover API.</p>
</div>
```

::

## Placements

Six placements — `bottom` is the default. Each sets a `position-area` on the trigger's anchor grid plus
the gap margin on the facing side; `position-try-fallbacks` flips it on overflow.

::example
:popover-demo{placement="top"}
:popover-demo{placement="bottom"}
:popover-demo{placement="left"}
:popover-demo{placement="right"}

#vue

```vue
<OriPopover placement="top">
    <template #trigger="{ props }">
        <OriButton v-bind="props" text="top" variant="tonal" />
    </template>
    <p>Above the trigger.</p>
</OriPopover>
<OriPopover placement="bottom-end">
    <template #trigger="{ props }">
        <OriButton v-bind="props" text="bottom-end" variant="tonal" />
    </template>
    <p>Below, aligned to the trigger's end edge.</p>
</OriPopover>
```

#html

```html
<!-- swap the modifier: ori-anchored_top → _top-end / _bottom / _bottom-end / _left / _right -->
<div id="pop-2" popover role="dialog" class="ori-popover ori-anchored ori-anchored_top" style="--ori-anchor: --pop-2">
    <p>Above the trigger.</p>
</div>
```

::

## Common patterns

A filter panel opened from a toolbar button — a typical non-modal popover use case.

::example
:popover-demo{placement="bottom-end"}

#vue

```vue
<OriPopover placement="bottom-end" aria-labelledby="filters-title" role="dialog">
    <template #trigger="{ props }">
        <OriButton v-bind="props" text="Filters" icon="M10 18h4v-2h-4v2zM3 6v2h18V6H3zm3 7h12v-2H6v2z" variant="outline" />
    </template>
    <div style="display: flex; flex-direction: column; gap: 0.5rem; padding: 0.35rem; min-width: 12rem">
        <strong id="filters-title">Filters</strong>
        <OriCheckbox label="In stock only" />
        <OriCheckbox label="On sale" />
        <OriButton text="Apply" size="sm" />
    </div>
</OriPopover>
```

#html

```html
<button
    popovertarget="pop-filters"
    style="anchor-name: --pop-filters"
    aria-haspopup="dialog"
    aria-controls="pop-filters"
>
    Filters
</button>
<div
    id="pop-filters"
    popover
    role="dialog"
    class="ori-popover ori-anchored ori-anchored_bottom-end"
    style="--ori-anchor: --pop-filters"
    aria-labelledby="filters-title"
>
    <strong id="filters-title">Filters</strong>
    <!-- filter controls -->
</div>
```

::

## Accessibility

The accessibility contract holds across every layer — the standalone classes and the Vue component
render the same attributes. The interactive behaviour, however, comes from the platform: the Popover
API and CSS Anchor Positioning drive open/close and placement with no state to keep in sync.

- **The trigger MUST be a real `<button>`** (or a component that renders one, e.g. `OriButton`) — the
  Popover API's declarative `popovertarget` association only works from a button.
- **Give the panel an accessible name** with `aria-label` or `aria-labelledby` — undeclared attributes
  fall through to the panel (`inheritAttrs: false` + `v-bind="$attrs"`), so pass either directly on
  `<OriPopover>`.
- `role` defaults to `'dialog'` (a non-modal popup); pass `'menu'`, `'listbox'`, or another role that
  matches the panel's actual content.
- **The expanded state is unmanaged.** The Popover API opens and closes the panel entirely in the
  browser with no JS state to reflect, so there is no live `aria-expanded` to toggle. The `#trigger`
  slot's `props` bag instead conveys the popup relationship **statically**: `aria-haspopup` mirrors the
  panel's `role`, and `aria-controls` points at the panel's id.
- `Esc` and outside-click dismissal, and returning focus to the trigger, come from the platform via the
  Popover API — no focus-trap or dismiss handler to wire.

| Key      | Action                                                           |
| -------- | ---------------------------------------------------------------- |
| `Enter`  | Activates the trigger and opens the panel (native `<button>`).   |
| `Space`  | Activates the trigger and opens the panel (native `<button>`).   |
| `Escape` | Closes the panel and returns focus to the trigger (Popover API). |

## Framework API

The props, events, and slots of the **Vue** component. The standalone CSS layer has no component
API — its surface is the [classes](#classes) above, and you wire `popovertarget` / `anchor-name`
yourself. (Svelte bindings are planned.)

### Props

| Prop        | Type                                                                  | Default    | Description                                                                                        |
| ----------- | --------------------------------------------------------------------- | ---------- | -------------------------------------------------------------------------------------------------- |
| `placement` | `'top' \| 'top-end' \| 'bottom' \| 'bottom-end' \| 'left' \| 'right'` | `'bottom'` | Placement relative to the trigger. Drives the `ori-anchored_<placement>` modifier.                 |
| `role`      | `string`                                                              | `'dialog'` | ARIA role for the panel — `'dialog'` (default), `'menu'`, `'listbox'`, … per the content it holds. |

### Events & attributes

OriPopover declares **no custom emits** — open/close is owned by the platform (the Popover API), not
component state. It sets `inheritAttrs: false`; attributes placed on `<OriPopover>` (`aria-label`,
`aria-labelledby`, `id`, …) fall through to the panel `<div popover>`, not the trigger.

### Slots

| Slot      | Scope               | Description                                                                                                              |
| --------- | ------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| `trigger` | `{ props: object }` | The control that opens the panel. Spread `v-bind="props"` on your own `<button>` (or `OriButton`) — it must be a button. |
| `default` | —                   | Panel content, rendered inside the `[popover]` element.                                                                  |
