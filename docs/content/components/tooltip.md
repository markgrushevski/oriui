---
title: Tooltip
---

# Tooltip

A CSS-driven tooltip that shows additional context when a control is focused or hovered. The bubble
is always in the DOM (so the `aria-describedby` reference is never dangling) and shown/hidden
entirely in CSS — no JS state machine, no positioning engine. Show is pure `:focus-within` (keyboard)
and `:hover` wrapped in `@media (hover: hover)` (pointer, without sticking open on touch).

Every example is live and shows the standalone **HTML / `@oriui/css`** markup by default — the same
classes you'd use in htmx, Astro, Svelte, or plain HTML. Flip any example to **Vue** for the styled
component.

## Classes

A tooltip is a wrapper block plus a bubble element. There are no variant or size utilities — the
bubble adapts to its content, and placement is a single modifier class.

:class-table{:rows='[{"class":"ori-tooltip","type":"Block","description":"Wrapper: inline-flex, position:relative. Defines local tokens (--ori-tooltip-bg, --ori-tooltip-color, --ori-tooltip-gap, --ori-tooltip-arrow). Carries ori-color + ori-color_* on the wrapper only when the color prop is set."},{"class":"ori-tooltip__trigger","type":"Part","description":"Inline-flex wrapper around the trigger slot; carries aria-describedby referencing the bubble id."},{"class":"ori-tooltip__bubble","type":"Part","description":"The tooltip surface, role=tooltip. Always in the DOM but visibility:hidden + opacity:0 + pointer-events:none until shown. Background var(--ori-tooltip-bg), shadow var(--ori-shadow-md), radius var(--ori-size-radius_sm). Arrow via ::after."},{"class":"ori-tooltip__bubble_top","type":"Placement","description":"Positions the bubble above the trigger (default), arrow pointing down."},{"class":"ori-tooltip__bubble_bottom","type":"Placement","description":"Positions the bubble below the trigger, arrow pointing up."},{"class":"ori-tooltip__bubble_left","type":"Placement","description":"Positions the bubble to the inline-start of the trigger, arrow pointing right."},{"class":"ori-tooltip__bubble_right","type":"Placement","description":"Positions the bubble to the inline-end of the trigger, arrow pointing left."},{"class":"ori-color ori-color_*","type":"Color","description":"Applied on the wrapper when color is set; repoints --ori-color / --ori-color-on for the bubble fill + contrast text. Omit for the default neutral inverse chip (dark in light mode)."}]'}

## Placements

Four static placements — `top` is the default. There is no collision-aware flip; if the viewport
clips the bubble, use a different placement manually.

::example
:ori-tooltip{content="Above the trigger" placement="top"}
:ori-tooltip{content="Below the trigger" placement="bottom"}
:ori-tooltip{content="Left of trigger" placement="left"}
:ori-tooltip{content="Right of trigger" placement="right"}

#vue

```vue
<OriTooltip content="Above the trigger" placement="top">
    <button>top</button>
</OriTooltip>
<OriTooltip content="Below the trigger" placement="bottom">
    <button>bottom</button>
</OriTooltip>
<OriTooltip content="Left of trigger" placement="left">
    <button>left</button>
</OriTooltip>
<OriTooltip content="Right of trigger" placement="right">
    <button>right</button>
</OriTooltip>
```

#html

```html
<!-- top (default) -->
<span class="ori-tooltip">
    <span class="ori-tooltip__trigger" aria-describedby="tip-1">
        <button>top</button>
    </span>
    <span id="tip-1" class="ori-tooltip__bubble ori-tooltip__bubble_top" role="tooltip"> Above the trigger </span>
</span>

<!-- swap the modifier: ori-tooltip__bubble_top → _bottom / _left / _right -->
```

::

## Colors

Omit `color` for the default neutral inverse chip (dark in light mode). Pass any semantic color to
tint the bubble with the matching role palette.

::example
:ori-tooltip{content="Default neutral" placement="bottom"}
:ori-tooltip{content="Primary" color="primary" placement="bottom"}
:ori-tooltip{content="Danger" color="danger" placement="bottom"}
:ori-tooltip{content="Success" color="success" placement="bottom"}
:ori-tooltip{content="Info" color="info" placement="bottom"}
:ori-tooltip{content="Warn" color="warn" placement="bottom"}

#vue

```vue
<!-- default (neutral inverse chip) -->
<OriTooltip content="Default neutral" placement="bottom">
    <button>default</button>
</OriTooltip>

<!-- semantic colors -->
<OriTooltip content="Primary" color="primary" placement="bottom">
    <button>primary</button>
</OriTooltip>
<OriTooltip content="Danger" color="danger" placement="bottom">
    <button>danger</button>
</OriTooltip>
```

#html

```html
<!-- default — no color class -->
<span class="ori-tooltip">
    <span class="ori-tooltip__trigger" aria-describedby="tip-2"><button>default</button></span>
    <span id="tip-2" class="ori-tooltip__bubble ori-tooltip__bubble_bottom" role="tooltip">Default neutral</span>
</span>

<!-- colored — add ori-color + ori-color_<role> on the wrapper -->
<span class="ori-tooltip ori-color ori-color_danger">
    <span class="ori-tooltip__trigger" aria-describedby="tip-3"><button>danger</button></span>
    <span id="tip-3" class="ori-tooltip__bubble ori-tooltip__bubble_bottom" role="tooltip">Danger</span>
</span>
```

::

## Rich content

When plain text is not enough, use the `#content` slot instead of the `content` prop. Slot content
takes precedence over the prop.

::example
:ori-tooltip{placement="bottom"}

#vue

```vue
<OriTooltip placement="bottom">
    <button>hover me</button>
    <template #content>
        Keyboard shortcut: <kbd>Ctrl</kbd> + <kbd>S</kbd>
    </template>
</OriTooltip>
```

#html

```html
<span class="ori-tooltip">
    <span class="ori-tooltip__trigger" aria-describedby="tip-4">
        <button>hover me</button>
    </span>
    <span id="tip-4" class="ori-tooltip__bubble ori-tooltip__bubble_bottom" role="tooltip">
        Keyboard shortcut: <kbd>Ctrl</kbd> + <kbd>S</kbd>
    </span>
</span>
```

::

## With icon-only button

A common pattern: supplement an icon-only button with a tooltip so the action is discoverable via
keyboard focus.

::example
:ori-tooltip{content="Add item" placement="right"}

#vue

```vue
<OriTooltip content="Add item" placement="right">
    <OriButton icon="M11 13H5v-2h6V5h2v6h6v2h-6v6h-2z" aria-label="Add item" variant="tonal" />
</OriTooltip>
```

#html

```html
<span class="ori-tooltip">
    <span class="ori-tooltip__trigger" aria-describedby="tip-5">
        <button
            class="ori-button ori-button_icon ori-variant ori-variant_tonal ori-color ori-color_primary"
            aria-label="Add item"
        >
            <i class="ori-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24"><path d="M11 13H5v-2h6V5h2v6h6v2h-6v6h-2z" /></svg>
            </i>
        </button>
    </span>
    <span id="tip-5" class="ori-tooltip__bubble ori-tooltip__bubble_right" role="tooltip"> Add item </span>
</span>
```

::

## Real-world recipe — toolbar with tooltips

Three icon buttons in a toolbar, each with a labeled tooltip — a typical editor or action-bar
pattern.

::example
:ori-tooltip{content="Bold (Ctrl+B)" placement="bottom"}
:ori-tooltip{content="Italic (Ctrl+I)" placement="bottom"}
:ori-tooltip{content="Underline (Ctrl+U)" placement="bottom"}

#vue

```vue
<div style="display: flex; gap: 0.25rem" role="toolbar" aria-label="Text formatting">
    <OriTooltip content="Bold (Ctrl+B)" placement="bottom">
        <OriButton icon="M15.6 10.79c.97-.67 1.65-1.77 1.65-2.79 0-2.26-1.75-4-4-4H7v14h7.04c2.09 0 3.71-1.7 3.71-3.79 0-1.52-.86-2.82-2.15-3.42zM10 6.5h3c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5h-3v-3zm3.5 9H10v-3h3.5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5z" aria-label="Bold" variant="plain" />
    </OriTooltip>
    <OriTooltip content="Italic (Ctrl+I)" placement="bottom">
        <OriButton icon="M10 4v3h2.21l-3.42 8H6v3h8v-3h-2.21l3.42-8H18V4h-8z" aria-label="Italic" variant="plain" />
    </OriTooltip>
    <OriTooltip content="Underline (Ctrl+U)" placement="bottom">
        <OriButton icon="M12 17c3.31 0 6-2.69 6-6V3h-2.5v8c0 1.93-1.57 3.5-3.5 3.5S8.5 12.93 8.5 11V3H6v8c0 3.31 2.69 6 6 6zm-7 2v2h14v-2H5z" aria-label="Underline" variant="plain" />
    </OriTooltip>
</div>
```

#html

```html
<div style="display: flex; gap: 0.25rem" role="toolbar" aria-label="Text formatting">
    <span class="ori-tooltip">
        <span class="ori-tooltip__trigger" aria-describedby="tip-bold">
            <button class="ori-button ori-button_icon ori-variant ori-variant_plain …" aria-label="Bold">
                <!-- bold icon -->
            </button>
        </span>
        <span id="tip-bold" class="ori-tooltip__bubble ori-tooltip__bubble_bottom" role="tooltip"> Bold (Ctrl+B) </span>
    </span>
    <!-- repeat for Italic, Underline -->
</div>
```

::

## Limitations

OriTooltip is a CSS-only implementation. The following features would require JavaScript and are
out of scope for this component:

- **Esc-to-dismiss** — the CSS model dismisses on blur / pointer-leave only.
- **Collision-aware repositioning** — placement is static; if the bubble clips the viewport, change
  `placement` manually.
- **Show/hide delay** — no hover-intent debounce; the bubble appears immediately on hover/focus.

## Accessibility

The accessibility contract holds across every layer — the standalone classes and the Vue component
render the same attributes.

- The bubble has `role="tooltip"` and a `useId()`-generated id; the trigger wrapper
  (`.ori-tooltip__trigger`) carries `aria-describedby` pointing at it, so the tooltip text is
  announced by screen readers when the focusable control inside gains focus.
- The bubble stays in the DOM permanently (not `v-if`) so the `aria-describedby` reference is never
  dangling — a pointed-at id that does not exist in the DOM is ignored by assistive technology.
- The trigger's native `:focus-visible` ring is not overridden — the real control inside keeps its
  own focus indicator.
- The decorative arrow is a `::after` pseudo-element — invisible to assistive technology, no
  `aria-hidden` needed.
- Color is applied only on the wrapper, not on the bubble directly, so the `ori-color_*` utility
  is never shadowed (a NOTES.md gotcha confirmed for OriProgress and OriTooltip alike).

> **Design / a11y trade-off:** `aria-describedby` sits on the `.ori-tooltip__trigger` wrapper span
> (not the inner control), because the slot content is arbitrary and cannot be augmented without JS.
> This is the standard CSS-only tooltip association and is announced on `:focus-within`. A consumer
> wanting the attribute directly on the inner control can pass their own `aria-describedby` to that
> element.

| Key         | Action                                                        |
| ----------- | ------------------------------------------------------------- |
| `Tab`       | Focuses the trigger control; shows the tooltip.               |
| `Shift+Tab` | Blurs the trigger control; hides the tooltip.                 |
| `Escape`    | Not supported (CSS-only model — blur the trigger to hide it). |

## Framework API

The props, events, slots, and polymorphism of the **Vue** component. The standalone CSS layer has no
component API — its surface is the [classes](#classes) above. (Svelte bindings are planned.)

### Props

| Prop        | Type                                     | Default | Description                                                                                                                                                                      |
| ----------- | ---------------------------------------- | ------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `color`     | `ThemeColor`                             | —       | Bubble fill color. Adds the `ori-color` utility on the wrapper, repointing `--ori-color` / `--ori-color-on`. Omit for the default neutral inverse chip (dark in light mode).     |
| `content`   | `string`                                 | —       | Tooltip text. For rich content use the `#content` slot instead — it takes precedence over this prop.                                                                             |
| `placement` | `'top' \| 'bottom' \| 'left' \| 'right'` | `'top'` | Static placement of the bubble relative to the trigger. Drives the `ori-tooltip__bubble_<placement>` modifier. No collision flip or repositioning (that would need a JS helper). |

### Events & attributes

OriTooltip declares **no custom emits**. It does not set `inheritAttrs: false`, so attributes placed
directly on `<OriTooltip>` fall through to the root `<span class="ori-tooltip">` wrapper.

### Slots

| Slot      | Scope | Description                                                                                                                                                                                                 |
| --------- | ----- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `default` | —     | The trigger. Rendered inside `.ori-tooltip__trigger`, which carries `aria-describedby`. Should contain a real focusable control (button or link) so keyboard focus reveals the tooltip via `:focus-within`. |
| `content` | —     | Rich tooltip content. Overrides the `content` prop when provided. Use for markup beyond plain text (e.g. `<kbd>`).                                                                                          |
