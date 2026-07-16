---
title: useColorPicker
---

# useColorPicker

A headless **sRGB color picker** — a 2D **saturation × brightness** area, a **hue** channel, an optional
**alpha** channel, a **hex** field, and optional **preset** swatches, assembled from ready-to-bind
prop-getters. It owns the working color as an internal **HSVA** object (so the hue survives a grayscale
round-trip when you drag into a corner and back) and composes a zero-dependency sRGB engine plus pure
2D-area math from the core: `parseColor` / `formatColor` (loose parse in, lowercase string out),
`hsvToRgb` / `rgbToHex` / `rgbToHsl` (hex / rgb / hsv / hsl conversion), `readableInk` (WCAG-luminance
ink over a swatch), and `resolveAreaPosition` / `stepAreaPosition` (pointer → coordinate and keyboard
stepping across the two axes).

This is the **Vue** binding; the framework-agnostic core lives in [`@oriui/headless`](/headless/core),
and the styled [`OriColorPicker`](/components/color-picker) is built on it. Like
[`useToolbar`](/headless/use-toolbar), this is a **compositional** helper — deterministic sRGB + 2D-area
math exposed as prop-getters and setters — **not** the OriHeadless adapter contract: a color picker has
no swappable engine and no async state to project, so (unlike [`useDialog`](/headless/use-dialog)'s
machine-behind-a-swappable-adapter shape) there is nothing to swap. It does reuse the same core **roving**
helpers as the toolbar (`rovingIntent` / `resolveRovingIndex`) for the preset listbox — see the
[roving taxonomy](/headless/use-toolbar) framing.

## Import

```ts
import { useColorPicker } from '@oriui/headless/vue';
```

## Options

`useColorPicker(options)` takes its options as a **getter** — `useColorPicker(() => ({ … }))`, like
[`useToolbar`](/headless/use-toolbar) / [`useMenu`](/headless/use-menu) — so `value` / `format` /
`disabled` stay reactive. The color crosses the boundary as a **lowercase string** (bind to `v-model`),
with the dual-event convention: `onInput` streams live on every interaction tick, `onChange` commits once
on release / keyboard settle (one undo entry).

| Option       | Type                      | Default | Description                                                                                                      |
| ------------ | ------------------------- | ------- | ---------------------------------------------------------------------------------------------------------------- |
| `value`      | `string \| undefined`     | —       | The controlled color (the `v-model` value). Parsed loosely: hex, `rgb()/rgba()`, `hsl()/hsla()`.                 |
| `format`     | `'hex' \| 'rgb' \| 'hsl'` | `'hex'` | Output format of the emitted string (`ColorFormat`). `rgb` / `hsl` emit function notation; output is lowercase.  |
| `alpha`      | `boolean`                 | `false` | Include an alpha channel — the emitted string carries it (`#rrggbbaa` / `rgba()` / `hsla()`).                    |
| `eyedropper` | `boolean`                 | `false` | Expose an eyedropper action (the `EyeDropper` API); `eyedropperSupported` is `false` where the browser lacks it. |
| `label`      | `string`                  | —       | Accessible name for the whole control (→ `aria-label` on the root `role="group"`).                               |
| `disabled`   | `boolean`                 | `false` | Blocks the area pointer drag / keyboard and disables the channel inputs.                                         |
| `presets`    | `string[]`                | —       | Preset swatch colors, rendered as a single-select roving listbox.                                                |
| `onInput`    | `(next: string) => void`  | —       | **Required.** Live value on every interaction tick — wire to `update:modelValue`.                                |
| `onChange`   | `(next: string) => void`  | —       | **Required.** Committed value on pointer-release / keyboard settle — wire to `change` (one undo entry).          |

## Returns

Reactive state, prop-getters (spread with `v-bind`), and imperative setters. `HSVA` is
`{ h, s, v, a }` (h ∈ [0, 360), s / v / a ∈ [0, 1]); `RGB` is `{ r, g, b }` (0–255).

### Reactive state

| Property              | Type                                  | Description                                                                                                                                                                         |
| --------------------- | ------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `hsva`                | `ComputedRef<HSVA>`                   | The working color — the source of truth during interaction (hue preserved across a grayscale trip).                                                                                 |
| `rgb`                 | `ComputedRef<RGB>`                    | The working color as RGB (0–255), derived from `hsva`.                                                                                                                              |
| `hex`                 | `ComputedRef<string>`                 | The hex the field shows: `#rrggbbaa` when `alpha` is on, else `#rrggbb`.                                                                                                            |
| `value`               | `ComputedRef<string>`                 | The current color in the emitted `format` — the value a form submits; matches `v-model` after any emit (an initial value in another format still reports in `format`). Never empty. |
| `hue`                 | `ComputedRef<number>`                 | The current hue, 0–360 (bind to the hue slider).                                                                                                                                    |
| `alpha`               | `ComputedRef<number>`                 | The current alpha, 0–1 (bind to the alpha slider).                                                                                                                                  |
| `swatchColor`         | `ComputedRef<string>`                 | The preview color — carries alpha, so a checkerboard shows through.                                                                                                                 |
| `opaqueColor`         | `ComputedRef<string>`                 | The opaque current color, for the alpha slider's transparent → color track.                                                                                                         |
| `ink`                 | `ComputedRef<'#000000' \| '#ffffff'>` | Readable ink over the current color, per WCAG luminance (`readableInk`).                                                                                                            |
| `hueColor`            | `ComputedRef<string>`                 | The fully-saturated hue color — the area's `--ori-hue` gradient anchor.                                                                                                             |
| `eyedropperSupported` | `boolean`                             | Whether the `EyeDropper` API exists (a plain, non-reactive boolean — gate the eyedropper trigger on it).                                                                            |

### Prop-getters

| Property                        | Type                                           | Description                                                                                                                                                                                      |
| ------------------------------- | ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `areaProps`                     | `ComputedRef<object>`                          | The 2D area's bag: `role="group"`, `aria-label="Saturation and brightness"`, `aria-disabled`, the inline `--ori-hue` style, and the drag `onPointerdown` + 2D `onKeydown`.                       |
| `areaThumbStyle`                | `ComputedRef<{ left: string; top: string }>`   | Inline position for the area thumb: `left` = saturation, `top` = inverted value (1 = top).                                                                                                       |
| `getChannelInputProps(channel)` | `(channel: 'saturation' \| 'value') => object` | Props for one of the two visually-hidden `<input type="range">` (the a11y surface): `type="range"`, `min`/`max`/`step`, `value` (0–100), `aria-label`, `aria-valuetext`, `onInput`.              |
| `presetGroupProps`              | `ComputedRef<object>`                          | The preset listbox bag: `role="listbox"`, `aria-label="Preset colors"`, `aria-orientation="horizontal"`.                                                                                         |
| `getPresetProps(color, index)`  | `(color: string, index: number) => object`     | Props for one preset chip: `data-ori-preset`, `type="button"`, `role="option"`, `aria-label`, `aria-selected`, the roving `tabindex`, the inline `--ori-color` style, and `onClick` / `onFocus`. |
| `onPresetKeydown`               | `(event: KeyboardEvent) => void`               | The roving arrow-key handler for the preset listbox — bind to the group's `@keydown`.                                                                                                            |

### Setters & actions

| Property                   | Type                             | Description                                                                                                                            |
| -------------------------- | -------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `setHue(h)`                | `(h: number) => void`            | Set the hue (wrapped into [0, 360)); emits `onInput`.                                                                                  |
| `setAlpha(a)`              | `(a: number) => void`            | Set alpha (clamped 0–1); emits `onInput`.                                                                                              |
| `setSaturationValue(s, v)` | `(s: number, v: number) => void` | Set saturation + value (0–1 each); emits `onInput`. The area's pointer / keyboard math calls this.                                     |
| `setColor(next)`           | `(next: string) => boolean`      | Parse a full color string (hex entry, preset click) and apply — a commit (emits `onInput` + `onChange`). Returns whether it parsed.    |
| `setHex`                   | `(next: string) => boolean`      | Alias of `setColor` — the name the hex field reads by.                                                                                 |
| `openEyeDropper()`         | `() => Promise<void>`            | Open the `EyeDropper`; on pick, apply the color (keeping the current alpha) and commit. No-op when unsupported / disabled / dismissed. |
| `commit()`                 | `() => void`                     | Commit the current color (emits `onChange`) — one undo entry per pointer-release / keyboard settle.                                    |

## Usage

The picker is assembled from the parts you spread its getters onto — exactly what the styled
[`OriColorPicker`](/components/color-picker) wraps. Bind `areaProps` on the 2D surface with its two
visually-hidden range inputs, drive a slider off `hue` / `setHue`, feed the hex field through `setHex`,
and render `presets` as the roving listbox.

```vue
<script setup lang="ts">
import { ref, watch } from 'vue';
import { useColorPicker } from '@oriui/headless/vue';
import type { ColorFormat } from '@oriui/headless/vue';

const { format = 'hex', presets } = defineProps<{ format?: ColorFormat; presets?: string[] }>();

const model = defineModel<string>();
const emit = defineEmits<{ change: [value: string] }>();

// Options are a GETTER, so value / format stay reactive. onInput drives v-model (live),
// onChange commits (one undo entry).
const cp = useColorPicker(() => ({
    value: model.value,
    format,
    presets,
    onInput: (next) => {
        model.value = next;
    },
    onChange: (next) => emit('change', next)
}));

// The hex field holds a local draft so a partial entry isn't reformatted mid-type; cp.hex re-seeds it.
const hexDraft = ref(cp.hex.value);
watch(
    () => cp.hex.value,
    (hex) => {
        hexDraft.value = hex;
    }
);
</script>

<template>
    <div role="group" :aria-label="label">
        <!-- 2D saturation × value area. The two visually-hidden range inputs are the a11y surface
             (role=slider, focusable, form value); the area's keydown routes the arrows across both axes. -->
        <div v-bind="cp.areaProps.value">
            <span :style="cp.areaThumbStyle.value" aria-hidden="true"></span>
            <input class="sr-only" v-bind="cp.getChannelInputProps('saturation')" />
            <input class="sr-only" v-bind="cp.getChannelInputProps('value')" />
        </div>

        <!-- Preview swatch — role=img named by the current color, ink chosen for contrast. -->
        <span
            role="img"
            :aria-label="cp.hex.value"
            :style="{ background: cp.swatchColor.value, color: cp.ink.value }"
        />

        <!-- Hue slider — a native range in [0, 360); commit on release. -->
        <input
            type="range"
            :min="0"
            :max="360"
            :step="1"
            :value="cp.hue.value"
            aria-label="Hue"
            @input="cp.setHue(Number(($event.target as HTMLInputElement).value))"
            @change="cp.commit"
        />

        <!-- Hex field — setHex parses and commits, returning false on a bad hex. -->
        <input
            :value="hexDraft"
            aria-label="Hex color"
            spellcheck="false"
            @input="hexDraft = ($event.target as HTMLInputElement).value"
            @blur="cp.setHex(hexDraft)"
            @keydown.enter="cp.setHex(hexDraft)"
        />

        <!-- Presets — a single-select roving listbox (one tab stop; arrows move focus). -->
        <div v-if="presets?.length" v-bind="cp.presetGroupProps.value" @keydown="cp.onPresetKeydown">
            <button v-for="(preset, i) in presets" :key="preset" v-bind="cp.getPresetProps(preset, i)"></button>
        </div>
    </div>
</template>
```

Passing `alpha: true` adds the alpha channel (bind a second slider to `alpha` / `setAlpha`, using
`opaqueColor` for its track), and `eyedropper: true` enables `openEyeDropper` (gate its trigger on
`cp.eyedropperSupported`) — see how the styled [`OriColorPicker`](/components/color-picker) wires both.

The **Svelte** binding is the store twin (`@oriui/headless/svelte`) over the same core engine — the prop
bags are `Readable` stores you auto-subscribe with `$`, the per-part getters are **stores of functions**
(`$getChannelInputProps('saturation')`, `$getPresetProps(color, i)`), and event handlers are lowercased
(`onpointerdown` / `onkeydown` / `oninput` / `onclick` / `onfocus`). Options are a plain object or a store:

```svelte
<!-- MyColorPicker.svelte -->
<script>
    import { writable } from 'svelte/store';
    import { useColorPicker } from '@oriui/headless/svelte';

    export let color = '#3366ff';
    // Pass a STORE (not a snapshot object) so an external `color` change re-syncs into the picker — a plain
    // object becomes a constant store (`toReadable`) and would only seed the initial value.
    const options = writable({ value: color, onInput: (v) => (color = v), onChange: (v) => (color = v) });
    $: options.set({ value: color, onInput: (v) => (color = v), onChange: (v) => (color = v) });

    const cp = useColorPicker(options);
    const { areaProps, areaThumbStyle, getChannelInputProps, hue, hex } = cp;
</script>

<div {...$areaProps}>
    <span style:left={$areaThumbStyle.left} style:top={$areaThumbStyle.top} aria-hidden="true"></span>
    <input {...$getChannelInputProps('saturation')} />
    <input {...$getChannelInputProps('value')} />
</div>
<input type="range" min="0" max="359" value={$hue} on:input={(e) => cp.setHue(+e.currentTarget.value)} on:change={cp.commit} />
<input value={$hex} aria-label="Hex color" on:blur={(e) => cp.setHex(e.currentTarget.value)} />
```

The **React** binding (`@oriui/headless/react`) is the hooks twin over the same core engine — the control
is **plain values** (no `$` / `.value`), the per-part getters are plain functions
(`getChannelInputProps('saturation')`, `getPresetProps(color, i)`), event handlers use React casing
(`onPointerDown` / `onKeyDown` / `onInput` / `onClick` / `onFocus`, `tabIndex`), and options are a plain
object (not a getter or store) re-read every render, so `value` / `format` / `disabled` stay controlled.
`@oriui/css` styles the markup with the same `.ori-color-picker` classes in React / Next today:

```tsx
import { useEffect, useState } from 'react';
import { useColorPicker } from '@oriui/headless/react';

function MyColorPicker({ presets }: { presets?: string[] }) {
    const [color, setColor] = useState('#3366ff');
    // onInput streams live (drives the controlled value); onChange commits (one undo entry).
    const cp = useColorPicker({ value: color, presets, onInput: setColor, onChange: setColor });

    // The hex field holds a local draft so a partial entry isn't reformatted mid-type; cp.hex re-seeds it.
    const [hexDraft, setHexDraft] = useState(cp.hex);
    useEffect(() => setHexDraft(cp.hex), [cp.hex]);

    return (
        <div role="group">
            {/* 2D saturation × value area — the two visually-hidden ranges are the a11y surface. */}
            <div {...cp.areaProps}>
                <span style={cp.areaThumbStyle} aria-hidden="true" />
                <input className="sr-only" {...cp.getChannelInputProps('saturation')} />
                <input className="sr-only" {...cp.getChannelInputProps('value')} />
            </div>

            {/* Preview swatch — named by the current color, ink chosen for contrast. */}
            <span role="img" aria-label={cp.hex} style={{ background: cp.swatchColor, color: cp.ink }} />

            {/* Hue slider — a native range in [0, 360); commit on release. */}
            <input
                type="range"
                min={0}
                max={360}
                step={1}
                value={cp.hue}
                aria-label="Hue"
                onChange={(e) => cp.setHue(Number(e.currentTarget.value))}
                onPointerUp={cp.commit}
            />

            {/* Hex field — setHex parses and commits, returning false on a bad hex. */}
            <input
                value={hexDraft}
                aria-label="Hex color"
                spellCheck={false}
                onChange={(e) => setHexDraft(e.currentTarget.value)}
                onBlur={() => cp.setHex(hexDraft)}
                onKeyDown={(e) => e.key === 'Enter' && cp.setHex(hexDraft)}
            />

            {/* Presets — a single-select roving listbox (one tab stop; arrows move focus). */}
            {presets?.length ? (
                <div {...cp.presetGroupProps} onKeyDown={cp.onPresetKeydown}>
                    {presets.map((preset, i) => (
                        <button key={preset} {...cp.getPresetProps(preset, i)} />
                    ))}
                </div>
            ) : null}
        </div>
    );
}
```

Passing `alpha: true` / `eyedropper: true` behaves the same as in Vue (bind a second slider to
`cp.alpha` / `cp.setAlpha`; gate the eyedropper trigger on `cp.eyedropperSupported`, which is `false` on
the server and until mount, then `true` where the browser has the `EyeDropper` API).

## Accessibility

The prop-getters carry the ARIA and keyboard contract; nothing is hand-rolled that a native control
already provides.

- **The 2D area is two visually-hidden native `<input type="range">`** — one per axis
  (`getChannelInputProps('saturation')` / `('value')`). Each is a real `role="slider"` with its own
  `aria-label` and `aria-valuetext` (`"60%"`), focusable, announced, and form-associable. The arrow keys
  are routed across both axes by `areaProps`' `onKeydown` (a single native range spans only one axis); it
  `preventDefault`s the navigation keys and bubbles from the focused channel input. `getChannelInputProps`'
  own `onInput` still covers an assistive technology that sets a channel value directly.
- **The preview swatch is `role="img"`**, named by the current color; `ink` picks black or white content
  for WCAG contrast over it.
- **Presets are a single-select `role="listbox"`** (`presetGroupProps`) with **roving tabindex** — one tab
  stop, arrow keys move real DOM focus (`onPresetKeydown`, wrapping), `aria-selected` marks the active
  color. Each chip is a `role="option"` button labelled by its color.
- **`label`** names the whole control (`role="group"`); **`disabled`** blocks the area drag / keyboard and
  disables the channel inputs.

**Area keyboard** (focus is on a channel input; the area routes the key):

| Key                        | Action                                                    |
| -------------------------- | --------------------------------------------------------- |
| `ArrowLeft` / `ArrowRight` | Decrease / increase **saturation** by 1% (`Shift` = ×10). |
| `ArrowDown` / `ArrowUp`    | Decrease / increase **brightness** by 1% (`Shift` = ×10). |
| `PageDown` / `PageUp`      | Decrease / increase **brightness** by 10%.                |
| `Home` / `End`             | Jump **saturation** to 0% / 100%.                         |

## See also

- [@oriui/headless](/headless/core) — the framework-agnostic core: the zero-dependency sRGB engine and the
  pure 2D-area math behind this binding.
- [Color picker](/components/color-picker) — the styled `OriColorPicker` built on this composable.
- [Slider](/components/slider) — the native-range primitive the styled picker reuses for the hue / alpha channels.
- [Popover](/components/popover) — compose the inline picker into a popover for a swatch-triggered flow.
