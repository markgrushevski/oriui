---
title: Color picker
---

# Color picker

An accessible color picker: a 2D **saturation × brightness** area, a **hue** slider, a **hex** field, and
optional **preset** swatches — an inline panel you compose into an [OriPopover](/components/popover) for a
swatch-triggered flow. Behaviour lives in the framework-agnostic `useColorPicker` (a zero-dependency sRGB +
2D-area engine, no adapter or machine); the styled component reuses [OriSlider](/components/slider) for the
hue channel and [OriInput](/components/input) for the hex field. `v-model` carries a lowercase color
**string**; the internal working model is HSVA, so the hue survives when you drag into a corner and back.

The 2D area is built from **two visually-hidden native `<input type="range">`** — one per axis — so the
browser supplies `role="slider"`, focus, and value announcements; the area's keydown routes the arrows in
2D. See [Accessibility](#accessibility).

## Classes

The panel is a block wrapper plus BEM parts. The swatch and each preset read an inline `--ori-color`
(an arbitrary color, not a `ori-color_*` role token); the area reads an inline `--ori-hue`.

<!-- prettier-ignore -->
:class-table{:rows='[{"class":"ori-color-picker","type":"Block","description":"Required base class (wrapper). Fixed width via <code>--ori-color-picker-size</code> (15rem)."},{"class":"ori-color-picker__area","type":"Part","description":"The 2D saturation×brightness surface; reads the inline <code>--ori-hue</code> gradient base."},{"class":"ori-color-picker__area-thumb","type":"Part","description":"The area indicator, positioned by inline <code>left</code> / <code>top</code>."},{"class":"ori-color-picker__channel","type":"Part","description":"The two visually-hidden <code>&lt;input type=range&gt;</code> (saturation, brightness) — the a11y surface."},{"class":"ori-color-picker__controls","type":"Part","description":"Flex row: the preview swatch, the hue (and optional alpha) slider, and the optional eyedropper button."},{"class":"ori-color-picker__sliders","type":"Part","description":"Column holding the hue slider and, when <code>alpha</code> is set, the alpha slider."},{"class":"ori-color-picker__swatch","type":"Part","description":"Current-color preview; reads inline <code>--ori-color</code> (background) and <code>--ori-ink</code> (readable content color)."},{"class":"ori-color-picker__swatch_alpha","type":"Modifier","description":"On the swatch when <code>alpha</code> is set — adds the transparency checkerboard behind the (semi-transparent) current color."},{"class":"ori-color-picker__hex","type":"Part","description":"The hex OriInput field."},{"class":"ori-color-picker__eyedropper","type":"Part","description":"The eyedropper OriButton — shown only when <code>eyedropper</code> is set and the browser supports the EyeDropper API."},{"class":"ori-color-picker__presets","type":"Part","description":"A single-select roving listbox of preset swatches."},{"class":"ori-color-picker__preset","type":"Part","description":"A preset chip (button); reads inline <code>--ori-color</code>. Selected via <code>aria-selected</code>."},{"class":"ori-slider_hue","type":"Modifier","description":"On the hue OriSlider — repaints the track as the full spectrum."},{"class":"ori-slider_alpha","type":"Modifier","description":"On the alpha OriSlider — a transparent→color gradient over a checkerboard (transparency grid)."},{"class":"data-disabled","type":"State","description":"Set on the wrapper when <code>disabled</code>; dims the panel and blocks pointer events."}]'}

## Live demo

Drag inside the area, move the hue slider, type a hex, or pick a preset. Each control drives the same
color; `v-model` is the lowercase hex string.

::example
:ori-color-picker{model-value="#3366ff" label="Brand color" :presets='["#ef4444", "#f59e0b", "#10b981", "#3b82f6", "#8b5cf6", "#111827"]'}

#vue

```vue
<script setup>
import { ref } from 'vue';
const color = ref('#3366ff');
const palette = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#111827'];
</script>

<template>
    <OriColorPicker v-model="color" label="Brand color" :presets="palette" />
</template>
```

::

## In a popover (swatch trigger)

The panel is open-state-agnostic — drop it inside [OriPopover](/components/popover) and reuse its
`#trigger`. This is the fill/stroke-color pattern for a toolbar.

```vue
<script setup>
import { ref } from 'vue';
const color = ref('#3366ff');
</script>

<template>
    <OriPopover>
        <template #trigger>
            <button
                type="button"
                aria-label="Stroke color"
                :style="{ background: color, width: '1.5rem', height: '1.5rem', borderRadius: '50%' }"
            />
        </template>
        <OriColorPicker v-model="color" label="Stroke color" />
    </OriPopover>
</template>
```

## Output format

`format` selects the emitted string; the default is `hex`. `rgb` and `hsl` emit function notation. All
output is **lowercase** (a common validator constraint).

::example
:ori-color-picker{model-value="#10b981" label="hex (default)"}
:ori-color-picker{model-value="rgb(16, 185, 129)" format="rgb" label="rgb"}

#vue

```vue
<OriColorPicker v-model="a" format="hex" />
<OriColorPicker v-model="b" format="rgb" />
<OriColorPicker v-model="c" format="hsl" />
```

::

## Alpha (transparency)

`alpha` adds an alpha channel — a checkerboard slider and a swatch that shows the transparency, plus
`#rrggbbaa` output (or `rgba()` / `hsla()` per `format`). The picker also parses 8-digit hex / `rgba()`
input, so `v-model` round-trips transparency.

::example
:ori-color-picker{model-value="#3366ff80" :alpha="true" label="Fill color"}

#vue

```vue
<!-- color round-trips as e.g. "#3366ff80" -->
<OriColorPicker v-model="color" :alpha="true" label="Fill color" />
```

::

## Eyedropper

`eyedropper` shows a pick-from-screen trigger built on the
[EyeDropper API](https://developer.mozilla.org/en-US/docs/Web/API/EyeDropper). It is **feature-detected** —
the trigger is hidden where the browser lacks it (currently Chromium-only), so it is never a dead button.
A picked color keeps the current alpha.

::example
:ori-color-picker{model-value="#3366ff" :eyedropper="true" label="Brand color"}

#vue

```vue
<OriColorPicker v-model="color" :eyedropper="true" label="Brand color" />
```

::

## Commit on release

Like [OriSlider](/components/slider#commit-on-release), `update:modelValue` streams the color **live** on
every interaction tick (drag, arrow, hue move), while `change` fires **once** on release / keyboard
settle — so a whole drag records a single undo entry. Bind `v-model` for the live value and `@change` for
the commit.

```vue
<template>
    <!-- v-model tracks the live color; @change commits the settled value (one undo entry) -->
    <OriColorPicker v-model="color" label="Fill" @change="pushUndo" />
</template>
```

## Form submission

Set `name` to submit the picker in a native form: it renders a hidden input carrying the current color, so
the picker joins form submission like `<input type="color">`. Unlike a [combobox](/components/combobox), a
color control has **no empty state** — it always submits a color (its current one, default black), even
before the user interacts. The submitted string uses the emitted [`format`](#output-format); a disabled
picker is excluded from submission (matching a native disabled control). Pass `form` to associate the
hidden input with a `<form>` by id when the picker sits outside it.

```vue
<template>
    <form>
        <OriColorPicker v-model="color" name="brand" label="Brand color" />
    </form>
</template>
```

## Accessibility

- The 2D area is **two visually-hidden native `<input type="range">`** (saturation, brightness), each a
  real `role="slider"` with its own `aria-label` and `aria-valuetext` (`"60%"`) — focusable, announced,
  and form-associable, with no hand-rolled slider ARIA. The area's keydown routes the arrow keys across
  the two axes (a single native range can't span both).
- The hue slider is an `OriSlider` (a native range → `role="slider"` + the full keyboard contract). The
  hex field is an `OriInput` — a bad or partial hex flips it to `aria-invalid` and is rejected on commit.
- The preview swatch is `role="img"` named by the current color; presets are a single-select `role="listbox"`
  with roving tabindex (one tab stop; `aria-selected` marks the active color).
- `label` names the whole control (`role="group"`). `disabled` dims the panel, blocks pointer events, and
  disables the channel + hex inputs.

**Area keyboard** (focus is on a channel input):

| Key                        | Action                                                    |
| -------------------------- | --------------------------------------------------------- |
| `ArrowLeft` / `ArrowRight` | Decrease / increase **saturation** by 1% (`Shift` = 10%). |
| `ArrowDown` / `ArrowUp`    | Decrease / increase **brightness** by 1% (`Shift` = 10%). |
| `PageDown` / `PageUp`      | Decrease / increase **brightness** by 10%.                |
| `Home` / `End`             | Jump **saturation** to 0% / 100%.                         |

## Framework API

The props, events, and slots of the **Vue** component. Behaviour comes from `useColorPicker`
(`@oriui/headless/vue`); the standalone CSS layer renders the panel statically from the
[classes](#classes) (interactivity is JS). (Svelte bindings are planned.)

### Props

| Prop         | Type                      | Default | Description                                                                                     |
| ------------ | ------------------------- | ------- | ----------------------------------------------------------------------------------------------- |
| `alpha`      | `boolean`                 | —       | Add an alpha channel: a checkerboard slider + `#rrggbbaa` (or `rgba()` / `hsla()`) output.      |
| `disabled`   | `boolean`                 | —       | Dims the panel, blocks pointer events, and disables the channel + hex inputs.                   |
| `eyedropper` | `boolean`                 | —       | Show a pick-from-screen trigger (EyeDropper API; auto-hidden where the browser lacks it).       |
| `form`       | `string`                  | —       | Associate the hidden value input with a `<form>` by id (when the picker sits outside it).       |
| `format`     | `'hex' \| 'rgb' \| 'hsl'` | `'hex'` | Output format of the emitted string. Always lowercase.                                          |
| `label`      | `string`                  | —       | Accessible name for the whole control (→ `aria-label` on the `role="group"` root).              |
| `modelValue` | `string`                  | —       | Controlled color; bind with `v-model`. Parsed loosely (hex, `rgb()/rgba()`, `hsl()/hsla()`).    |
| `name`       | `string`                  | —       | Submit the current color under this field name via a hidden input (a color always has a value). |
| `presets`    | `string[]`                | —       | Preset swatch colors, rendered as a single-select roving listbox.                               |

### Events

| Event               | Payload  | Description                                                                                            |
| ------------------- | -------- | ------------------------------------------------------------------------------------------------------ |
| `update:modelValue` | `string` | Fired **live** on every interaction tick (drag / arrow / hue / hex commit / preset); drives `v-model`. |
| `change`            | `string` | Fired once when the color is **committed** (pointer release / keyboard settle) — one undo entry.       |

### Slots

| Slot      | Props                         | Description                                                                                   |
| --------- | ----------------------------- | --------------------------------------------------------------------------------------------- |
| `#swatch` | —                             | Overlay content for the preview swatch (e.g. an icon). The swatch color/ink render behind it. |
| `#preset` | `{ preset, index, selected }` | Per-preset content (the singular of `presets`). Fallback: the chip shows its color.           |

## See also

- [useColorPicker](/headless/use-color-picker) — the headless composable (sRGB + 2D-area engine) behind this component.
- [OriSlider](/components/slider) · [OriInput](/components/input) · [OriPopover](/components/popover) — the primitives it reuses.
