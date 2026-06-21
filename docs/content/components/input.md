---
title: Input
---

# Input

A labelled, accessible text field with `v-model`. State is expressed through real attributes — the
native `disabled`, `aria-invalid` when there is an error, and an `aria-describedby` that points at
the rendered hint or error. The label is wired to the field with `for`/`id` (auto-generated via
`useId` when you don't pass one), and arbitrary native attributes (`name`, `autocomplete`,
`inputmode`, …) fall through to the underlying `<input>`.

This page is laid out by **layer**. The live demos are the **`@oriui/css`** layer — their code
defaults to **HTML** (the standalone classes, also your htmx / Astro / Svelte / plain-HTML usage),
with **Vue** one tab away and **Svelte** _(soon)_; the [Framework API](#framework-api) documents the
**`@oriui/vue`** component. Input is pure CSS — there is no behaviour layer in between.

## Classes

A field is a block wrapper with single-class token utilities — one class repoints one token; no
separate base class is needed. The `ori-color_*` accent drives the focus ring; the idle border is a
neutral, theme-aware blend. The Vue props in [Framework API](#framework-api) map 1:1 to these.

<!-- prettier-ignore -->
:class-table{:rows='[{"class":"ori-input","type":"Block","description":"Required base class (wrapper div)."},{"class":"ori-input_*","type":"Style","description":"<b>outline</b> · fill"},{"class":"ori-color_*","type":"Color","description":"<b>primary</b> · secondary · success · warn · danger · info · surface · background (focus ring accent)"},{"class":"ori-input_* (size)","type":"Size","description":"xs · sm · <b>md</b> · lg · xl · xxl field height (size sugar on the wrapper)"},{"class":"ori-size-radius_*","type":"Radius","description":"zero · xs · sm · <b>md</b> · lg · xl · rounded (field corners)"},{"class":"ori-font-size_*","type":"Font","description":"xs · sm · <b>md</b> · lg · xl · xxl (label + field text scale)"},{"class":"ori-input__label · ori-input__required · ori-input__field · ori-input__hint · ori-input__error","type":"Part","description":"label / required-asterisk / input / helper / error elements"},{"class":"ori-input_fluid","type":"Layout","description":"full-width (stretches wrapper to 100 %)"},{"class":"disabled · aria-invalid · aria-describedby","type":"State","description":"real attributes, not classes"}]'}

## Variants

Two visual styles — `outline` (default, border visible at rest) and `fill` (tinted background, no
border).

::example
:ori-input{label="Outline" placeholder="Type here" variant="outline"}
:ori-input{label="Fill" placeholder="Type here" variant="fill"}

#vue

```vue
<OriInput v-model="value" label="Outline" placeholder="Type here" variant="outline" />
<OriInput v-model="value" label="Fill" placeholder="Type here" variant="fill" />
```

#html

```html
<div class="ori-input ori-color_primary ori-font-size_md ori-input_outline">
    <label class="ori-input__label" for="f1">Outline</label>
    <input id="f1" placeholder="Type here" class="ori-input__field ori-size-radius_md" />
</div>

<!-- swap the variant: ori-input_outline → ori-input_fill -->
```

::

## Colors

The `ori-color_*` class controls the focus ring (and the danger color inherits for error text).

::example
:ori-input{label="primary" placeholder="primary" color="primary"}
:ori-input{label="secondary" placeholder="secondary" color="secondary"}
:ori-input{label="success" placeholder="success" color="success"}
:ori-input{label="danger" placeholder="danger" color="danger"}

#vue

```vue
<OriInput v-model="value" label="primary" color="primary" />
<OriInput v-model="value" label="danger" color="danger" />
```

#html

```html
<div class="ori-input ori-color_danger ori-font-size_md ori-input_outline">
    <label class="ori-input__label" for="f2">danger</label>
    <input id="f2" class="ori-input__field ori-size-radius_md" />
</div>
```

::

## Sizes

`xs` → `xxl`. The size drives both the field height (`ori-input_*` size sugar on the wrapper) and
the text scale (`ori-font-size_*`).

::example
:ori-input{label="xs" size="xs" placeholder="Extra small"}
:ori-input{label="sm" size="sm" placeholder="Small"}
:ori-input{label="md" size="md" placeholder="Medium"}
:ori-input{label="lg" size="lg" placeholder="Large"}
:ori-input{label="xl" size="xl" placeholder="Extra large"}

#vue

```vue
<OriInput v-model="value" label="sm" size="sm" />
<OriInput v-model="value" label="xl" size="xl" />
```

#html

```html
<!-- size sugar on the wrapper (ori-input_xl); the field inherits the height via --ori-size-action -->
<div class="ori-input ori-color_primary ori-font-size_xl ori-input_outline ori-input_xl">
    <label class="ori-input__label" for="f3">xl</label>
    <input id="f3" class="ori-input__field ori-size-radius_md" />
</div>

<!-- a bare ori-input wrapper is already a valid md field — no size class needed for the default -->
```

::

## Radius

From `zero` (square) through the default `md` to `rounded` (pill-shaped field).

::example
:ori-input{label="zero" radius="zero" placeholder="Square"}
:ori-input{label="sm" radius="sm" placeholder="Small"}
:ori-input{label="md" radius="md" placeholder="Medium"}
:ori-input{label="lg" radius="lg" placeholder="Large"}
:ori-input{label="rounded" radius="rounded" placeholder="Pill"}

#vue

```vue
<OriInput v-model="value" label="zero" radius="zero" />
<OriInput v-model="value" label="rounded" radius="rounded" />
```

#html

```html
<input class="ori-input__field ori-size-radius_zero" />
```

::

## Label, hint & required

`label` renders a `<label>` linked to the field. `hint` renders a helper line below. `required`
adds the real HTML attribute and a visual asterisk (hidden from assistive tech).

::example
:ori-input{label="Email" type="email" placeholder="you@example.com" hint="We never share it." :required="true"}

#vue

```vue
<OriInput v-model="email" type="email" label="Email" placeholder="you@example.com" hint="We never share it." required />
```

#html

```html
<div class="ori-input ori-color_primary ori-font-size_md ori-input_outline">
    <label class="ori-input__label" for="email">
        Email<span class="ori-input__required" aria-hidden="true">*</span>
    </label>
    <input
        id="email"
        type="email"
        required
        placeholder="you@example.com"
        aria-describedby="email-hint"
        class="ori-input__field ori-size-radius_md"
    />
    <p id="email-hint" class="ori-input__hint">We never share it.</p>
</div>
```

::

## States

`disabled` uses the real attribute. `error` renders a `role="alert"` message and sets
`aria-invalid`. `invalid` flips `aria-invalid` without a message (for external validation).

::example
:ori-input{label="Disabled" placeholder="Cannot edit" :disabled="true"}
:ori-input{label="Invalid (no message)" :invalid="true" placeholder="Flagged externally"}
:ori-input{label="With error" type="email" placeholder="you@example.com" error="Enter a valid email address."}

#vue

```vue
<OriInput v-model="value" label="Disabled" disabled />
<OriInput v-model="value" label="Invalid (no message)" invalid />
<OriInput v-model="email" label="With error" error="Enter a valid email address." />
```

#html

```html
<!-- disabled -->
<input class="ori-input__field …" disabled />

<!-- invalid without message -->
<input class="ori-input__field …" aria-invalid="true" />

<!-- error: message gets role=alert and is referenced by aria-describedby -->
<input class="ori-input__field …" aria-invalid="true" aria-describedby="email-error" />
<p id="email-error" class="ori-input__error" role="alert">Enter a valid email address.</p>
```

::

## Fluid

`fluid` stretches the wrapper to the full width of its container.

::example
:ori-input{label="Full width" placeholder="Stretches to container" :fluid="true"}

#vue

```vue
<OriInput v-model="value" label="Full width" fluid />
```

#html

```html
<div class="ori-input ori-input_fluid …">…</div>
```

::

## Input types

`type` maps directly to the native `<input type="">` — use `email`, `password`, `search`, `tel`,
`url`, `number`, etc.

::example
:ori-input{label="Password" type="password" placeholder="Enter password"}
:ori-input{label="Search" type="search" placeholder="Search…"}
:ori-input{label="Number" type="number" placeholder="0"}

#vue

```vue
<OriInput v-model="password" type="password" label="Password" placeholder="Enter password" />
<OriInput v-model="query" type="search" label="Search" placeholder="Search…" />
```

#html

```html
<input type="password" class="ori-input__field …" /> <input type="search" class="ori-input__field …" />
```

::

## Common patterns

A real-world sign-in form — label, type, hint, required, and error compose freely.

::example
:ori-input{label="Email" type="email" placeholder="you@example.com" :required="true"}
:ori-input{label="Password" type="password" placeholder="Min 8 characters" hint="Use a mix of letters, numbers and symbols." :required="true"}

#vue

```vue
<form style="display: flex; flex-direction: column; gap: 1rem; max-width: 24rem">
    <OriInput v-model="email" type="email" label="Email" placeholder="you@example.com" required />
    <OriInput
        v-model="password"
        type="password"
        label="Password"
        placeholder="Min 8 characters"
        hint="Use a mix of letters, numbers and symbols."
        required
    />
</form>
```

#html

```html
<form style="display: flex; flex-direction: column; gap: 1rem; max-width: 24rem">
    <div class="ori-input ori-color_primary ori-font-size_md ori-input_outline">
        <label class="ori-input__label" for="si-email">
            Email<span class="ori-input__required" aria-hidden="true">*</span>
        </label>
        <input
            id="si-email"
            type="email"
            required
            placeholder="you@example.com"
            class="ori-input__field ori-size-radius_md"
        />
    </div>
    <div class="ori-input ori-color_primary ori-font-size_md ori-input_outline">
        <label class="ori-input__label" for="si-pw">
            Password<span class="ori-input__required" aria-hidden="true">*</span>
        </label>
        <input
            id="si-pw"
            type="password"
            required
            placeholder="Min 8 characters"
            aria-describedby="si-pw-hint"
            class="ori-input__field ori-size-radius_md"
        />
        <p id="si-pw-hint" class="ori-input__hint">Use a mix of letters, numbers and symbols.</p>
    </div>
</form>
```

::

## Accessibility

The accessibility contract holds across every layer — the standalone classes and the Vue component
render the same attributes and ARIA wiring.

- `label` is associated with the field via `for`/`id`; the id is auto-generated (`useId`) when you
  don't pass one, so the association holds even without an explicit `id` prop.
- `hint` and `error` are wired through `aria-describedby`, referencing only the element that is
  actually rendered (`error` supersedes `hint`). Pass extra ids with `describedby` to reference
  additional descriptions (e.g. a shared form note).
- `error` sets `aria-invalid="true"` and announces via `role="alert"`; `invalid` flips
  `aria-invalid` on its own for external validation flows.
- Uses the real `disabled` attribute and native `required`; the focus ring is always visible and
  switches to the `danger` color when invalid.
- All native attributes (`name`, `autocomplete`, `inputmode`, `maxlength`, …) fall through to the
  underlying `<input>` — OriInput stays out of the way.

| Key   | Action                                |
| ----- | ------------------------------------- |
| `Tab` | Moves focus to / away from the field. |

## Framework API

The props, events, and slots of the **Vue** component. The standalone CSS layer has no component
API — its surface is the [classes](#classes) above. (Svelte bindings are planned.)

### Props

| Prop          | Type                  | Default     | Description                                                                                               |
| ------------- | --------------------- | ----------- | --------------------------------------------------------------------------------------------------------- |
| `color`       | `ThemeColor`          | `'primary'` | Accent color for focus ring: primary · secondary · success · warn · danger · info · surface · background. |
| `describedby` | `string`              | —           | Extra element id(s) appended to `aria-describedby` (e.g. a shared form note).                             |
| `disabled`    | `boolean`             | `false`     | Real `disabled` attribute; blocks interaction and dims the field.                                         |
| `error`       | `string`              | —           | Error message rendered below the field (`role="alert"`); also sets `aria-invalid="true"`.                 |
| `fluid`       | `boolean`             | `false`     | Full-width — stretches wrapper to 100 % of its container.                                                 |
| `hint`        | `string`              | —           | Helper text below the field; hidden while `error` is shown.                                               |
| `id`          | `string`              | —           | Explicit id for the `<input>`; auto-generated via `useId` when omitted.                                   |
| `invalid`     | `boolean`             | `false`     | Sets `aria-invalid="true"` without rendering an error message (for external validation).                  |
| `label`       | `string`              | —           | Visible `<label>` text, wired to the field via `for`/`id`.                                                |
| `placeholder` | `string`              | —           | Native placeholder text.                                                                                  |
| `radius`      | `RadiusSize`          | `'md'`      | Corner radius of the field (`zero` · xs · sm · md · lg · xl · rounded).                                   |
| `required`    | `boolean`             | `false`     | Native `required` attribute; also renders a visual asterisk (`aria-hidden`).                              |
| `size`        | `ActionSize`          | `'md'`      | Field height + text scale (`xs` · sm · md · lg · xl · `xxl`).                                             |
| `type`        | `string`              | `'text'`    | Native input type (`text`, `email`, `password`, `search`, `tel`, `url`, `number`, …).                     |
| `variant`     | `'fill' \| 'outline'` | `'outline'` | Visual style: `outline` (border) or `fill` (tinted background).                                           |

### Events & attributes

`v-model` binds to a `string` via `defineModel<string>()` — it reads the `modelValue` prop and emits
`update:modelValue` on input, so you use it like any controlled field:

```vue
<OriInput v-model="myValue" label="Name" />
```

OriInput sets `inheritAttrs: false` and spreads `$attrs` onto the underlying `<input>`, so native
attributes and listeners pass through directly to the field element — not the wrapper `<div>`:

- Attributes: `name`, `autocomplete`, `inputmode`, `maxlength`, `minlength`, `pattern`,
  `spellcheck`, `readonly`, …
- Listeners: `@input`, `@change`, `@focus`, `@blur`, `@keydown`, …

### Slots

OriInput exposes no named slots.

| Slot   | Description           |
| ------ | --------------------- |
| (none) | No slots are defined. |
