---
title: Switch
---

# Switch

An on/off toggle built on a **real `<input type="checkbox" role="switch">`** — kept in the DOM
(visually hidden over a track + thumb) so keyboard, focus, and form submission work for free, and
assistive technology announces it as a switch. `v-model` is a boolean. The "on" track color and the
`:focus-visible` ring both come from the `ori-color` token; the track and thumb scale with
`ori-font-size` so size is a single prop.

Every example is live and shows the standalone **HTML / `@oriui/ui/css`** markup by default — the same
classes you'd use in htmx, Astro, Svelte, or plain HTML. Flip any example to **Vue** for the styled
component.

## Classes

A switch is a block class on the `<label>` wrapper plus two token utilities — color and font-size.
The Vue props in [Framework API](#framework-api) map 1:1 to these.

:class-table{:rows='[{"class":"ori-switch","type":"Block","description":"Required base class — placed on the wrapping <code>&lt;label&gt;</code>."},{"class":"ori-color + ori-color_*","type":"Color","description":"<b>primary</b> · secondary · success · warn · danger · info · surface"},{"class":"ori-font-size + ori-font-size_*","type":"Size","description":"xs · sm · <b>md</b> · lg · xl · xxl — the track and thumb scale with this."},{"class":"ori-switch__input","type":"Part","description":"The visually-hidden native <code>&lt;input type=checkbox role=switch&gt;</code>."},{"class":"ori-switch__track","type":"Part","description":"The visible pill track; <code>aria-hidden</code>."},{"class":"ori-switch__thumb","type":"Part","description":"The sliding circle inside the track; <code>aria-hidden</code>."},{"class":"ori-switch__label","type":"Part","description":"Optional visible text label beside the track."},{"class":"ori-switch_disabled","type":"State","description":"Added by the component when <code>disabled</code> is true; also sets the native <code>disabled</code> attribute on the input."}]'}

## Colors

Every semantic color role. The track fill and the focus ring both use `--ori-color`.

::example
:ori-switch{label="Primary (off)" color="primary"}
:ori-switch{label="Primary (on)" color="primary" :modelValue="true"}
:ori-switch{label="Secondary" color="secondary"}
:ori-switch{label="Success" color="success"}
:ori-switch{label="Warn" color="warn"}
:ori-switch{label="Danger" color="danger"}
:ori-switch{label="Info" color="info"}

#html

```html
<label class="ori-switch ori-color ori-color_primary ori-font-size ori-font-size_md" for="s1">
    <input id="s1" type="checkbox" role="switch" class="ori-switch__input" />
    <span class="ori-switch__track" aria-hidden="true"><span class="ori-switch__thumb"></span></span>
    <span class="ori-switch__label">Primary</span>
</label>
<!-- swap the color pair: ori-color_primary → _danger / _success / _warn / _info -->
```

#vue

```vue
<OriSwitch v-model="on" label="Primary" color="primary" />
<OriSwitch v-model="on" label="Danger" color="danger" />
<OriSwitch v-model="on" label="Info" color="info" />
```

::

## Sizes

`xs` → `xxl`. A single `ori-font-size` class scales both the label text and the track/thumb geometry.

::example
:ori-switch{label="xs" size="xs"}
:ori-switch{label="sm" size="sm"}
:ori-switch{label="md" size="md"}
:ori-switch{label="lg" size="lg"}
:ori-switch{label="xl" size="xl"}

#html

```html
<!-- track and thumb scale off ori-font-size -->
<label class="ori-switch ori-color ori-color_primary ori-font-size ori-font-size_sm" for="sm">
    <input id="sm" type="checkbox" role="switch" class="ori-switch__input" />
    <span class="ori-switch__track" aria-hidden="true"><span class="ori-switch__thumb"></span></span>
    <span class="ori-switch__label">sm</span>
</label>
<label class="ori-switch ori-color ori-color_primary ori-font-size ori-font-size_xl" for="xl">
    <input id="xl" type="checkbox" role="switch" class="ori-switch__input" />
    <span class="ori-switch__track" aria-hidden="true"><span class="ori-switch__thumb"></span></span>
    <span class="ori-switch__label">xl</span>
</label>
```

#vue

```vue
<OriSwitch v-model="on" label="sm" size="sm" />
<OriSwitch v-model="on" label="xl" size="xl" />
```

::

## States

`disabled` sets the native `disabled` on the `<input>` and adds `ori-switch_disabled` (reduced
opacity + `not-allowed` cursor) on the wrapper. `invalid` sets `aria-invalid="true"` on the input.
`required` sets the native `required`.

::example
:ori-switch{label="Disabled off" :disabled="true"}
:ori-switch{label="Disabled on" :disabled="true" :modelValue="true"}

#html

```html
<label class="ori-switch ori-switch_disabled ori-color ori-color_primary ori-font-size ori-font-size_md" for="d1">
    <input id="d1" type="checkbox" role="switch" class="ori-switch__input" disabled />
    <span class="ori-switch__track" aria-hidden="true"><span class="ori-switch__thumb"></span></span>
    <span class="ori-switch__label">Disabled off</span>
</label>
<label class="ori-switch ori-switch_disabled ori-color ori-color_primary ori-font-size ori-font-size_md" for="d2">
    <input id="d2" type="checkbox" role="switch" class="ori-switch__input" disabled checked />
    <span class="ori-switch__track" aria-hidden="true"><span class="ori-switch__thumb"></span></span>
    <span class="ori-switch__label">Disabled on</span>
</label>
```

#vue

```vue
<OriSwitch v-model="on" label="Disabled off" disabled />
<!-- pass a true initial value to show the on state -->
<OriSwitch :modelValue="true" label="Disabled on" disabled />
```

::

## Invalid

`invalid` wires `aria-invalid="true"` so screen readers announce the error state.

::example
:ori-switch{label="Required field" :invalid="true" color="danger"}

#html

```html
<label class="ori-switch ori-color ori-color_danger ori-font-size ori-font-size_md" for="inv">
    <input id="inv" type="checkbox" role="switch" class="ori-switch__input" aria-invalid="true" required />
    <span class="ori-switch__track" aria-hidden="true"><span class="ori-switch__thumb"></span></span>
    <span class="ori-switch__label">Required field</span>
</label>
```

#vue

```vue
<OriSwitch v-model="accepted" label="Required field" :invalid="!accepted" color="danger" required />
```

::

## Without a label

Pass no `label` prop to render the track alone. Always pair a label-less switch with an external
`aria-label` or a visible text element connected via `aria-labelledby`.

::example
:ori-switch{aria-label="Dark mode"}

#html

```html
<label class="ori-switch ori-color ori-color_primary ori-font-size ori-font-size_md" for="dm">
    <input id="dm" type="checkbox" role="switch" class="ori-switch__input" aria-label="Dark mode" />
    <span class="ori-switch__track" aria-hidden="true"><span class="ori-switch__thumb"></span></span>
</label>
```

#vue

```vue
<OriSwitch v-model="darkMode" aria-label="Dark mode" />
```

::

## Common patterns

A settings row — switch on the right aligned to a description — is the most common real-world use.

::example
:ori-switch{label="Email notifications" color="primary" size="md"}
:ori-switch{label="Dark mode" color="secondary" size="md"}
:ori-switch{label="Auto-save" :disabled="true" size="md"}

#html

```html
<div style="display: flex; flex-direction: column; gap: 0.75rem">
    <label class="ori-switch ori-color ori-color_primary ori-font-size ori-font-size_md" for="p1">
        <input id="p1" type="checkbox" role="switch" class="ori-switch__input" />
        <span class="ori-switch__track" aria-hidden="true"><span class="ori-switch__thumb"></span></span>
        <span class="ori-switch__label">Email notifications</span>
    </label>
    <label class="ori-switch ori-color ori-color_secondary ori-font-size ori-font-size_md" for="p2">
        <input id="p2" type="checkbox" role="switch" class="ori-switch__input" />
        <span class="ori-switch__track" aria-hidden="true"><span class="ori-switch__thumb"></span></span>
        <span class="ori-switch__label">Dark mode</span>
    </label>
    <label class="ori-switch ori-switch_disabled ori-color ori-color_primary ori-font-size ori-font-size_md" for="p3">
        <input id="p3" type="checkbox" role="switch" class="ori-switch__input" disabled />
        <span class="ori-switch__track" aria-hidden="true"><span class="ori-switch__thumb"></span></span>
        <span class="ori-switch__label">Auto-save</span>
    </label>
</div>
```

#vue

```vue
<div style="display: flex; flex-direction: column; gap: 0.75rem">
    <OriSwitch v-model="emailNotifs" label="Email notifications" color="primary" />
    <OriSwitch v-model="darkMode" label="Dark mode" color="secondary" />
    <OriSwitch v-model="autoSave" label="Auto-save" disabled />
</div>
```

::

## Accessibility

The accessibility contract holds across every layer — the standalone classes and the Vue component
render the same attributes and keyboard behaviour.

- Renders a real `<input type="checkbox" role="switch">` so keyboard interaction, form submission,
  and screen-reader announcements work without any JavaScript bridges.
- The wrapping `<label>` is linked to the input by `for`/`id` (auto-generated via `useId()` unless
  `id` is supplied) — clicking the label text or the track both toggle the switch.
- The visual track and thumb are `aria-hidden="true"`; the input is the only element in the
  accessibility tree.
- `disabled` is the real native attribute (not a class); `invalid` sets `aria-invalid="true"`.
- A label-less switch must receive an accessible name via `aria-label` or `aria-labelledby` passed
  as an attribute (it falls through to the `<input>`).
- `:focus-visible` outline appears on the track (using `--ori-color`) so the focus indicator is
  always visible without disrupting the unfocused appearance.

| Key     | Action                     |
| ------- | -------------------------- |
| `Space` | Toggles the switch on/off. |
| `Tab`   | Moves focus to the switch. |

## Framework API

The props, events, and slots of the **Vue** component. The standalone CSS layer has no component
API — its surface is the [classes](#classes) above. (Svelte bindings are planned.)

### Props

| Prop       | Type         | Default     | Description                                                                                        |
| ---------- | ------------ | ----------- | -------------------------------------------------------------------------------------------------- |
| `color`    | `ThemeColor` | `'primary'` | Semantic color for the "on" track fill and the focus ring.                                         |
| `disabled` | `boolean`    | `false`     | Disables the control — sets native `disabled` and adds `ori-switch_disabled` on the wrapper.       |
| `id`       | `string`     | —           | Overrides the auto-generated `useId()` id that links the `<label>` to the `<input>`.               |
| `invalid`  | `boolean`    | —           | Sets `aria-invalid="true"` on the input; pair with a visible error message.                        |
| `label`    | `string`     | —           | Visible text label rendered beside the track. Omit to render the track alone.                      |
| `required` | `boolean`    | —           | Sets the native `required` attribute on the input.                                                 |
| `size`     | `ActionSize` | `'md'`      | Controls both label text size and track/thumb geometry (`xs` · `sm` · `md` · `lg` · `xl` · `xxl`). |

### Events & attributes

OriSwitch uses `defineModel<boolean>()` for two-way binding — bind with `v-model` to read the
checked state and emit `update:modelValue` when it toggles.

```vue
<OriSwitch v-model="enabled" label="Notifications" />
```

Because `inheritAttrs: false` is set and `v-bind="$attrs"` is forwarded to the `<input>`, all
native input attributes and listeners fall through to the real control:

- `@change`, `@focus`, `@blur` land on the `<input>`.
- `name`, `form`, `aria-describedby`, `aria-label`, `data-*` pass through transparently.

### Slots

| Slot | Description                                                                                                                           |
| ---- | ------------------------------------------------------------------------------------------------------------------------------------- |
| —    | OriSwitch exposes no slots. Use the `label` prop for visible text, or place external elements and connect them via `aria-labelledby`. |
