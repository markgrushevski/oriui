---
title: Radio
---

# RadioGroup

A "choose one" compound control. A `role="radiogroup"` container names the set via
`aria-labelledby`; each option is a real `<input type="radio">` sharing a single `name` — so the
browser enforces single-select and native form submission — visually hidden behind a styled circle.
Pass the options as an array; per-option `disabled` is supported.

The examples are organised by **layer**: the [class reference](#classes) is the standalone
**`@oriui/css`** layer, and the [Framework API](#framework-api) is the **`@oriui/vue`** component. Every
example is live — flip its code between **HTML** (the standalone classes, also your htmx / Astro / Svelte /
plain-HTML usage), **Vue**, and **Svelte** _(soon)_; HTML is the default.

## Classes

The group is a block class plus single-class token utilities — one class repoints one token, no base
class needed. The Vue props in [Framework API](#framework-api) map 1:1 to these.

<!-- prettier-ignore -->
:class-table{:rows='[{"class":"ori-radio-group","type":"Block","description":"Required base class on the container; carries role=radiogroup."},{"class":"ori-color_*","type":"Color","description":"<b>primary</b> · secondary · success · warn · danger · info · surface"},{"class":"ori-font-size_*","type":"Size","description":"xs · sm · <b>md</b> · lg · xl · xxl — scales all option labels."},{"class":"ori-radio-group_inline","type":"Layout","description":"Lays options out in a row (flex-wrap) instead of a column."},{"class":"ori-radio-group__label","type":"Part","description":"Group label element; referenced by aria-labelledby."},{"class":"ori-radio-group__options","type":"Part","description":"Options wrapper; flex column (or row when _inline)."},{"class":"ori-radio","type":"Part","description":"Wrapping <label> for each option. Add ori-radio_disabled when disabled."},{"class":"ori-radio__input · ori-radio__circle · ori-radio__label","type":"Part","description":"Hidden native input / styled circle indicator / visible label text."},{"class":"disabled · aria-required","type":"State","description":"Real attributes on the native input / container, not extra classes."}]'}

## Anatomy

```
div.ori-radio-group  [role="radiogroup", aria-labelledby]
  div.ori-radio-group__label          ← group heading (optional)
  div.ori-radio-group__options
    label.ori-radio                   ← one per option
      input.ori-radio__input          ← visually hidden real radio
      span.ori-radio__circle          ← styled indicator (aria-hidden)
      span.ori-radio__label           ← visible label text
```

## Basic

::example
:ori-radio-group{label="Choose a plan" :options='[{"label":"Free","value":"free"},{"label":"Pro","value":"pro"},{"label":"Team","value":"team"}]'}

#vue

```vue
<OriRadioGroup
    v-model="plan"
    label="Choose a plan"
    :options="[
        { label: 'Free', value: 'free' },
        { label: 'Pro', value: 'pro' },
        { label: 'Team', value: 'team' }
    ]"
/>
```

#html

```html
<div class="ori-radio-group ori-color_primary ori-font-size_md" role="radiogroup" aria-labelledby="plan-label">
    <div id="plan-label" class="ori-radio-group__label">Choose a plan</div>
    <div class="ori-radio-group__options">
        <label class="ori-radio">
            <input class="ori-radio__input" type="radio" name="plan" value="free" />
            <span class="ori-radio__circle" aria-hidden="true"></span>
            <span class="ori-radio__label">Free</span>
        </label>
        <!-- one <label class="ori-radio"> per option, all sharing the same name -->
    </div>
</div>
```

::

## Colors

Every semantic role. The accent color is shared by the checked circle and the focus ring.

::example
:ori-radio-group{label="Primary" color="primary" :options='[{"label":"Option A","value":"a"},{"label":"Option B","value":"b"}]'}
:ori-radio-group{label="Success" color="success" :options='[{"label":"Option A","value":"a"},{"label":"Option B","value":"b"}]'}
:ori-radio-group{label="Danger" color="danger" :options='[{"label":"Option A","value":"a"},{"label":"Option B","value":"b"}]'}

#vue

```vue
<OriRadioGroup v-model="val" label="Primary" color="primary" :options="opts" />
<OriRadioGroup v-model="val" label="Success" color="success" :options="opts" />
<OriRadioGroup v-model="val" label="Danger" color="danger" :options="opts" />
```

#html

```html
<!-- swap the color: ori-color_primary → _success / _danger / _warn / _info -->
<div class="ori-radio-group ori-color_success ori-font-size_md" role="radiogroup">…</div>
```

::

## Sizes

`xs` → `xxl`. The size class controls `font-size`, which scales the circle and the gap uniformly
via `em` units.

::example
:ori-radio-group{label="xs" size="xs" :options='[{"label":"Option A","value":"a"},{"label":"Option B","value":"b"}]'}
:ori-radio-group{label="sm" size="sm" :options='[{"label":"Option A","value":"a"},{"label":"Option B","value":"b"}]'}
:ori-radio-group{label="md (default)" size="md" :options='[{"label":"Option A","value":"a"},{"label":"Option B","value":"b"}]'}
:ori-radio-group{label="lg" size="lg" :options='[{"label":"Option A","value":"a"},{"label":"Option B","value":"b"}]'}

#vue

```vue
<OriRadioGroup v-model="val" label="xs" size="xs" :options="opts" />
<OriRadioGroup v-model="val" label="md (default)" size="md" :options="opts" />
<OriRadioGroup v-model="val" label="lg" size="lg" :options="opts" />
```

#html

```html
<!-- swap the size: ori-font-size_md → _xs / _sm / _lg / _xl / _xxl -->
<div class="ori-radio-group ori-color_primary ori-font-size_lg" role="radiogroup">…</div>
```

::

## Inline

`inline` lays the options out in a wrapping row instead of a column — useful for short label sets.

::example
:ori-radio-group{label="Notifications" :inline="true" :options='[{"label":"All","value":"all"},{"label":"Mentions","value":"mentions"},{"label":"None","value":"none"}]'}

#vue

```vue
<OriRadioGroup v-model="notify" label="Notifications" inline :options="notifyOptions" />
```

#html

```html
<!-- add ori-radio-group_inline to the container -->
<div
    class="ori-radio-group ori-radio-group_inline ori-color_primary ori-font-size_md"
    role="radiogroup"
    aria-labelledby="notify-label"
>
    <div id="notify-label" class="ori-radio-group__label">Notifications</div>
    <div class="ori-radio-group__options">
        <label class="ori-radio">…</label>
        <label class="ori-radio">…</label>
        <label class="ori-radio">…</label>
    </div>
</div>
```

::

## Disabled — whole group

Pass `disabled` to lock all options at once.

::example
:ori-radio-group{label="Plan (locked)" :disabled="true" :options='[{"label":"Free","value":"free"},{"label":"Pro","value":"pro"},{"label":"Team","value":"team"}]'}

#vue

```vue
<OriRadioGroup v-model="plan" label="Plan (locked)" disabled :options="planOptions" />
```

#html

```html
<div class="ori-radio-group ori-color_primary ori-font-size_md" role="radiogroup">
    <div class="ori-radio-group__label">Plan (locked)</div>
    <div class="ori-radio-group__options">
        <!-- each label gets ori-radio_disabled; each input gets the disabled attribute -->
        <label class="ori-radio ori-radio_disabled">
            <input class="ori-radio__input" type="radio" name="plan" value="free" disabled />
            <span class="ori-radio__circle" aria-hidden="true"></span>
            <span class="ori-radio__label">Free</span>
        </label>
    </div>
</div>
```

::

## Disabled — per option

Set `disabled: true` on individual items in the `options` array to lock only those choices.

::example
:ori-radio-group{label="Choose a plan" :options='[{"label":"Free","value":"free"},{"label":"Pro","value":"pro"},{"label":"Enterprise (contact us)","value":"enterprise","disabled":true}]'}

#vue

```vue
<OriRadioGroup
    v-model="plan"
    label="Choose a plan"
    :options="[
        { label: 'Free', value: 'free' },
        { label: 'Pro', value: 'pro' },
        { label: 'Enterprise (contact us)', value: 'enterprise', disabled: true }
    ]"
/>
```

#html

```html
<!-- only the disabled option's label + input get the modifier/attribute -->
<label class="ori-radio ori-radio_disabled">
    <input class="ori-radio__input" type="radio" name="plan" value="enterprise" disabled />
    <span class="ori-radio__circle" aria-hidden="true"></span>
    <span class="ori-radio__label">Enterprise (contact us)</span>
</label>
```

::

## Required

`required` sets `aria-required="true"` on the group and the `required` attribute on each input.

::example
:ori-radio-group{label="Preferred contact" :required="true" :options='[{"label":"Email","value":"email"},{"label":"Phone","value":"phone"},{"label":"Post","value":"post"}]'}

#vue

```vue
<OriRadioGroup v-model="contact" label="Preferred contact" required :options="contactOptions" />
```

#html

```html
<div
    class="ori-radio-group ori-color_primary ori-font-size_md"
    role="radiogroup"
    aria-labelledby="contact-label"
    aria-required="true"
>
    <div id="contact-label" class="ori-radio-group__label">Preferred contact</div>
    <div class="ori-radio-group__options">
        <label class="ori-radio">
            <input class="ori-radio__input" type="radio" name="contact" value="email" required />
            …
        </label>
    </div>
</div>
```

::

## Common patterns

Color, size, inline layout, and per-option disabled in a compact panel.

::example
:ori-radio-group{label="Theme" :inline="true" color="secondary" size="sm" :options='[{"label":"Light","value":"light"},{"label":"Dark","value":"dark"},{"label":"System","value":"system"}]'}

#vue

```vue
<OriRadioGroup
    v-model="theme"
    label="Theme"
    inline
    color="secondary"
    size="sm"
    :options="[
        { label: 'Light', value: 'light' },
        { label: 'Dark', value: 'dark' },
        { label: 'System', value: 'system' }
    ]"
/>
```

#html

```html
<div
    class="ori-radio-group ori-radio-group_inline ori-color_secondary ori-font-size_sm"
    role="radiogroup"
    aria-labelledby="theme-label"
>
    <div id="theme-label" class="ori-radio-group__label">Theme</div>
    <div class="ori-radio-group__options">
        <label class="ori-radio">
            <input class="ori-radio__input" type="radio" name="theme" value="light" />
            <span class="ori-radio__circle" aria-hidden="true"></span>
            <span class="ori-radio__label">Light</span>
        </label>
        <!-- … Dark, System -->
    </div>
</div>
```

::

## Accessibility

The accessibility contract holds across every layer — the standalone classes and the Vue component
render the same attributes and keyboard behaviour.

- The root element carries `role="radiogroup"`. When `label` is provided, `aria-labelledby` points
  at the rendered label element; without a `label`, pass `aria-label` as a fallthrough attribute.
- Every option is a real `<input type="radio">` sharing one `name` (auto-generated via `useId`
  when omitted). The browser natively enforces single-select, arrow-key navigation between options
  in the group, and form submission — no JS needed.
- The visual `ori-radio__circle` is `aria-hidden="true"`; the accessible name comes from the
  adjacent `ori-radio__label` text, wired through the `<label>` wrapper.
- `disabled` (group-level or per-option) sets the native `disabled` attribute on the `<input>`.
- `required` sets both the native `required` attribute on each input and `aria-required="true"` on
  the group container.
- Focus is always visible via `:focus-visible` on the hidden `<input>`, reflected onto the
  `ori-radio__circle` with a 2 px `outline` in the group's accent color.

| Key          | Action                                            |
| ------------ | ------------------------------------------------- |
| `Tab`        | Moves focus into / out of the radio group.        |
| `Arrow keys` | Cycles between options within the group (native). |
| `Space`      | Selects the focused option (native).              |

## Framework API

The props, events, and slots of the **Vue** component. The standalone CSS layer has no component
API — its surface is the [classes](#classes) above. (Svelte bindings are planned.)

### Props

| Prop       | Type            | Default     | Description                                                                          |
| ---------- | --------------- | ----------- | ------------------------------------------------------------------------------------ |
| `color`    | `ThemeColor`    | `'primary'` | Accent color for the checked circle and focus ring.                                  |
| `disabled` | `boolean`       | `false`     | Disables all options; per-option disable is also supported via `options[].disabled`. |
| `inline`   | `boolean`       | `false`     | Lays options out in a wrapping row (`ori-radio-group_inline`).                       |
| `label`    | `string`        | —           | Group heading. When present the container is `aria-labelledby` this element.         |
| `name`     | `string`        | —           | Shared `name` for all radio inputs. Auto-generated via `useId` when omitted.         |
| `options`  | `RadioOption[]` | `[]`        | Array of `{ label, value, disabled? }` objects — the full options-array API.         |
| `required` | `boolean`       | `false`     | Sets `aria-required="true"` on the group and `required` on each input.               |
| `size`     | `ActionSize`    | `'md'`      | Font size scale (`xs`–`xxl`); the circle and gap scale with it via `em` units.       |

`RadioOption` shape: `{ label: string; value: string | number; disabled?: boolean }`.

### Events & attributes

`v-model` is the public state binding — prop `modelValue` holds the currently selected `value`, and
the component emits `update:modelValue` when the user picks another option. The `name` attribute is
shared across all native inputs; omit it to let the component auto-generate a unique id via `useId`.

The component does **not** set `inheritAttrs: false`, so extra attributes (e.g. `aria-label`,
`class`, `data-*`) fall through to the root `div.ori-radio-group`. An unlabelled group should
pass `aria-label` this way:

```vue
<OriRadioGroup v-model="val" aria-label="Sort order" :options="sortOptions" />
```

### Slots

| Slot | Description                                                                                 |
| ---- | ------------------------------------------------------------------------------------------- |
| —    | OriRadioGroup has no slots. Options are rendered exclusively from the `options` prop array. |
