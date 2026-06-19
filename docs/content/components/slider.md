---
title: Slider
---

# Slider

A styled, accessible range control built on a native `<input type="range">`. Because the
underlying element is real HTML, the browser supplies `role="slider"`, the full keyboard contract
(arrow keys, Home/End, PageUp/PageDown), and screen-reader value announcements for free — no
JavaScript bridge needed. Colour and the filled-track portion are driven by CSS custom properties;
`v-model` carries a `number`.

Every example is live and shows the standalone **HTML / `@oriui/css`** markup by default — the same
classes you'd use in htmx, Astro, Svelte, or plain HTML. Flip any example to **Vue** for the styled
component.

## Classes

A slider is a block wrapper plus BEM part classes. The `ori-color_*` utility repoints the one token
the component reads everywhere (`--ori-color`). The Vue props in [Framework API](#framework-api)
map 1:1 to these.

<!-- prettier-ignore -->
:class-table{:rows='[{"class":"ori-slider","type":"Block","description":"Required base class (wrapper div). Full-width by default."},{"class":"ori-color_*","type":"Color","description":"<b>primary</b> · secondary · success · warn · danger · info · surface"},{"class":"ori-slider__label","type":"Part","description":"Flex row wrapping the visible label text and optional current value."},{"class":"ori-slider__value","type":"Part","description":"Current value badge inside the label row; tabular-nums, slightly dimmed."},{"class":"ori-slider__input","type":"Part","description":"The native <code>&lt;input type=range&gt;</code>; receives the inline <code>--ori-slider-pct</code> custom property."},{"class":"data-disabled","type":"State","description":"Set on the wrapper when <code>disabled</code> is true; dims the control and changes the cursor to not-allowed."}]'}

## Live demo

Drag either handle to see `v-model` update in real time. The two sliders share no state — each
drives its own `ref`.

::example
:slider-demo

#vue

```vue
<script setup>
import { ref } from 'vue';
const volume = ref(60);
const brightness = ref(40);
</script>

<template>
    <div style="display: flex; flex-direction: column; gap: 1.5rem; width: 100%; max-width: 24rem">
        <OriSlider v-model="volume" label="Volume" :show-value="true" />
        <OriSlider v-model="brightness" label="Brightness" color="warn" :show-value="true" :max="200" />
    </div>
</template>
```

#html

```html
<!--
  The filled portion is an inline CSS custom property — set --ori-slider-pct
  to ((value - min) / (max - min)) * 100 from your own script.
-->
<div class="ori-slider ori-color_primary" style="--ori-slider-pct: 60%">
    <label class="ori-slider__label" for="vol">
        <span>Volume</span>
        <span class="ori-slider__value">60</span>
    </label>
    <input id="vol" type="range" class="ori-slider__input" min="0" max="100" step="1" value="60" />
</div>
```

::

## Colors

Every semantic role. The filled track, the thumb, and the focus ring all read `--ori-color`.

::example
:ori-slider{:model-value="60" color="primary" label="primary"}
:ori-slider{:model-value="60" color="secondary" label="secondary"}
:ori-slider{:model-value="60" color="success" label="success"}
:ori-slider{:model-value="60" color="warn" label="warn"}
:ori-slider{:model-value="60" color="danger" label="danger"}
:ori-slider{:model-value="60" color="info" label="info"}

#vue

```vue
<OriSlider :model-value="60" color="primary" label="primary" />
<OriSlider :model-value="60" color="secondary" label="secondary" />
<OriSlider :model-value="60" color="warn" label="warn" />
<OriSlider :model-value="60" color="danger" label="danger" />
```

#html

```html
<!-- swap ori-color_primary for any semantic role -->
<div class="ori-slider ori-color_danger" style="--ori-slider-pct: 60%">
    <label class="ori-slider__label" for="s-danger"><span>danger</span></label>
    <input id="s-danger" type="range" class="ori-slider__input" min="0" max="100" step="1" value="60" />
</div>
```

::

## Range (min / max / step)

`min`, `max`, and `step` map directly to the native `<input>` attributes. The component recomputes
`--ori-slider-pct` from these, so the filled portion stays accurate.

::example
:ori-slider{:min="0" :max="10" :step="1" :model-value="4" label="Rating" :show-value="true"}
:ori-slider{:min="0" :max="200" :step="10" :model-value="80" label="Brightness" color="warn" :show-value="true"}
:ori-slider{:min="-50" :max="50" :step="5" :model-value="0" label="Balance" color="secondary" :show-value="true"}

#vue

```vue
<!-- 0–10 in whole steps -->
<OriSlider v-model="rating" :min="0" :max="10" :step="1" label="Rating" :show-value="true" />

<!-- 0–200 in steps of 10 -->
<OriSlider v-model="brightness" :min="0" :max="200" :step="10" label="Brightness" color="warn" :show-value="true" />

<!-- negative range -->
<OriSlider v-model="balance" :min="-50" :max="50" :step="5" label="Balance" color="secondary" :show-value="true" />
```

#html

```html
<div class="ori-slider ori-color_primary" style="--ori-slider-pct: 40%">
    <label class="ori-slider__label" for="rating">
        <span>Rating</span>
        <span class="ori-slider__value">4</span>
    </label>
    <input id="rating" type="range" class="ori-slider__input" min="0" max="10" step="1" value="4" />
</div>
```

::

## Show value

`show-value` renders the current number on the trailing end of the label row in a tabular-nums span.
Useful when the exact value matters to the user.

::example
:ori-slider{:model-value="72" label="Volume" :show-value="true"}
:ori-slider{:model-value="72" label="Volume" :show-value="false"}

#vue

```vue
<!-- value visible -->
<OriSlider v-model="vol" label="Volume" :show-value="true" />

<!-- value hidden (default) -->
<OriSlider v-model="vol" label="Volume" />
```

#html

```html
<!-- with value -->
<div class="ori-slider ori-color_primary" style="--ori-slider-pct: 72%">
    <label class="ori-slider__label" for="sv1">
        <span>Volume</span>
        <span class="ori-slider__value">72</span>
    </label>
    <input id="sv1" type="range" class="ori-slider__input" min="0" max="100" step="1" value="72" />
</div>

<!-- without value — omit the span -->
<div class="ori-slider ori-color_primary" style="--ori-slider-pct: 72%">
    <label class="ori-slider__label" for="sv2"><span>Volume</span></label>
    <input id="sv2" type="range" class="ori-slider__input" min="0" max="100" step="1" value="72" />
</div>
```

::

## Disabled

`disabled` sets the native `disabled` attribute on the `<input>` and adds `data-disabled` on the
wrapper, which applies 50 % opacity and a `not-allowed` cursor.

::example
:ori-slider{:model-value="30" :disabled="true" label="Locked"}
:ori-slider{:model-value="30" :disabled="true" label="Locked" color="danger"}

#vue

```vue
<OriSlider :model-value="30" disabled label="Locked" />
```

#html

```html
<div class="ori-slider ori-color_primary" data-disabled style="--ori-slider-pct: 30%">
    <label class="ori-slider__label" for="dis"><span>Locked</span></label>
    <input id="dis" type="range" class="ori-slider__input" min="0" max="100" step="1" value="30" disabled />
</div>
```

::

## Common patterns

A settings panel with labelled sliders — the most common real-world composition.

::example
:ori-slider{:model-value="75" label="Volume" :show-value="true"}
:ori-slider{:model-value="50" label="Balance" color="secondary" :show-value="true" :min="-100" :max="100" :step="5"}
:ori-slider{:model-value="20" label="Bass boost" color="info" :show-value="true" :max="40"}

#vue

```vue
<div style="display: flex; flex-direction: column; gap: 1.25rem; max-width: 24rem">
    <OriSlider v-model="volume" label="Volume" :show-value="true" />
    <OriSlider v-model="balance" label="Balance" color="secondary" :show-value="true" :min="-100" :max="100" :step="5" />
    <OriSlider v-model="bass" label="Bass boost" color="info" :show-value="true" :max="40" />
</div>
```

#html

```html
<div style="display: flex; flex-direction: column; gap: 1.25rem; max-width: 24rem">
    <div class="ori-slider ori-color_primary" style="--ori-slider-pct: 75%">
        <label class="ori-slider__label" for="p-vol">
            <span>Volume</span><span class="ori-slider__value">75</span>
        </label>
        <input id="p-vol" type="range" class="ori-slider__input" min="0" max="100" step="1" value="75" />
    </div>
    <div class="ori-slider ori-color_secondary" style="--ori-slider-pct: 75%">
        <label class="ori-slider__label" for="p-bal">
            <span>Balance</span><span class="ori-slider__value">50</span>
        </label>
        <input id="p-bal" type="range" class="ori-slider__input" min="-100" max="100" step="5" value="50" />
    </div>
</div>
```

::

## Accessibility

The accessibility contract holds across every layer — the standalone classes and the Vue component
render the same attributes and keyboard behaviour.

- Renders a real `<input type="range">`, so the browser supplies `role="slider"`, the accessible
  value (`aria-valuenow`, `aria-valuemin`, `aria-valuemax`), and value announcements to screen
  readers with no extra ARIA needed.
- The `label` prop renders a `<label>` linked to the input via `for`/`id` (auto-generated via
  `useId()`). Without a `label`, pass an `aria-label` or `aria-labelledby` attribute — OriSlider sets
  `inheritAttrs: false` and binds `$attrs` to the `<input>`, so the name lands on the real control.
  `showValue` is a visual supplement, not a name source — pair it with `label` or `aria-label`.
- `disabled` is the real native attribute; the wrapper receives `data-disabled` for CSS only.
- The focus ring appears on the thumb (`:focus-visible`) and uses `--ori-color`, so it always
  matches the active colour role.
- For the HTML layer, set `--ori-slider-pct` inline to `((value - min) / (max - min)) * 100%` so
  the WebKit gradient fill reflects the current value; Firefox reads `::-moz-range-progress`
  directly from the element value and needs no custom property.

| Key          | Action                                                 |
| ------------ | ------------------------------------------------------ |
| `ArrowRight` | Increases value by one `step`.                         |
| `ArrowUp`    | Increases value by one `step`.                         |
| `ArrowLeft`  | Decreases value by one `step`.                         |
| `ArrowDown`  | Decreases value by one `step`.                         |
| `Home`       | Jumps to `min`.                                        |
| `End`        | Jumps to `max`.                                        |
| `PageUp`     | Increases value by a larger step (browser-determined). |
| `PageDown`   | Decreases value by a larger step (browser-determined). |

## Framework API

The props, events, and slots of the **Vue** component. The standalone CSS layer has no component
API — its surface is the [classes](#classes) above. (Svelte bindings are planned.)

### Props

| Prop         | Type         | Default     | Description                                                                      |
| ------------ | ------------ | ----------- | -------------------------------------------------------------------------------- |
| `color`      | `ThemeColor` | `'primary'` | Semantic accent: primary · secondary · success · warn · danger · info · surface. |
| `disabled`   | `boolean`    | —           | Sets native `disabled` on the input and `data-disabled` on the wrapper.          |
| `label`      | `string`     | —           | Visible `<label>` text, linked to the input via `for`/`id`.                      |
| `max`        | `number`     | `100`       | Maximum value — maps to the native `max` attribute.                              |
| `min`        | `number`     | `0`         | Minimum value — maps to the native `min` attribute.                              |
| `modelValue` | `number`     | —           | Controlled value; bind with `v-model`. Defaults to `min` when omitted.           |
| `showValue`  | `boolean`    | —           | Renders the current value in an `ori-slider__value` span beside the label.       |
| `step`       | `number`     | `1`         | Increment per arrow-key press — maps to the native `step` attribute.             |

### Events & attributes

OriSlider emits a single custom event for two-way binding:

| Event               | Payload  | Description                                       |
| ------------------- | -------- | ------------------------------------------------- |
| `update:modelValue` | `number` | Fired on every `input` event; use with `v-model`. |

```vue
<OriSlider v-model="volume" label="Volume" :show-value="true" />
```

OriSlider sets `inheritAttrs: false`, so undeclared native attributes and listeners (`aria-label`,
`aria-describedby`, `name`, `id`, `@change`, …) fall through to the **`<input>`**, not the wrapper —
they name, describe, and submit the real control. `label` auto-generates the input `id` via `useId()`,
so an explicit `id` is only needed to override it.

### Slots

OriSlider exposes no slots.

| Slot   | Description           |
| ------ | --------------------- |
| (none) | No slots are defined. |
