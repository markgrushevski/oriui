---
title: Checkbox
---

# Checkbox

A styled, accessible checkbox built on a **real `<input type="checkbox">`** — kept in the DOM
(visually hidden over a custom box) so keyboard, focus, and native form submission work for free.
The accent color and `:focus-visible` ring are driven by the `ori-color` token; `invalid` sets
`aria-invalid`; `disabled` is the native attribute.

Every example is live and shows the standalone **HTML / `oriui/css`** markup by default — the same
classes you'd use in htmx, Astro, Svelte, or plain HTML. Flip any example to **Vue** for the styled
component, where `v-model` accepts a boolean for a single box or an array (with `value`) for a native
group.

## Classes

A checkbox is a block class on the `<label>` wrapper plus paired token utilities — each pair is a
base class (`ori-color`) and a scale value (`ori-color_primary`), so one class repoints one token.
The Vue props in [Framework API](#framework-api) map 1:1 to these.

:class-table{:rows='[{"class":"ori-checkbox","type":"Block","description":"Required base class — applied to the <label> wrapper."},{"class":"ori-color + ori-color_*","type":"Color","description":"<b>primary</b> · secondary · success · warn · danger · info · surface · background"},{"class":"ori-font-size + ori-font-size_*","type":"Size","description":"xs · sm · <b>md</b> · lg · xl · xxl · text (box and label scale together off the font size)"},{"class":"ori-checkbox__input","type":"Part","description":"the visually-hidden native input type=checkbox"},{"class":"ori-checkbox__box","type":"Part","description":"the visible styled square; aria-hidden"},{"class":"ori-checkbox__label","type":"Part","description":"the text label rendered next to the box"},{"class":"ori-checkbox_disabled","type":"State","description":"added by the component when disabled; dims the wrapper"},{"class":"disabled · aria-invalid","type":"State","description":"real attributes on the input, not classes"}]'}

## Colors

Every semantic color role. The accent fill and focus ring track `ori-color`.

::example
:ori-checkbox{label="Primary" color="primary"}
:ori-checkbox{label="Secondary" color="secondary"}
:ori-checkbox{label="Success" color="success"}
:ori-checkbox{label="Warn" color="warn"}
:ori-checkbox{label="Danger" color="danger"}
:ori-checkbox{label="Info" color="info"}

#html

```html
<label class="ori-checkbox ori-color ori-color_primary ori-font-size ori-font-size_md" for="c1">
    <input id="c1" type="checkbox" class="ori-checkbox__input" />
    <span class="ori-checkbox__box" aria-hidden="true"></span>
    <span class="ori-checkbox__label">Primary</span>
</label>
<!-- swap the color pair: ori-color_primary → _success / _danger / _info / … -->
```

#vue

```vue
<OriCheckbox v-model="checked" label="Primary" color="primary" />
<OriCheckbox v-model="checked" label="Success" color="success" />
<OriCheckbox v-model="checked" label="Danger" color="danger" />
<OriCheckbox v-model="checked" label="Info" color="info" />
```

::

## Sizes

`xs` → `xxl`. The box and label scale together because `ori-font-size` is set on the wrapper and
the box dimensions use `em` units.

::example
:ori-checkbox{label="xs" size="xs"}
:ori-checkbox{label="sm" size="sm"}
:ori-checkbox{label="md" size="md"}
:ori-checkbox{label="lg" size="lg"}
:ori-checkbox{label="xl" size="xl"}

#html

```html
<!-- box and label scale together off ori-font-size -->
<label class="ori-checkbox ori-color ori-color_primary ori-font-size ori-font-size_sm" for="sm1">
    <input id="sm1" type="checkbox" class="ori-checkbox__input" />
    <span class="ori-checkbox__box" aria-hidden="true"></span>
    <span class="ori-checkbox__label">sm</span>
</label>
<label class="ori-checkbox ori-color ori-color_primary ori-font-size ori-font-size_xl" for="xl1">
    <input id="xl1" type="checkbox" class="ori-checkbox__input" />
    <span class="ori-checkbox__box" aria-hidden="true"></span>
    <span class="ori-checkbox__label">xl</span>
</label>
```

#vue

```vue
<OriCheckbox v-model="checked" label="sm" size="sm" />
<OriCheckbox v-model="checked" label="md" size="md" />
<OriCheckbox v-model="checked" label="xl" size="xl" />
```

::

## States

`disabled` is the native attribute; `invalid` sets `aria-invalid="true"` on the input.

::example
:ori-checkbox{label="Default"}
:ori-checkbox{label="Disabled" :disabled="true"}
:ori-checkbox{label="Invalid" :invalid="true"}
:ori-checkbox{label="Required" :required="true"}

#html

```html
<label class="ori-checkbox ori-checkbox_disabled ori-color ori-color_primary ori-font-size ori-font-size_md" for="d1">
    <input id="d1" type="checkbox" class="ori-checkbox__input" disabled />
    <span class="ori-checkbox__box" aria-hidden="true"></span>
    <span class="ori-checkbox__label">Disabled</span>
</label>

<label class="ori-checkbox ori-color ori-color_primary ori-font-size ori-font-size_md" for="inv1">
    <input id="inv1" type="checkbox" class="ori-checkbox__input" aria-invalid="true" />
    <span class="ori-checkbox__box" aria-hidden="true"></span>
    <span class="ori-checkbox__label">Invalid</span>
</label>
```

#vue

```vue
<!-- disabled — native attribute, dims wrapper via ori-checkbox_disabled -->
<OriCheckbox v-model="checked" label="Disabled" disabled />

<!-- invalid — sets aria-invalid="true" on the <input> -->
<OriCheckbox v-model="checked" label="Invalid" invalid />

<!-- required — sets required on the <input> -->
<OriCheckbox v-model="checked" label="Required" required />
```

::

## Color × size

Color and size compose freely.

::example
:ori-checkbox{label="Danger lg" color="danger" size="lg"}
:ori-checkbox{label="Success sm" color="success" size="sm"}
:ori-checkbox{label="Info xl" color="info" size="xl"}

#html

```html
<label class="ori-checkbox ori-color ori-color_danger ori-font-size ori-font-size_lg" for="dl1">
    <input id="dl1" type="checkbox" class="ori-checkbox__input" />
    <span class="ori-checkbox__box" aria-hidden="true"></span>
    <span class="ori-checkbox__label">Danger lg</span>
</label>
```

#vue

```vue
<OriCheckbox v-model="checked" label="Danger lg" color="danger" size="lg" />
<OriCheckbox v-model="checked" label="Success sm" color="success" size="sm" />
<OriCheckbox v-model="checked" label="Info xl" color="info" size="xl" />
```

::

## Checkbox group (array v-model)

Pass `value` on each checkbox and bind a shared array model. The native checkbox group mechanism
handles checked state — no extra logic needed.

::example
:ori-checkbox{label="Option A" value="a"}
:ori-checkbox{label="Option B" value="b"}
:ori-checkbox{label="Option C" value="c"}

#html

```html
<!-- array binding is Vue-specific; in plain HTML use a name attribute for the group -->
<label class="ori-checkbox ori-color ori-color_primary ori-font-size ori-font-size_md" for="a">
    <input id="a" type="checkbox" class="ori-checkbox__input" name="opts" value="a" />
    <span class="ori-checkbox__box" aria-hidden="true"></span>
    <span class="ori-checkbox__label">Option A</span>
</label>
<label class="ori-checkbox ori-color ori-color_primary ori-font-size ori-font-size_md" for="b">
    <input id="b" type="checkbox" class="ori-checkbox__input" name="opts" value="b" />
    <span class="ori-checkbox__box" aria-hidden="true"></span>
    <span class="ori-checkbox__label">Option B</span>
</label>
```

#vue

```vue
<script setup>
import { ref } from 'vue';
const selected = ref([]);
</script>

<template>
    <OriCheckbox v-model="selected" label="Option A" value="a" />
    <OriCheckbox v-model="selected" label="Option B" value="b" />
    <OriCheckbox v-model="selected" label="Option C" value="c" />
    <p>Selected: {{ selected }}</p>
</template>
```

::

## Common patterns

A real-world terms-and-conditions gate — `required` + `invalid` give the user feedback before
submit.

::example
:ori-checkbox{label="I agree to the terms and conditions" :required="true"}

#html

```html
<form>
    <label class="ori-checkbox ori-color ori-color_primary ori-font-size ori-font-size_md" for="terms">
        <input id="terms" type="checkbox" class="ori-checkbox__input" required />
        <span class="ori-checkbox__box" aria-hidden="true"></span>
        <span class="ori-checkbox__label">I agree to the terms and conditions</span>
    </label>
    <button type="submit">Continue</button>
</form>
```

#vue

```vue
<script setup>
import { ref } from 'vue';
const agreed = ref(false);
const submitted = ref(false);

function submit() {
    submitted.value = true;
    if (agreed.value) {
        // proceed
    }
}
</script>

<template>
    <form @submit.prevent="submit">
        <OriCheckbox
            v-model="agreed"
            label="I agree to the terms and conditions"
            required
            :invalid="submitted && !agreed"
        />
        <button type="submit">Continue</button>
    </form>
</template>
```

::

## Accessibility

The accessibility contract holds across every layer — the standalone classes and the Vue component
render the same attributes and keyboard behaviour.

- A real `<input type="checkbox">` drives all keyboard and form behavior; the visual `__box` is
  `aria-hidden="true"`.
- The wrapping `<label>` has its `for` attribute linked to the input `id` (auto-generated via
  `useId()`, overridable with the `id` prop) — clicking anywhere on the label or its text toggles
  the checkbox.
- Focus is visible via `:focus-visible` on the `__box` (2 px outline using `var(--ori-color)`); the
  ring never appears on mouse click.
- `disabled` is the real native attribute — the input is excluded from tab order and form submission
  automatically; the wrapper dims via `ori-checkbox_disabled`.
- `invalid` sets `aria-invalid="true"` on the input; pair it with an `aria-describedby` pointing at
  visible error text for a complete a11y contract.

| Key     | Action                                   |
| ------- | ---------------------------------------- |
| `Tab`   | Moves focus to / away from the checkbox. |
| `Space` | Toggles the checked state.               |

## Framework API

The props, events, and slots of the **Vue** component. The standalone CSS layer has no component
API — its surface is the [classes](#classes) above. (Svelte bindings are planned.)

### Props

| Prop       | Type               | Default     | Description                                                                                    |
| ---------- | ------------------ | ----------- | ---------------------------------------------------------------------------------------------- |
| `color`    | `ThemeColor`       | `'primary'` | Accent color for the checked fill and focus ring.                                              |
| `disabled` | `boolean`          | `false`     | Native `disabled` on the input; adds `ori-checkbox_disabled` (opacity) to the wrapper.         |
| `id`       | `string`           | —           | Overrides the auto-generated `useId()` for the input/label pair.                               |
| `invalid`  | `boolean`          | —           | Sets `aria-invalid="true"` on the input to signal a validation error.                          |
| `label`    | `string`           | —           | Visible text rendered inside `ori-checkbox__label`. Omit when providing your own slot content. |
| `required` | `boolean`          | —           | Sets the native `required` attribute on the input.                                             |
| `size`     | `ActionSize`       | `'md'`      | Font (and therefore box) scale: `xs` · `sm` · `md` · `lg` · `xl` · `xxl` · `text`.             |
| `value`    | `string \| number` | —           | Bound to the array model for a native checkbox group; omit for a single boolean `v-model`.     |

### Events & attributes

OriCheckbox sets `inheritAttrs: false` and forwards `$attrs` directly to the `<input>` element
with `v-bind="$attrs"`. This means native listeners and HTML attributes bind to the real input, not
the outer `<label>`:

- `@change`, `@focus`, `@blur` — fire on the `<input>`
- `name`, `form`, `autocomplete`, `aria-describedby` — forwarded to the `<input>`

The two-way binding is handled by `defineModel` — use `v-model` for boolean (single) or array
(group) state; the component emits `update:modelValue` internally.

### Slots

| Slot      | Description                                                                                                |
| --------- | ---------------------------------------------------------------------------------------------------------- |
| `default` | The component renders its label via the `label` prop, not a slot. There is no default slot on OriCheckbox. |
