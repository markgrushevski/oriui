---
title: Segmented control
---

# SegmentedControl

A compact "choose one" row — Light / Dark / Auto. It is built like [RadioGroup](/components/radio): a
`role="radiogroup"` of real `<input type="radio">` sharing one `name`, each input hidden over its segment.
So the browser gives you the behavior — arrow keys that move **and** select, a single Tab stop on the checked
segment, native form submission and RTL — and the CSS layer carries no JavaScript at all.

Once a segment is picked, one stays picked: a radio cannot be unchecked, so there is no deselect. A row you
can switch fully off is a toggle group — use the [Toolbar](/components/toolbar)'s.

The examples are organized by **layer**: the [class reference](#classes) is the standalone
**`@oriui/css`** layer, and the [Framework API](#framework-api) is the **`@oriui/vue`** component. Every
example is live — flip its code between **HTML** (the standalone classes, also your htmx / Astro / Svelte /
plain-HTML usage), **Vue**; HTML is the default.

## When to use

| Control                                | Pick it when                                                                                  |
| -------------------------------------- | --------------------------------------------------------------------------------------------- |
| **SegmentedControl**                   | A short row (two to five) of one-word choices, all visible at once — a mode, a view, a range. |
| [RadioGroup](/components/radio)        | A list of labeled circles of any length, stacked vertically, with room for a longer label.    |
| [Tabs](/components/tabs)               | Segments that switch **panels** of content; the selection is navigation, not a setting.       |
| [Toolbar](/components/toolbar) toggles | A row where nothing may be selected, or several things at once.                               |

## Classes

The control is a block class plus single-class token utilities — one class repoints one token, no base
class needed. The Vue props in [Framework API](#framework-api) map 1:1 to these.

<!-- prettier-ignore -->
:class-table{:rows='[{"class":"ori-segmented-control","type":"Block","description":"Required base class on the container; carries role=radiogroup."},{"class":"ori-color_*","type":"Color","description":"<b>primary</b> · secondary · success · warning · danger · info · surface — the checked fill, its edge tone and the focus ring."},{"class":"ori-segmented-control_* (size)","type":"Size","description":"inherit · xs · sm · <b>md</b> · lg · xl · xxl — the control height, from the action-size scale."},{"class":"ori-font-size_*","type":"Font","description":"xs · sm · <b>md</b> · lg · xl · xxl — scales the text; segment padding and gap follow in em."},{"class":"ori-size-radius_*","type":"Radius","description":"none · xs · sm · <b>md</b> · lg · xl · full — the track radius; segments sit 3px inside it."},{"class":"ori-segmented-control_fluid","type":"Layout","description":"Stretches to the container width; segments stay equal."},{"class":"ori-segmented-control__label","type":"Part","description":"Group label element; referenced by aria-labelledby."},{"class":"ori-segmented-control__track","type":"Part","description":"The tinted track; an equal-column grid that holds the segments."},{"class":"ori-segmented-control__item","type":"Part","description":"Wrapping <label> for each segment."},{"class":"ori-segmented-control__input · ori-segmented-control__icon · ori-segmented-control__text","type":"Part","description":"Hidden native radio laid over the segment / optional leading icon / segment text."},{"class":"disabled · checked · aria-required","type":"State","description":"Real attributes on the native input / container, not extra classes."}]'}

**À la carte:** the classes above ship in `@oriui/css/components/segmented-control.css`. Import a foundation
(`@oriui/css/base.css` or `@oriui/css/tokens.css`) first — the token utilities (`ori-color_*`,
`ori-size-radius_*`, …) live there, not in the component file. The full bundle `@oriui/css` is the default and
already carries both; see [à-la-carte imports](/guides/css).

Accent `primary`, size `md` and radius `md` are baked in at zero specificity, so a bare `ori-segmented-control`
is already complete and one utility class repoints any of them. The checked fill, the focus ring and the
disabled dimming read the input's real state through `:has()` — Chrome 105, Safari 15.4, Firefox 121 and later.

## Anatomy

```
div.ori-segmented-control  [role="radiogroup", aria-labelledby]
  div.ori-segmented-control__label        ← group heading (optional)
  div.ori-segmented-control__track        ← tinted track, equal-width grid
    label.ori-segmented-control__item     ← one per segment
      input.ori-segmented-control__input  ← visually hidden real radio, laid over the segment
      i.ori-segmented-control__icon       ← leading icon (optional, aria-hidden)
      span.ori-segmented-control__text    ← visible segment text
```

## Basic

Equal-width segments, as wide as the widest one, on a tinted track. The checked segment is filled with the
accent.

::example
:ori-segmented-control{label="Theme" model-value="light" :options='[{"label":"Light","value":"light"},{"label":"Dark","value":"dark"},{"label":"Auto","value":"auto"}]'}

#vue

```vue
<OriSegmentedControl
    v-model="theme"
    label="Theme"
    :options="[
        { label: 'Light', value: 'light' },
        { label: 'Dark', value: 'dark' },
        { label: 'Auto', value: 'auto' }
    ]"
/>
```

#html

```html
<!-- accent primary, size md and radius md are the baked defaults -->
<div class="ori-segmented-control" role="radiogroup" aria-labelledby="theme-label">
    <div id="theme-label" class="ori-segmented-control__label">Theme</div>
    <div class="ori-segmented-control__track">
        <label class="ori-segmented-control__item">
            <input class="ori-segmented-control__input" type="radio" name="theme" value="light" checked />
            <span class="ori-segmented-control__text">Light</span>
        </label>
        <label class="ori-segmented-control__item">
            <input class="ori-segmented-control__input" type="radio" name="theme" value="dark" />
            <span class="ori-segmented-control__text">Dark</span>
        </label>
        <label class="ori-segmented-control__item">
            <input class="ori-segmented-control__input" type="radio" name="theme" value="auto" />
            <span class="ori-segmented-control__text">Auto</span>
        </label>
    </div>
</div>
```

::

Every group on a page needs its own `name` — it is what makes the radios one group. The component generates
one (`useId`) when you do not pass `name`; in plain HTML you write it.

## Colors

Every semantic role. The accent paints the checked segment's fill and the focus ring.

The checked segment also gets an **edge in the role's text tone** (`--ori-color-text`). That edge is not
decoration: the fill alone does not stand out 3:1 from the track in every role and theme — a warning fill, or
any role in dark mode, measures under 3:1 — so without the edge the checked state would fail WCAG 1.4.11
(non-text contrast). Do not remove it when restyling.

::example
:ori-segmented-control{label="Primary" color="primary" model-value="a" :options='[{"label":"Option A","value":"a"},{"label":"Option B","value":"b"}]'}
:ori-segmented-control{label="Secondary" color="secondary" model-value="a" :options='[{"label":"Option A","value":"a"},{"label":"Option B","value":"b"}]'}
:ori-segmented-control{label="Success" color="success" model-value="a" :options='[{"label":"Option A","value":"a"},{"label":"Option B","value":"b"}]'}
:ori-segmented-control{label="Warning" color="warning" model-value="a" :options='[{"label":"Option A","value":"a"},{"label":"Option B","value":"b"}]'}
:ori-segmented-control{label="Danger" color="danger" model-value="a" :options='[{"label":"Option A","value":"a"},{"label":"Option B","value":"b"}]'}
:ori-segmented-control{label="Info" color="info" model-value="a" :options='[{"label":"Option A","value":"a"},{"label":"Option B","value":"b"}]'}
:ori-segmented-control{label="Surface" color="surface" model-value="a" :options='[{"label":"Option A","value":"a"},{"label":"Option B","value":"b"}]'}

#vue

```vue
<OriSegmentedControl v-model="val" label="Primary" color="primary" :options="opts" />
<OriSegmentedControl v-model="val" label="Success" color="success" :options="opts" />
<OriSegmentedControl v-model="val" label="Warning" color="warning" :options="opts" />
<OriSegmentedControl v-model="val" label="Danger" color="danger" :options="opts" />
```

#html

```html
<!-- swap the color: ori-color_primary → _secondary / _success / _warning / _danger / _info / _surface -->
<div class="ori-segmented-control ori-color_success" role="radiogroup" aria-labelledby="mode-label">…</div>
```

::

## Sizes

`xs` → `xxl`. The size sets the control's height from the action-size scale — `xs` 1.25rem, `sm` 1.5rem, `md`
2.75rem, `lg` 3rem, `xl` 3.75rem, `xxl` 4.25rem — and the text scales with it.

::example
:ori-segmented-control{label="xs" size="xs" model-value="week" :options='[{"label":"Day","value":"day"},{"label":"Week","value":"week"},{"label":"Month","value":"month"}]'}
:ori-segmented-control{label="sm" size="sm" model-value="week" :options='[{"label":"Day","value":"day"},{"label":"Week","value":"week"},{"label":"Month","value":"month"}]'}
:ori-segmented-control{label="md (default)" size="md" model-value="week" :options='[{"label":"Day","value":"day"},{"label":"Week","value":"week"},{"label":"Month","value":"month"}]'}
:ori-segmented-control{label="lg" size="lg" model-value="week" :options='[{"label":"Day","value":"day"},{"label":"Week","value":"week"},{"label":"Month","value":"month"}]'}
:ori-segmented-control{label="xl" size="xl" model-value="week" :options='[{"label":"Day","value":"day"},{"label":"Week","value":"week"},{"label":"Month","value":"month"}]'}
:ori-segmented-control{label="xxl" size="xxl" model-value="week" :options='[{"label":"Day","value":"day"},{"label":"Week","value":"week"},{"label":"Month","value":"month"}]'}

#vue

```vue
<OriSegmentedControl v-model="range" label="xs" size="xs" :options="ranges" />
<OriSegmentedControl v-model="range" label="md (default)" size="md" :options="ranges" />
<OriSegmentedControl v-model="range" label="xxl" size="xxl" :options="ranges" />
```

#html

```html
<!-- the Vue size prop emits two classes: the height and the text scale. Set both. -->
<div
    class="ori-segmented-control ori-segmented-control_lg ori-font-size_lg"
    role="radiogroup"
    aria-labelledby="range-label"
>
    …
</div>
```

::

## Fluid

`fluid` stretches the control to its container. The segments stay equal, so they share the width evenly
instead of hugging their text.

::example
:ori-segmented-control{label="Billing" :fluid="true" model-value="yearly" :options='[{"label":"Monthly","value":"monthly"},{"label":"Yearly","value":"yearly"}]'}

#vue

```vue
<OriSegmentedControl
    v-model="billing"
    label="Billing"
    fluid
    :options="[
        { label: 'Monthly', value: 'monthly' },
        { label: 'Yearly', value: 'yearly' }
    ]"
/>
```

#html

```html
<!-- add ori-segmented-control_fluid to the container -->
<div class="ori-segmented-control ori-segmented-control_fluid" role="radiogroup" aria-labelledby="billing-label">
    <div id="billing-label" class="ori-segmented-control__label">Billing</div>
    <div class="ori-segmented-control__track">
        <label class="ori-segmented-control__item">
            <input class="ori-segmented-control__input" type="radio" name="billing" value="monthly" />
            <span class="ori-segmented-control__text">Monthly</span>
        </label>
        <label class="ori-segmented-control__item">
            <input class="ori-segmented-control__input" type="radio" name="billing" value="yearly" checked />
            <span class="ori-segmented-control__text">Yearly</span>
        </label>
    </div>
</div>
```

::

## Icons

Give an option an `icon` — an SVG path, drawn by [OriIcon](/components/icon) before the label.

::example
:ori-segmented-control{label="Theme" model-value="auto" :options='[{"label":"Light","value":"light","icon":"M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM11 2h2v3h-2zm0 17h2v3h-2zM2 11h3v2H2zm17 0h3v2h-3z"},{"label":"Dark","value":"dark","icon":"M12 3a9 9 0 1 0 9 9c0-.46-.04-.92-.1-1.36a5.389 5.389 0 0 1-4.4 2.26 5.403 5.403 0 0 1-3.14-9.8c-.44-.06-.9-.1-1.36-.1z"},{"label":"Auto","value":"auto","icon":"M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18V4c4.41 0 8 3.59 8 8s-3.59 8-8 8z"}]'}

#vue

```vue
<script setup lang="ts">
import type { SegmentedOption } from '@oriui/vue'

const sun = 'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM11 2h2v3h-2zm0 17h2v3h-2zM2 11h3v2H2zm17 0h3v2h-3z'
const moon =
    'M12 3a9 9 0 1 0 9 9c0-.46-.04-.92-.1-1.36a5.389 5.389 0 0 1-4.4 2.26 5.403 5.403 0 0 1-3.14-9.8c-.44-.06-.9-.1-1.36-.1z'
const auto = 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18V4c4.41 0 8 3.59 8 8s-3.59 8-8 8z'

const options: SegmentedOption[] = [
    { label: 'Light', value: 'light', icon: sun },
    { label: 'Dark', value: 'dark', icon: moon },
    { label: 'Auto', value: 'auto', icon: auto }
]
</script>

<template>
    <OriSegmentedControl v-model="theme" label="Theme" :options="options" />
</template>
```

#html

```html
<!-- the icon is an OriIcon: a decorative <i> carrying an inline SVG, laid before the text -->
<label class="ori-segmented-control__item">
    <input class="ori-segmented-control__input" type="radio" name="theme" value="light" />
    <i class="ori-icon ori-icon_inherit ori-segmented-control__icon" aria-hidden="true">
        <svg viewBox="0 0 24 24"><path d="M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM11 2h2v3h-2z…" /></svg>
    </i>
    <span class="ori-segmented-control__text">Light</span>
</label>
```

::

The icon is decorative (`aria-hidden`); the segment is still named by its text. Keep the text — see
[Accessibility](#accessibility).

## Disabled — whole group

Pass `disabled` to lock every segment. They dim and the arrows skip them.

::example
:ori-segmented-control{label="Theme (locked)" :disabled="true" model-value="dark" :options='[{"label":"Light","value":"light"},{"label":"Dark","value":"dark"},{"label":"Auto","value":"auto"}]'}

#vue

```vue
<OriSegmentedControl v-model="theme" label="Theme (locked)" disabled :options="themes" />
```

#html

```html
<div class="ori-segmented-control" role="radiogroup" aria-labelledby="theme-label">
    <div id="theme-label" class="ori-segmented-control__label">Theme (locked)</div>
    <div class="ori-segmented-control__track">
        <!-- the real disabled attribute on each input drives the dimming -->
        <label class="ori-segmented-control__item">
            <input class="ori-segmented-control__input" type="radio" name="theme" value="light" disabled />
            <span class="ori-segmented-control__text">Light</span>
        </label>
        <!-- … Dark (checked), Auto -->
    </div>
</div>
```

::

The dimming reads the real control state, so in plain HTML a `<fieldset disabled>` around the control dims it
too — no class to add.

## Disabled — per segment

Set `disabled: true` on individual options to lock only those; the arrows step over a locked segment.

::example
:ori-segmented-control{label="Export as" model-value="csv" :options='[{"label":"CSV","value":"csv"},{"label":"JSON","value":"json"},{"label":"PDF (soon)","value":"pdf","disabled":true}]'}

#vue

```vue
<OriSegmentedControl
    v-model="format"
    label="Export as"
    :options="[
        { label: 'CSV', value: 'csv' },
        { label: 'JSON', value: 'json' },
        { label: 'PDF (soon)', value: 'pdf', disabled: true }
    ]"
/>
```

#html

```html
<!-- only the locked segment's input gets the disabled attribute -->
<label class="ori-segmented-control__item">
    <input class="ori-segmented-control__input" type="radio" name="format" value="pdf" disabled />
    <span class="ori-segmented-control__text">PDF (soon)</span>
</label>
```

::

## Radius

The track radius is the shared `ori-size-radius_*` token and the segments follow it, three pixels inside. The
component has no radius prop — put the utility on the root, where a fall-through `class` lands.

::example
:ori-segmented-control{label="Square" class="ori-size-radius_none" model-value="b" :options='[{"label":"One","value":"a"},{"label":"Two","value":"b"},{"label":"Three","value":"c"}]'}
:ori-segmented-control{label="Pill" class="ori-size-radius_full" model-value="b" :options='[{"label":"One","value":"a"},{"label":"Two","value":"b"},{"label":"Three","value":"c"}]'}

#vue

```vue
<OriSegmentedControl v-model="val" label="Square" class="ori-size-radius_none" :options="opts" />
<OriSegmentedControl v-model="val" label="Pill" class="ori-size-radius_full" :options="opts" />
```

#html

```html
<!-- ori-size-radius_*: none · xs · sm · md · lg · xl · full -->
<div class="ori-segmented-control ori-size-radius_full" role="radiogroup" aria-labelledby="pill-label">…</div>
```

::

## In a Field

Wrap the control in [OriField](/components/field) and the field owns the label, the hint and the error
wiring: the control drops its own `label`, names itself by the field's label (`aria-labelledby`), joins the
field's hint or error into `aria-describedby`, and takes the field's `required`, `disabled`, `size` and
`invalid`. Inside a field the control is always `fluid`.

::example
::ori-field{label="Appearance" hint="Applies to this device only."}
:ori-segmented-control{model-value="auto" :options='[{"label":"Light","value":"light"},{"label":"Dark","value":"dark"},{"label":"Auto","value":"auto"}]'}
::

::ori-field{label="Appearance" :required="true" error="Choose an appearance."}
:ori-segmented-control{:options='[{"label":"Light","value":"light"},{"label":"Dark","value":"dark"},{"label":"Auto","value":"auto"}]'}
::

#vue

```vue
<OriField label="Appearance" hint="Applies to this device only.">
    <OriSegmentedControl v-model="theme" :options="themes" />
</OriField>

<OriField label="Appearance" required error="Choose an appearance.">
    <OriSegmentedControl v-model="theme" :options="themes" />
</OriField>
```

#html

```html
<!-- a group cannot be targeted by for/id, so it names itself with aria-labelledby on the field label -->
<div class="ori-field ori-field_fluid ori-font-size_md">
    <label id="appearance-label" class="ori-field__label">Appearance</label>
    <div
        class="ori-segmented-control ori-segmented-control_fluid"
        role="radiogroup"
        aria-labelledby="appearance-label"
        aria-describedby="appearance-hint"
    >
        …
    </div>
    <p id="appearance-hint" class="ori-field__hint">Applies to this device only.</p>
</div>
```

::

## Required and forms

`required` sets the native `required` attribute on every input and `aria-required="true"` on the group. The
inputs are real radios sharing one `name`, so the checked segment's `value` submits with the surrounding
`<form>` and `FormData` reads it — nothing to wire.

::example
:ori-segmented-control{label="Delivery" :required="true" name="delivery" :options='[{"label":"Standard","value":"standard"},{"label":"Express","value":"express"},{"label":"Pickup","value":"pickup"}]'}

#vue

```vue
<form @submit.prevent="send">
    <OriSegmentedControl
        v-model="delivery"
        label="Delivery"
        name="delivery"
        required
        :options="deliveryOptions"
    />
    <OriButton type="submit" label="Order" />
</form>
```

#html

```html
<form>
    <div class="ori-segmented-control" role="radiogroup" aria-labelledby="delivery-label" aria-required="true">
        <div id="delivery-label" class="ori-segmented-control__label">Delivery</div>
        <div class="ori-segmented-control__track">
            <label class="ori-segmented-control__item">
                <input class="ori-segmented-control__input" type="radio" name="delivery" value="standard" required />
                <span class="ori-segmented-control__text">Standard</span>
            </label>
            <!-- … Express, Pickup -->
        </div>
    </div>
    <button type="submit">Order</button>
</form>
```

::

## Custom segment content

The selection is plain `v-model`. The second control fills the `#option` slot to carry a count beside each
label — the slot replaces the segment's text and is scoped, so this demo is a small Vue component rather than
inline markup.

::example
:segmented-control-demo

#vue

```vue
<script setup lang="ts">
import { ref } from 'vue'

const theme = ref('auto')
const themes = [
    { label: 'Light', value: 'light' },
    { label: 'Dark', value: 'dark' },
    { label: 'Auto', value: 'auto' }
]

const filter = ref('all')
const filters = [
    { label: 'All', value: 'all' },
    { label: 'Unread', value: 'unread' },
    { label: 'Flagged', value: 'flagged' }
]
const counts: Record<string, number> = { all: 24, unread: 3, flagged: 1 }
</script>

<template>
    <OriSegmentedControl v-model="theme" label="Theme" :options="themes" />
    <p>v-model: {{ theme }}</p>

    <OriSegmentedControl v-model="filter" label="Show" :options="filters">
        <template #option="{ option }">
            {{ option.label }}
            <span style="margin-inline-start: 0.4em; font-variant-numeric: tabular-nums">{{
                counts[option.value]
            }}</span>
        </template>
    </OriSegmentedControl>
</template>
```

#html

```html
<!-- custom segment content goes inside ori-segmented-control__text -->
<label class="ori-segmented-control__item">
    <input class="ori-segmented-control__input" type="radio" name="filter" value="unread" />
    <span class="ori-segmented-control__text">
        Unread
        <span style="margin-inline-start: 0.4em; font-variant-numeric: tabular-nums">3</span>
    </span>
</label>
```

::

## Common patterns

A view switcher: a small, pill-shaped, secondary-colored control with icons, named by `aria-label` because
the surrounding UI already says what it switches.

::example
:ori-segmented-control{aria-label="View" size="sm" color="secondary" class="ori-size-radius_full" model-value="list" :options='[{"label":"List","value":"list","icon":"M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z"},{"label":"Grid","value":"grid","icon":"M3 3h8v8H3zm10 0h8v8h-8zM3 13h8v8H3zm10 0h8v8h-8z"}]'}

#vue

```vue
<OriSegmentedControl
    v-model="view"
    aria-label="View"
    size="sm"
    color="secondary"
    class="ori-size-radius_full"
    :options="[
        { label: 'List', value: 'list', icon: listPath },
        { label: 'Grid', value: 'grid', icon: gridPath }
    ]"
/>
```

#html

```html
<div
    class="ori-segmented-control ori-segmented-control_sm ori-font-size_sm ori-color_secondary ori-size-radius_full"
    role="radiogroup"
    aria-label="View"
>
    <div class="ori-segmented-control__track">
        <label class="ori-segmented-control__item">
            <input class="ori-segmented-control__input" type="radio" name="view" value="list" checked />
            <i class="ori-icon ori-icon_inherit ori-segmented-control__icon" aria-hidden="true">
                <svg viewBox="0 0 24 24"><path d="M3 13h2v-2H3v2z…" /></svg>
            </i>
            <span class="ori-segmented-control__text">List</span>
        </label>
        <!-- … Grid -->
    </div>
</div>
```

::

## Accessibility

The accessibility contract holds across every layer — the standalone classes and the Vue component render the
same attributes and keyboard behavior.

- The root carries `role="radiogroup"` and **must be named**. When `label` is given, `aria-labelledby`
  points at the rendered label element; without a `label`, pass `aria-label` (or your own `aria-labelledby`)
  as an attribute. An unnamed group is announced as just "radio group".
- Every segment is a real `<input type="radio">` sharing one `name` (auto-generated via `useId` when
  omitted). The browser natively enforces single-select, arrow-key movement that **selects as it moves**, one
  Tab stop for the whole group, form submission and RTL — no JS needed.
- The segment's accessible name is its text, wired through the `<label>` wrapper. The `icon` is
  `aria-hidden`, so an icon never names a segment; keep the text. If you fill the `#option` slot, the slot
  content must still read as the segment's name.
- Selection is shown by more than the fill: the checked segment also gets an edge in the role's text tone and
  a shadow, so it clears 3:1 against the track (measured in every skin and both themes).
- `disabled` (group-level or per segment) sets the native `disabled` attribute; disabled segments are
  skipped by the arrows and dim to 45% opacity.
- `required` sets the native `required` attribute on each input and `aria-required="true"` on the group.
- Inside an [OriField](/components/field) the field owns the label, hint and error: the group is named by the
  field's label, `aria-describedby` carries the hint or error (a `aria-describedby` you add joins it rather
  than replacing it), and an error sets `aria-invalid="true"` on the group.
- Focus is drawn on the visible segment, not the hidden input: a 2 px `outline` in the accent color, offset 2
  px, on `:focus-visible`. Safari drops `:focus-visible` from a radio an arrow key focused, so the component
  sets `data-ori-keyboard` on the group while the keyboard is in use and the ring follows `:focus` under it;
  in plain HTML, set that attribute yourself on keydown and remove it on pointerdown.
- A new control starts with nothing checked unless you give it a value, and a user cannot clear a choice —
  give `v-model` an initial value when one option is the sensible default.

| Key                      | Action                                                                                                                                                        |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Tab` / `Shift+Tab`      | Moves focus into / out of the group — one stop, on the checked segment (the browser picks the entry point if none is checked yet).                            |
| `ArrowRight` `ArrowDown` | Checks and focuses the next enabled segment, wrapping at the end (native). In RTL, `ArrowLeft` is "next" — except in Safari, which keeps the physical arrows. |
| `ArrowLeft` `ArrowUp`    | Checks and focuses the previous enabled segment (native). In RTL, `ArrowRight` is "previous".                                                                 |
| `Space`                  | Checks the focused segment if it is not already checked (native).                                                                                             |

## Framework API

The props, events, and slots of the **Vue** component. The standalone CSS layer has no component API — its
surface is the [classes](#classes) above.

### Props

| Prop         | Type                | Default     | Description                                                                                                                                                    |
| ------------ | ------------------- | ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `color`      | `ThemeColor`        | `'primary'` | Accent for the checked fill, its edge tone and the focus ring.                                                                                                 |
| `disabled`   | `boolean`           | `false`     | Disables every segment; per-segment disable is also supported via `options[].disabled`.                                                                        |
| `fluid`      | `boolean`           | `false`     | Stretches to the container's width; segments stay equal. Always on inside an `OriField`.                                                                       |
| `label`      | `string`            | —           | Visible group label; the group is `aria-labelledby` this element. Not rendered inside an `OriField` (the field owns the label). Without it, pass `aria-label`. |
| `name`       | `string`            | —           | Shared `name` for all radio inputs. Auto-generated via `useId` when omitted.                                                                                   |
| `options`    | `SegmentedOption[]` | `[]`        | Array of `{ label, value, disabled?, icon? }` objects — the full options-array API.                                                                            |
| `required`   | `boolean`           | `false`     | Sets `aria-required="true"` on the group and `required` on each input.                                                                                         |
| `size`       | `ActionSize`        | `'md'`      | Control height from the action-size scale and the text scale (`xs`–`xxl`). Inside an `OriField`, the field's size wins.                                        |
| `modelValue` | `string \| number`  | —           | The checked segment's `value`; bind with `v-model`.                                                                                                            |

`SegmentedOption` is exported — `import type { SegmentedOption } from '@oriui/vue'`:

```ts
import type { SegmentedOption } from '@oriui/vue'

const options: SegmentedOption[] = [
    { label: 'List', value: 'list', icon: listPath },
    { label: 'Grid', value: 'grid', icon: gridPath },
    { label: 'Map', value: 'map', disabled: true }
]
```

`value` is `string | number` and the model keeps the type you gave it. `icon` is an SVG path drawn before the
label.

### Events & attributes

`v-model` is the public state binding — `modelValue` holds the checked `value`, and the component emits
`update:modelValue` when the user picks another segment. Without a `v-model` it keeps its own state.

The component sets `inheritAttrs: false` and binds the attributes itself, to the root
`div.ori-segmented-control` and not to the inputs, so `class`, `style`, `aria-*` and `data-*` land on the
group. An unlabeled group passes `aria-label` this way:

```vue
<OriSegmentedControl v-model="view" aria-label="View" :options="viewOptions" />
```

### Slots

| Slot     | Props        | Description                                                                                                                                                                                                                                       |
| -------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `option` | `{ option }` | Scoped, rendered once per segment inside `ori-segmented-control__text` to replace its text — a count, a badge, rich markup. `option` is the `{ label, value, … }` entry; falls back to `option.label`. The `icon` is drawn separately, before it. |
