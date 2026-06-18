---
title: Select
---

# Select

A native-first styled select control with `v-model`. The browser owns the dropdown, full keyboard
interaction, type-ahead, and all ARIA semantics — oriUI only styles the closed control and draws a
decorative chevron. State is expressed through real attributes — native `disabled` and
`aria-invalid="true"` (not classes) — and arbitrary native attrs (`name`, `required`,
`autocomplete`, …) fall through to the `<select>` via `inheritAttrs:false`.

Every example is live and shows the standalone **HTML / `@oriui/css`** markup by default — the same
classes you'd use in htmx, Astro, Svelte, or plain HTML. Flip any example to **Vue** for the styled
component.

## Classes

A select is a block wrapper plus paired token utilities — each pair is a base class (`ori-color`) and
a scale value (`ori-color_primary`), so one class repoints one token. The `ori-color` accent drives
the focus ring; the idle border is a neutral, theme-aware blend. The Vue props in
[Framework API](#framework-api) map 1:1 to these.

:class-table{:rows='[{"class":"ori-select","type":"Block","description":"Wrapper (position: relative, inline-flex); carries ori-color and ori-font-size utility classes."},{"class":"ori-color + ori-color_*","type":"Color","description":"primary (default) · secondary · success · warn · danger · info · surface (focus ring accent)."},{"class":"ori-size-action + ori-size-action_*","type":"Size","description":"xs · sm · md (default) · lg · xl · xxl (control height)."},{"class":"ori-size-radius + ori-size-radius_*","type":"Radius","description":"zero · xs · sm · md (default) · lg · xl · rounded (control corners)."},{"class":"ori-font-size + ori-font-size_*","type":"Font","description":"xs · sm · md (default) · lg · xl · xxl (text scale, driven by size prop)."},{"class":"ori-select__control","type":"Part","description":"The native select element; carries ori-size-action and ori-size-radius utilities."},{"class":"ori-select__chevron","type":"Part","description":"Decorative aria-hidden chevron (inline SVG), absolutely positioned at inset-inline-end."},{"class":"disabled · aria-invalid","type":"State","description":"real attributes, not classes"}]'}

## Colors

The `ori-color` pair controls the focus ring accent.

::example
:ori-select{color="primary" :options='[{"label":"Primary","value":"primary"}]'}
:ori-select{color="secondary" :options='[{"label":"Secondary","value":"secondary"}]'}
:ori-select{color="success" :options='[{"label":"Success","value":"success"}]'}
:ori-select{color="warn" :options='[{"label":"Warn","value":"warn"}]'}
:ori-select{color="danger" :options='[{"label":"Danger","value":"danger"}]'}
:ori-select{color="info" :options='[{"label":"Info","value":"info"}]'}

#vue

```vue
<OriSelect v-model="value" color="primary" :options="options" />
<OriSelect v-model="value" color="danger" :options="options" />
<OriSelect v-model="value" color="info" :options="options" />
```

#html

```html
<!-- swap the color pair: ori-color_primary → _secondary / _success / _warn / _danger / _info -->
<div class="ori-select ori-color ori-color_danger ori-font-size ori-font-size_md">
    <select class="ori-select__control ori-size-action ori-size-action_md ori-size-radius ori-size-radius_md">
        <option value="danger">Danger</option>
    </select>
    <span class="ori-select__chevron" aria-hidden="true"><!-- chevron SVG --></span>
</div>
```

::

## Sizes

`xs` → `xxl`. The size drives both the control height (`ori-size-action`) and the text scale
(`ori-font-size`).

::example
:ori-select{size="xs" :options='[{"label":"Extra small","value":"xs"}]'}
:ori-select{size="sm" :options='[{"label":"Small","value":"sm"}]'}
:ori-select{size="md" :options='[{"label":"Medium","value":"md"}]'}
:ori-select{size="lg" :options='[{"label":"Large","value":"lg"}]'}
:ori-select{size="xl" :options='[{"label":"Extra large","value":"xl"}]'}

#vue

```vue
<OriSelect v-model="value" size="sm" :options="options" />
<OriSelect v-model="value" size="xl" :options="options" />
```

#html

```html
<!-- ori-size-action drives height; ori-font-size scales the text; both use the same size token -->
<div class="ori-select ori-color ori-color_primary ori-font-size ori-font-size_xl">
    <select class="ori-select__control ori-size-action ori-size-action_xl ori-size-radius ori-size-radius_md">
        <option value="xl">Extra large</option>
    </select>
    <span class="ori-select__chevron" aria-hidden="true"><!-- chevron SVG --></span>
</div>
```

::

## Radius

From `zero` (square) through the default `md` to `rounded` (pill-shaped control).

::example
:ori-select{radius="zero" :options='[{"label":"Zero","value":"zero"}]'}
:ori-select{radius="sm" :options='[{"label":"Small","value":"sm"}]'}
:ori-select{radius="md" :options='[{"label":"Medium","value":"md"}]'}
:ori-select{radius="lg" :options='[{"label":"Large","value":"lg"}]'}
:ori-select{radius="rounded" :options='[{"label":"Rounded","value":"rounded"}]'}

#vue

```vue
<OriSelect v-model="value" radius="zero" :options="options" />
<OriSelect v-model="value" radius="rounded" :options="options" />
```

#html

```html
<select class="ori-select__control ori-size-action ori-size-action_md ori-size-radius ori-size-radius_zero">
    …
</select>
```

::

## Placeholder

A `placeholder` renders a disabled, non-reselectable first option that acts as a prompt. It carries
`disabled` so it cannot be chosen after the user has made a selection.

::example
:ori-select{placeholder="Choose a country" :options='[{"label":"France","value":"fr"},{"label":"Germany","value":"de"},{"label":"Japan","value":"jp"}]'}

#vue

```vue
<OriSelect
    v-model="country"
    placeholder="Choose a country"
    :options="[
        { label: 'France', value: 'fr' },
        { label: 'Germany', value: 'de' },
        { label: 'Japan', value: 'jp' }
    ]"
/>
```

#html

```html
<div class="ori-select ori-color ori-color_primary ori-font-size ori-font-size_md">
    <select class="ori-select__control ori-size-action ori-size-action_md ori-size-radius ori-size-radius_md">
        <option value="" disabled selected>Choose a country</option>
        <option value="fr">France</option>
        <option value="de">Germany</option>
        <option value="jp">Japan</option>
    </select>
    <span class="ori-select__chevron" aria-hidden="true"><!-- chevron SVG --></span>
</div>
```

::

## Options prop

Pass a flat array of `{ label, value, disabled? }` objects. The component renders them as `<option>`
elements, with disabled items available but not selectable.

::example
:ori-select{placeholder="Pick a plan" :options='[{"label":"Free","value":"free"},{"label":"Pro","value":"pro"},{"label":"Enterprise (contact us)","value":"ent","disabled":true}]'}

#vue

```vue
<OriSelect
    v-model="plan"
    placeholder="Pick a plan"
    :options="[
        { label: 'Free', value: 'free' },
        { label: 'Pro', value: 'pro' },
        { label: 'Enterprise (contact us)', value: 'ent', disabled: true }
    ]"
/>
```

#html

```html
<select class="ori-select__control …">
    <option value="" disabled selected>Pick a plan</option>
    <option value="free">Free</option>
    <option value="pro">Pro</option>
    <option value="ent" disabled>Enterprise (contact us)</option>
</select>
```

::

## Default slot

Provide hand-written `<option>` / `<optgroup>` markup as the default slot. When the slot is used it
replaces the `options`-prop rendering; the placeholder option (if any) still renders before the slot.

::example
:ori-select{placeholder="Pick a city"}

#vue

```vue
<OriSelect v-model="city" placeholder="Pick a city">
    <optgroup label="Europe">
        <option value="par">Paris</option>
        <option value="ber">Berlin</option>
    </optgroup>
    <optgroup label="Asia">
        <option value="tok">Tokyo</option>
        <option value="bkk">Bangkok</option>
    </optgroup>
</OriSelect>
```

#html

```html
<div class="ori-select ori-color ori-color_primary ori-font-size ori-font-size_md">
    <select class="ori-select__control ori-size-action ori-size-action_md ori-size-radius ori-size-radius_md">
        <option value="" disabled selected>Pick a city</option>
        <optgroup label="Europe">
            <option value="par">Paris</option>
            <option value="ber">Berlin</option>
        </optgroup>
        <optgroup label="Asia">
            <option value="tok">Tokyo</option>
            <option value="bkk">Bangkok</option>
        </optgroup>
    </select>
    <span class="ori-select__chevron" aria-hidden="true"><!-- chevron SVG --></span>
</div>
```

::

## States

`disabled` uses the real native attribute. `invalid` sets `aria-invalid="true"` and switches the
border and focus ring to the danger color.

::example
:ori-select{:disabled="true" :options='[{"label":"Cannot change","value":"x"}]'}
:ori-select{:invalid="true" placeholder="Required" :options='[{"label":"Option A","value":"a"},{"label":"Option B","value":"b"}]'}

#vue

```vue
<OriSelect v-model="value" disabled :options="options" />
<OriSelect v-model="value" invalid placeholder="Required" :options="options" />
```

#html

```html
<!-- disabled -->
<select class="ori-select__control …" disabled>
    …
</select>

<!-- invalid -->
<select class="ori-select__control …" aria-invalid="true">
    …
</select>
```

::

## Common patterns

A shipping-address form row — color, size, radius, placeholder, and required fall through together.

::example
:ori-select{placeholder="Country" :options='[{"label":"France","value":"fr"},{"label":"Germany","value":"de"},{"label":"Japan","value":"jp"}]'}
:ori-select{placeholder="State / Province" :options='[{"label":"Île-de-France","value":"idf"},{"label":"Bavaria","value":"bay"}]'}

#vue

```vue
<div style="display: flex; gap: 0.75rem; flex-wrap: wrap">
    <OriSelect
        v-model="country"
        placeholder="Country"
        name="country"
        required
        :options="countryOptions"
    />
    <OriSelect
        v-model="state"
        placeholder="State / Province"
        name="state"
        :options="stateOptions"
    />
</div>
```

#html

```html
<div style="display: flex; gap: 0.75rem; flex-wrap: wrap">
    <div class="ori-select ori-color ori-color_primary ori-font-size ori-font-size_md">
        <select
            name="country"
            required
            class="ori-select__control ori-size-action ori-size-action_md ori-size-radius ori-size-radius_md"
        >
            <option value="" disabled selected>Country</option>
            <option value="fr">France</option>
            <option value="de">Germany</option>
            <option value="jp">Japan</option>
        </select>
        <span class="ori-select__chevron" aria-hidden="true"><!-- chevron SVG --></span>
    </div>
    <div class="ori-select ori-color ori-color_primary ori-font-size ori-font-size_md">
        <select
            name="state"
            class="ori-select__control ori-size-action ori-size-action_md ori-size-radius ori-size-radius_md"
        >
            <option value="" disabled selected>State / Province</option>
            <option value="idf">Île-de-France</option>
            <option value="bay">Bavaria</option>
        </select>
        <span class="ori-select__chevron" aria-hidden="true"><!-- chevron SVG --></span>
    </div>
</div>
```

::

## Accessibility

The accessibility contract holds across every layer — the standalone classes and the Vue component
render the same attributes.

- The control is a native `<select>`, so the browser provides the complete dropdown, full keyboard
  interaction (arrow keys, type-ahead, Home/End), and all ARIA semantics — no custom widget needed.
- State is real attributes: native `disabled` and `aria-invalid="true"` (not classes), styled with
  attribute selectors (`:disabled`, `[aria-invalid='true']`).
- The control has a stable `useId()`-based `id` so a caller's `<label for="…">` can name it without
  needing to pass an explicit `id` prop. Pass `aria-label` or `aria-labelledby` as a fallback for
  labelless contexts — they fall through to the `<select>`.
- The chevron is `aria-hidden="true"` and `pointer-events: none` — it is never announced and never
  intercepts clicks or keyboard events.
- The placeholder renders as a `disabled` `<option>` so it cannot be re-selected once the user makes
  a choice.
- Arbitrary native attrs (`name`, `required`, `autocomplete`, `aria-label`, `aria-labelledby`, …)
  fall through via `inheritAttrs: false` + `v-bind="$attrs"` directly to the `<select>` element.
- Focus is always visible: `:focus` shows a tokenized border + `box-shadow` ring reading
  `--ori-color` (the control sits on the page, not on a fill surface). When `invalid`, the ring uses
  the danger color.

| Key                 | Action                                              |
| ------------------- | --------------------------------------------------- |
| `Tab` / `Shift+Tab` | Moves focus to / away from the control.             |
| `Space` / `Enter`   | Opens the dropdown (browser-native).                |
| `Arrow Up` / `Down` | Cycles through options; navigates the open list.    |
| `Home` / `End`      | Jumps to the first / last option.                   |
| Type-ahead          | Selects the first option beginning with typed char. |
| `Escape`            | Closes the dropdown without changing selection.     |

## Framework API

The props, events, slots, and attribute passthrough of the **Vue** component. The standalone CSS
layer has no component API — its surface is the [classes](#classes) above. (Svelte bindings are
planned.)

### Props

| Prop          | Type                                                                    | Default     | Description                                                                                                        |
| ------------- | ----------------------------------------------------------------------- | ----------- | ------------------------------------------------------------------------------------------------------------------ |
| `color`       | `ThemeColor`                                                            | `'primary'` | Accent that drives the focus-ring/border color via the ori-color utility (repoints `--ori-color`).                 |
| `disabled`    | `boolean`                                                               | `false`     | Disables the control via the real native `disabled` attribute (styled with `:disabled`).                           |
| `id`          | `string`                                                                | `useId()`   | Id applied to the native `<select>`; defaults to an SSR-safe `useId()` so an external `<label for>` can target it. |
| `invalid`     | `boolean`                                                               | `false`     | Marks the control invalid via `aria-invalid="true"`; styled with a danger border and ring.                         |
| `options`     | `Array<{ label: string; value: string \| number; disabled?: boolean }>` | `[]`        | Options rendered as `<option>` elements. Ignored when a default slot is provided.                                  |
| `placeholder` | `string`                                                                | —           | Renders a disabled, selected-by-default first `<option value="">` as a non-selectable prompt.                      |
| `radius`      | `RadiusSize`                                                            | `'md'`      | Border radius via the `ori-size-radius` alias (`zero` · xs · sm · md · lg · xl · rounded).                         |
| `size`        | `ActionSize`                                                            | `'md'`      | Control height (`ori-size-action` alias) and font-size (`ori-font-size` alias) (`xs`–`xxl`).                       |

### Events & attributes

`v-model` binds to a `string | number` via `defineModel<string | number>()` — it reads the
`modelValue` prop and emits `update:modelValue` on change:

```vue
<OriSelect v-model="selected" :options="options" />
```

OriSelect sets `inheritAttrs: false` and spreads `$attrs` onto the underlying `<select>`, so native
attributes and listeners pass through directly to the field element — not the wrapper `<div>`:

- Attributes: `name`, `required`, `autocomplete`, `aria-label`, `aria-labelledby`, …
- Listeners: `@change`, `@focus`, `@blur`, …

### Slots

| Slot      | Scope | Description                                                                                                                                           |
| --------- | ----- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| `default` | none  | Hand-written `<option>` / `<optgroup>` markup. When present it replaces the `options`-prop rendering; the placeholder option still renders before it. |
