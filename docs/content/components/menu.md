---
title: Menu
---

# Menu

A WAI-ARIA menu button: a trigger opens a **roving-tabindex** action list. Unlike the Popover, open/close,
focus movement, and click-outside dismissal are driven entirely by the **`@oriui/headless` menu
machine** in JavaScript, not the Popover API — so the panel is not top-layer and carries a z-index. The
panel is still placed with the same **CSS Anchor Positioning** primitive as the Popover (`ori-anchored`),
zero positioning JS.

The examples are organised by **layer**: the [class reference](#classes) is the standalone
**`@oriui/css`** layer, and the [Framework API](#framework-api) is the **`@oriui/vue`** component. Every
example is live — flip its code between **HTML** (the standalone classes, also your htmx / Astro / Svelte /
plain-HTML usage), **Vue**, and **Svelte** _(soon)_; HTML is the default.

## Classes

A menu is the `.ori-menu` surface class plus the shared `.ori-anchored` placement primitive (and one
placement modifier); items are `.ori-menu__item`. The `.ori-anchored*` classes are the same primitive
documented on the [Popover page](/components/popover#classes) — placement, the collision flip, and the
`--ori-anchor` / `--ori-anchored-gap` custom props are shared, not duplicated here.

<!-- prettier-ignore -->
:class-table{:rows='[{"class":"ori-menu","type":"Block","description":"The panel surface: sizing, padding, border, surface background + ori-shadow-lg + a z-index (not top-layer, unlike Popover). Composed with .ori-anchored for placement."},{"class":"ori-anchored / ori-anchored_*","type":"Placement base","description":"Shared floating-panel placement primitive — see the Popover class reference for the full modifier list."},{"class":"ori-menu__item","type":"Part","description":"One action row (role=menuitem). Highlight follows roving focus / pointer hover via [data-highlighted]."},{"class":"aria-disabled / data-highlighted","type":"State","description":"real attributes, not classes — a disabled item is skipped by roving navigation."}]'}

## Basic

Open the menu and use the Arrow keys — focus moves between items with **roving tabindex** (one item is
`tabindex=0` at a time), not `aria-activedescendant`. Click an item, or press `Enter`/`Space` on the
highlighted one, to select and close.

::example
:menu-demo

#vue

```vue
<OriMenu
    :items="[
        { value: 'new', label: 'New file' },
        { value: 'open', label: 'Open…' },
        { value: 'delete', label: 'Delete' }
    ]"
    @select="onSelect"
>
    <template #trigger="{ props }">
        <OriButton v-bind="props" text="Actions" variant="tonal" />
    </template>
</OriMenu>
```

#html

```html
<!-- Structure only — the JS engine (roving tabindex, open/close, click-outside) is not shown here. -->
<button
    id="menu-1-trigger"
    type="button"
    style="anchor-name: --menu-1"
    aria-haspopup="menu"
    aria-controls="menu-1"
    aria-expanded="false"
>
    Actions
</button>
<div
    id="menu-1"
    role="menu"
    tabindex="-1"
    class="ori-menu ori-anchored ori-anchored_bottom-start"
    style="--ori-anchor: --menu-1"
    aria-labelledby="menu-1-trigger"
    hidden
>
    <div role="menuitem" tabindex="-1" class="ori-menu__item">New file</div>
    <div role="menuitem" tabindex="-1" class="ori-menu__item">Open…</div>
    <div role="menuitem" tabindex="-1" class="ori-menu__item">Delete</div>
</div>
```

::

## Placements

Twelve placements — `bottom-start` is the default. A bare side (`top` / `bottom` / `left` / `right`)
centers on the cross axis; `-start` / `-end` align to the trigger's start / end edge (logical,
RTL-aware). Same placement classes and collision-flip logic as the Popover, since both compose
`.ori-anchored`.

::example
:menu-demo{placement="top"}
:menu-demo{placement="bottom"}
:menu-demo{placement="right"}

#vue

```vue
<OriMenu :items="items" placement="top" @select="onSelect">
    <template #trigger="{ props }">
        <OriButton v-bind="props" text="top" variant="tonal" />
    </template>
</OriMenu>
<OriMenu :items="items" placement="right" @select="onSelect">
    <template #trigger="{ props }">
        <OriButton v-bind="props" text="right" variant="tonal" />
    </template>
</OriMenu>
```

#html

```html
<!-- swap the modifier: ori-anchored_top / _top-start / _top-end / _bottom / _bottom-start / _bottom-end / _left / _left-start / _left-end / _right / _right-start / _right-end -->
<div
    id="menu-2"
    role="menu"
    tabindex="-1"
    class="ori-menu ori-anchored ori-anchored_top"
    style="--ori-anchor: --menu-2"
    hidden
>
    <div role="menuitem" tabindex="-1" class="ori-menu__item">New file</div>
</div>
```

::

## Disabled item

A disabled item is `aria-disabled`, styled dimmed, and skipped by roving navigation and typeahead — it
can't be highlighted or selected.

::example
:menu-demo

#vue

```vue
<OriMenu
    :items="[
        { value: 'new', label: 'New file' },
        { value: 'rename', label: 'Rename', disabled: true },
        { value: 'delete', label: 'Delete' }
    ]"
    @select="onSelect"
>
    <template #trigger="{ props }">
        <OriButton v-bind="props" text="Actions" variant="tonal" />
    </template>
</OriMenu>
```

#html

```html
<div role="menuitem" tabindex="-1" class="ori-menu__item" aria-disabled="true">Rename</div>
```

::

## Custom item content

Override the `#item` slot for icons, shortcuts, or any richer row content — the default renders
`label ?? value`.

::example
:menu-demo

#vue

```vue
<OriMenu :items="items" @select="onSelect">
    <template #trigger="{ props }">
        <OriButton v-bind="props" text="Actions" variant="tonal" />
    </template>
    <template #item="{ item }">
        <span style="display: flex; justify-content: space-between; width: 100%">
            <span>{{ item.label }}</span>
            <span style="opacity: 0.6; font-size: 0.85em" aria-hidden="true">⌘K</span>
        </span>
    </template>
</OriMenu>
```

::

## Common patterns

A toolbar "more actions" button — a typical menu-button use case.

::example
:menu-demo{placement="bottom-end"}

#vue

```vue
<OriMenu
    :items="[
        { value: 'edit', label: 'Edit' },
        { value: 'duplicate', label: 'Duplicate' },
        { value: 'archive', label: 'Archive' },
        { value: 'delete', label: 'Delete' }
    ]"
    placement="bottom-end"
    @select="onAction"
>
    <template #trigger="{ props }">
        <OriButton v-bind="props" icon="M12 8a2 2 0 100-4 2 2 0 000 4zm0 6a2 2 0 100-4 2 2 0 000 4zm0 6a2 2 0 100-4 2 2 0 000 4z" aria-label="More actions" variant="text" />
    </template>
</OriMenu>
```

#html

```html
<!-- Structure only — see Basic above for the full markup shape. -->
<button
    id="menu-more-trigger"
    type="button"
    style="anchor-name: --menu-more"
    aria-haspopup="menu"
    aria-controls="menu-more"
    aria-expanded="false"
    aria-label="More actions"
>
    ⋮
</button>
```

::

## Accessibility

The accessibility contract holds across every layer — the standalone classes and the Vue component
render the same attributes. Unlike the Popover, the interactive behaviour here is **not** free from the
platform: open/close, focus movement, and dismissal are driven by the `@oriui/headless` menu machine in
JavaScript.

- **The trigger MUST be a real `<button>`** (or a component that renders one, e.g. `OriButton`) and
  needs an accessible name (visible text or `aria-label`).
- The trigger carries `aria-haspopup="menu"`, `aria-controls` pointing at the panel id, and a live
  `aria-expanded` that tracks open state (unlike Popover, this one **is** managed — the engine owns
  `open`, not the platform).
- The panel is `role="menu"`, `aria-labelledby` the trigger, and `aria-orientation="vertical"`. Items
  are `role="menuitem"`.
- **Roving tabindex**: exactly one item (the highlighted one) is `tabindex="0"`; the rest are
  `tabindex="-1"`. Real DOM focus moves to the highlighted item as you navigate — there is no
  `aria-activedescendant`.
- A disabled item is `aria-disabled="true"` and is skipped by Arrow/Home/End navigation and selection.
- Selecting an item (click, or `Enter`/`Space` while highlighted) fires `select` and closes the menu,
  returning focus to the trigger. `Escape`, `Tab`, and an outside click also close it and return focus.

| Key                            | Action                                                           |
| ------------------------------ | ---------------------------------------------------------------- |
| `Enter` / `Space` (on trigger) | Opens the menu and highlights the first item.                    |
| `↓` (on trigger)               | Opens the menu and highlights the first item.                    |
| `↑` (on trigger)               | Opens the menu and highlights the last item.                     |
| `↓` / `↑`                      | Moves the highlight to the next / previous enabled item (wraps). |
| `Home` / `End`                 | Highlights the first / last enabled item.                        |
| `Enter` / `Space` (on item)    | Activates the highlighted item — fires `select`, then closes.    |
| `Escape`                       | Closes the menu and returns focus to the trigger.                |
| `Tab`                          | Closes the menu and moves focus onward (does not trap focus).    |
| Outside click                  | Closes the menu and returns focus to the trigger.                |

## Framework API

The props, events, and slots of the **Vue** component. The standalone CSS layer has no component
API — its surface is the [classes](#classes) above; the roving-tabindex keyboard and open/close
behaviour is JavaScript you'd need to author yourself, or get from [`useMenu`](/headless/core) in
`@oriui/headless/vue`. (Svelte bindings are planned.)

### Props

| Prop        | Type                                                                   | Default          | Description                                                                        |
| ----------- | ---------------------------------------------------------------------- | ---------------- | ---------------------------------------------------------------------------------- |
| `items`     | `MenuItem[]`                                                           | **required**     | `{ value: string; label?: string; disabled?: boolean }[]`, in render order.        |
| `disabled`  | `boolean`                                                              | `false`          | Disables the trigger and blocks opening the menu.                                  |
| `placement` | `'top' \| 'bottom' \| 'left' \| 'right'` (each also `-start` / `-end`) | `'bottom-start'` | Placement relative to the trigger. Drives the `ori-anchored_<placement>` modifier. |

### Events & attributes

| Event    | Payload  | Fired when                                                                                                                          |
| -------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `select` | `string` | An item is activated (click, or `Enter`/`Space` on the highlighted item) — carries the item's `value`. The menu closes right after. |

It sets `inheritAttrs: false`; attributes placed on `<OriMenu>` fall through to the panel element, not
the trigger.

### Slots

| Slot      | Scope                | Description                                                                                                             |
| --------- | -------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `trigger` | `{ props: object }`  | The control that opens the menu. Spread `v-bind="props"` on your own `<button>` (or `OriButton`) — it must be a button. |
| `item`    | `{ item: MenuItem }` | Replaces one item's content. Falls back to `item.label ?? item.value` when omitted.                                     |

There is no default slot — menu content is driven entirely by `items` + the `#item` slot.
