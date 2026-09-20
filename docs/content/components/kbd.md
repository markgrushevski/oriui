---
title: Kbd
---

# Kbd

A keyboard-key chip — a semantic `<kbd>` element styled as a monospace bordered chip. Use it to
represent individual keys, modifier keys, or multi-key shortcuts inline in prose or UI hints.

The examples are organised by **layer**: the [class reference](#classes) is the standalone
**`@oriui/css`** layer, and the [Framework API](#framework-api) is the **`@oriui/vue`** component. Every
example is live — flip its code between **HTML** (the standalone classes, also your htmx / Astro / Svelte /
plain-HTML usage), **Vue**; HTML is the default.

## Classes

A kbd chip is a single block class. There are no size, color, or variant utilities — the chip
inherits its color from the surrounding text and its radius from the baked `sm` default.

<!-- prettier-ignore -->
:class-table{:rows='[{"class":"ori-kbd","type":"Block","description":"Required base class. Renders as an inline-flex monospace chip with a bottom-heavy border and sm radius baked in."}]'}

**À la carte:** the classes above ship in `@oriui/css/components/kbd.css`. Import a foundation
(`@oriui/css/base.css` or `@oriui/css/tokens.css`) first — the token utilities (`ori-color_*`,
`ori-size-radius_*`, …) live there, not in the component file. The full bundle `@oriui/css` is the default and
already carries both; see [à-la-carte imports](/guides/css).

## Single key

Pass the key label via the `label` prop or the default slot.

::example
:ori-kbd{label="Esc"}
:ori-kbd{label="Enter"}
:ori-kbd{label="Tab"}
:ori-kbd{label="Space"}

#vue

```vue
<OriKbd label="Esc" />
<OriKbd label="Enter" />
<OriKbd label="Tab" />
<OriKbd label="Space" />
```

#html

```html
<kbd class="ori-kbd">Esc</kbd>
<kbd class="ori-kbd">Enter</kbd>
<kbd class="ori-kbd">Tab</kbd>
<kbd class="ori-kbd">Space</kbd>
```

::

## Shortcut combo

Compose multiple chips to represent a keyboard shortcut. Separate them with a literal `+` in
between.

::example
:ori-kbd{label="Ctrl"} + :ori-kbd{label="K"}

#vue

```vue
<OriKbd label="Ctrl" />
+
<OriKbd label="K" />
```

#html

```html
<kbd class="ori-kbd">Ctrl</kbd> + <kbd class="ori-kbd">K</kbd>
```

::

::example
:ori-kbd{label="Ctrl"} + :ori-kbd{label="Shift"} + :ori-kbd{label="P"}

#vue

```vue
<OriKbd label="Ctrl" />
+
<OriKbd label="Shift" />
+
<OriKbd label="P" />
```

#html

```html
<kbd class="ori-kbd">Ctrl</kbd> + <kbd class="ori-kbd">Shift</kbd> + <kbd class="ori-kbd">P</kbd>
```

::

## Inline in text

The chip is `inline-flex` and tracks the surrounding font size, so it flows naturally inside a
sentence or tooltip hint.

::example
Press :ori-kbd{label="Esc"} to close the dialog.

#vue

```vue
<p>Press <OriKbd label="Esc" /> to close the dialog.</p>
```

#html

```html
<p>Press <kbd class="ori-kbd">Esc</kbd> to close the dialog.</p>
```

::

## Via slot

When the key label is dynamic or needs rich content, use the default slot instead of the `label`
prop. The slot replaces the prop — if both are supplied the slot wins.

::example
:ori-kbd{label="⌘"}
:ori-kbd{label="⇧"}
:ori-kbd{label="⌥"}

#vue

```vue
<!-- slot form — useful when the label is dynamic -->
<OriKbd>⌘</OriKbd>
<OriKbd>⇧</OriKbd>
<OriKbd>⌥</OriKbd>
```

#html

```html
<kbd class="ori-kbd">⌘</kbd>
<kbd class="ori-kbd">⇧</kbd>
<kbd class="ori-kbd">⌥</kbd>
```

::

## Common patterns

### Command palette hint

A two-column shortcut list — the pattern used in command palettes and help overlays.

::example
:ori-kbd{label="Ctrl"} + :ori-kbd{label="K"} opens the command palette.

:ori-kbd{label="Ctrl"} + :ori-kbd{label="/"} toggles comments.

:ori-kbd{label="Ctrl"} + :ori-kbd{label="S"} saves the file.

#vue

```vue
<p><OriKbd label="Ctrl" /> + <OriKbd label="K" /> opens the command palette.</p>
<p><OriKbd label="Ctrl" /> + <OriKbd label="/" /> toggles comments.</p>
<p><OriKbd label="Ctrl" /> + <OriKbd label="S" /> saves the file.</p>
```

#html

```html
<p><kbd class="ori-kbd">Ctrl</kbd> + <kbd class="ori-kbd">K</kbd> opens the command palette.</p>
<p><kbd class="ori-kbd">Ctrl</kbd> + <kbd class="ori-kbd">/</kbd> toggles comments.</p>
<p><kbd class="ori-kbd">Ctrl</kbd> + <kbd class="ori-kbd">S</kbd> saves the file.</p>
```

::

## Accessibility

The accessibility contract holds across every layer — the standalone classes and the Vue component
render the same markup.

- Renders a real `<kbd>` element by default. The `<kbd>` element is the correct semantic choice for
  keyboard input and is recognized by assistive technology as user input / a key name.
- The chip is purely presentational — it carries no `role`, `tabindex`, or ARIA attributes of its
  own. The surrounding text provides context.
- When representing a multi-key shortcut, each key gets its own `<kbd>` element — this is the
  pattern specified by the HTML spec for chords.
- No keyboard interaction is defined; the chip is not interactive.

## Framework API

The props, events, and slots of the **Vue** component. The standalone CSS layer has no component
API — its surface is the [classes](#classes) above. (Svelte bindings are planned.)

### Props

| Prop    | Type               | Default | Description                                                                                     |
| ------- | ------------------ | ------- | ----------------------------------------------------------------------------------------------- |
| `as`    | `string \| object` | `'kbd'` | HTML tag name or component to render. Override only when wrapping a non-`<kbd>` element.        |
| `label` | `string`           | —       | Key label. Fallback content for the default slot — if the slot is provided it takes precedence. |

### Events & attributes

OriKbd declares **no custom events** and does not set `inheritAttrs: false`, so native attributes
(`class`, `style`, `id`, `data-*`, event listeners, …) fall through to the rendered element.

### Slots

| Slot      | Description                                                                         |
| --------- | ----------------------------------------------------------------------------------- |
| `default` | Key label. When provided, replaces the `label` prop. Accepts text or inline markup. |
