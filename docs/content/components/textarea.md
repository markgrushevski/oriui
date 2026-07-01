---
title: Textarea
---

# Textarea

A labelled, accessible multiline text field with `v-model`. State is expressed through real
attributes — the native `disabled`, `aria-invalid` when there is an error, and an `aria-describedby`
that points at the rendered hint or error. The label is wired to the field with `for`/`id`
(auto-generated via `useId` when you don't pass one). Unlike a single-line input the field has no
fixed height — it grows from a `rows`-based min-height and stays user-resizable.

The examples are organised by **layer**: the [class reference](#classes) is the standalone
**`@oriui/css`** layer, and the [Framework API](#framework-api) is the **`@oriui/vue`** component. Every
example is live — flip its code between **HTML** (the standalone classes, also your htmx / Astro / Svelte /
plain-HTML usage), **Vue**, and **Svelte** _(soon)_; HTML is the default.

## Classes

A textarea is a block wrapper plus single-class token utilities — one class repoints one token, no
base class needed. The `ori-color_*` accent drives the focus ring; the idle border is a neutral,
theme-aware blend. The Vue props in [Framework API](#framework-api) map 1:1 to these.

<!-- prettier-ignore -->
:class-table{:rows='[{"class":"ori-textarea","type":"Block","description":"Required base class (wrapper div)."},{"class":"ori-textarea_*","type":"Style","description":"<b>outline</b> · fill"},{"class":"ori-color_*","type":"Color","description":"<b>primary</b> · secondary · success · warn · danger · info · surface · background (focus ring accent)"},{"class":"ori-textarea_* (size)","type":"Size","description":"xs · sm · <b>md</b> · lg · xl · xxl (sets min-height on wrapper via --ori-size-action)"},{"class":"ori-size-radius_*","type":"Radius","description":"zero · xs · sm · <b>md</b> · lg · xl · rounded (field corners)"},{"class":"ori-font-size_*","type":"Font","description":"xs · sm · <b>md</b> · lg · xl · xxl (label + field text scale)"},{"class":"ori-textarea__label · ori-textarea__required · ori-textarea__field · ori-textarea__hint · ori-textarea__error","type":"Part","description":"label / required-asterisk / textarea / helper / error elements"},{"class":"ori-textarea_fluid","type":"Layout","description":"full-width (stretches wrapper to 100 %)"},{"class":"disabled · aria-invalid · aria-describedby","type":"State","description":"real attributes, not classes"}]'}

## Variants

Two visual styles — `outline` (default, border visible at rest) and `fill` (tinted background, no
border).

::example
:ori-textarea{label="Outline" placeholder="Type here..." variant="outline"}
:ori-textarea{label="Fill" placeholder="Type here..." variant="fill"}

#vue

```vue
<OriTextarea v-model="value" label="Outline" placeholder="Type here..." variant="outline" />
<OriTextarea v-model="value" label="Fill" placeholder="Type here..." variant="fill" />
```

#html

```html
<!-- default: bare ori-textarea is already outline + primary + md -->
<div class="ori-textarea ori-textarea_outline">
    <label class="ori-textarea__label" for="t1">Outline</label>
    <textarea id="t1" rows="3" placeholder="Type here..." class="ori-textarea__field"></textarea>
</div>

<!-- swap the variant: ori-textarea_outline → ori-textarea_fill -->
<div class="ori-textarea ori-textarea_fill">
    <label class="ori-textarea__label" for="t1b">Fill</label>
    <textarea id="t1b" rows="3" placeholder="Type here..." class="ori-textarea__field"></textarea>
</div>
```

::

## Colors

The `ori-color_*` class controls the focus ring (and the danger color inherits for error text).

::example
:ori-textarea{label="primary" placeholder="primary" color="primary"}
:ori-textarea{label="secondary" placeholder="secondary" color="secondary"}
:ori-textarea{label="success" placeholder="success" color="success"}
:ori-textarea{label="danger" placeholder="danger" color="danger"}

#vue

```vue
<OriTextarea v-model="value" label="primary" color="primary" />
<OriTextarea v-model="value" label="danger" color="danger" />
```

#html

```html
<div class="ori-textarea ori-color_danger">
    <label class="ori-textarea__label" for="t2">danger</label>
    <textarea id="t2" rows="3" class="ori-textarea__field"></textarea>
</div>
```

::

## Sizes

`xs` → `xxl`. The size drives both the field min-height (via `ori-textarea_*` size sugar on the
wrapper) and the text scale (`ori-font-size_*`).

::example
:ori-textarea{label="xs" size="xs" placeholder="Extra small"}
:ori-textarea{label="sm" size="sm" placeholder="Small"}
:ori-textarea{label="md" size="md" placeholder="Medium"}
:ori-textarea{label="lg" size="lg" placeholder="Large"}
:ori-textarea{label="xl" size="xl" placeholder="Extra large"}

#vue

```vue
<OriTextarea v-model="value" label="sm" size="sm" />
<OriTextarea v-model="value" label="xl" size="xl" />
```

#html

```html
<!-- ori-textarea_xl sets min-height on the wrapper; ori-font-size_xl scales the text -->
<div class="ori-textarea ori-textarea_xl ori-font-size_xl">
    <label class="ori-textarea__label" for="t3">xl</label>
    <textarea id="t3" rows="3" class="ori-textarea__field"></textarea>
</div>
```

::

## Radius

From `zero` (square) through the default `md` to `rounded` (heavily rounded corners).

::example
:ori-textarea{label="zero" radius="zero" placeholder="Square"}
:ori-textarea{label="sm" radius="sm" placeholder="Small"}
:ori-textarea{label="md" radius="md" placeholder="Medium"}
:ori-textarea{label="lg" radius="lg" placeholder="Large"}
:ori-textarea{label="rounded" radius="rounded" placeholder="Rounded"}

#vue

```vue
<OriTextarea v-model="value" label="zero" radius="zero" />
<OriTextarea v-model="value" label="rounded" radius="rounded" />
```

#html

```html
<textarea class="ori-textarea__field ori-size-radius_zero"></textarea>
```

::

## Rows

`rows` controls the initial visible height (and acts as the min-height). The field still grows as
the user types and remains manually resizable.

::example
:ori-textarea{label="2 rows" :rows="2" placeholder="Two rows of visible text"}
:ori-textarea{label="5 rows" :rows="5" placeholder="Five rows of visible text"}

#vue

```vue
<OriTextarea v-model="value" label="2 rows" :rows="2" />
<OriTextarea v-model="value" label="5 rows" :rows="5" />
```

#html

```html
<textarea rows="2" class="ori-textarea__field …"></textarea>
<textarea rows="5" class="ori-textarea__field …"></textarea>
```

::

## Label, hint & required

`label` renders a `<label>` linked to the field. `hint` renders a helper line below. `required`
adds the real HTML attribute and a visual asterisk (hidden from assistive tech).

::example
:ori-textarea{label="Bio" placeholder="Tell us about yourself..." hint="Markdown is supported." :required="true"}

#vue

```vue
<OriTextarea v-model="bio" label="Bio" placeholder="Tell us about yourself..." hint="Markdown is supported." required />
```

#html

```html
<div class="ori-textarea">
    <label class="ori-textarea__label" for="bio">
        Bio<span class="ori-textarea__required" aria-hidden="true">*</span>
    </label>
    <textarea
        id="bio"
        rows="3"
        required
        placeholder="Tell us about yourself..."
        aria-describedby="bio-hint"
        class="ori-textarea__field"
    ></textarea>
    <p id="bio-hint" class="ori-textarea__hint">Markdown is supported.</p>
</div>
```

::

## States

`disabled` uses the real attribute (also disables the resize handle). `error` renders a
`role="alert"` message and sets `aria-invalid`. `invalid` flips `aria-invalid` without a message
(for external validation).

::example
:ori-textarea{label="Disabled" placeholder="Cannot edit" :disabled="true"}
:ori-textarea{label="Invalid (no message)" :invalid="true" placeholder="Flagged externally"}
:ori-textarea{label="With error" placeholder="Your message" error="Message must be at least 20 characters."}

#vue

```vue
<OriTextarea v-model="value" label="Disabled" disabled />
<OriTextarea v-model="value" label="Invalid (no message)" invalid />
<OriTextarea v-model="value" label="With error" error="Message must be at least 20 characters." />
```

#html

```html
<!-- disabled -->
<textarea class="ori-textarea__field …" disabled></textarea>

<!-- invalid without message -->
<textarea class="ori-textarea__field …" aria-invalid="true"></textarea>

<!-- error: message gets role=alert and is referenced by aria-describedby -->
<textarea class="ori-textarea__field …" aria-invalid="true" aria-describedby="msg-error"></textarea>
<p id="msg-error" class="ori-textarea__error" role="alert">Message must be at least 20 characters.</p>
```

::

## Fluid

`fluid` stretches the wrapper to the full width of its container.

::example
:ori-textarea{label="Full width" placeholder="Stretches to container" :fluid="true"}

#vue

```vue
<OriTextarea v-model="value" label="Full width" fluid />
```

#html

```html
<div class="ori-textarea ori-textarea_fluid …">…</div>
```

::

## Common patterns

A real-world support form — label, required, hint, error, and fluid compose freely.

::example
:ori-textarea{label="Subject" placeholder="Briefly describe the issue" :required="true" :fluid="true"}
:ori-textarea{label="Message" placeholder="Provide as much detail as you can..." hint="Attachments can be added on the next step." :rows="6" :required="true" :fluid="true"}

#vue

```vue
<form style="display: flex; flex-direction: column; gap: 1rem; max-width: 32rem">
    <OriTextarea v-model="subject" label="Subject" placeholder="Briefly describe the issue" required fluid />
    <OriTextarea
        v-model="message"
        label="Message"
        placeholder="Provide as much detail as you can..."
        hint="Attachments can be added on the next step."
        :rows="6"
        required
        fluid
    />
</form>
```

#html

```html
<form style="display: flex; flex-direction: column; gap: 1rem; max-width: 32rem">
    <div class="ori-textarea ori-textarea_fluid">
        <label class="ori-textarea__label" for="sub">
            Subject<span class="ori-textarea__required" aria-hidden="true">*</span>
        </label>
        <textarea
            id="sub"
            rows="3"
            required
            placeholder="Briefly describe the issue"
            class="ori-textarea__field"
        ></textarea>
    </div>
    <div class="ori-textarea ori-textarea_fluid">
        <label class="ori-textarea__label" for="msg">
            Message<span class="ori-textarea__required" aria-hidden="true">*</span>
        </label>
        <textarea
            id="msg"
            rows="6"
            required
            placeholder="Provide as much detail as you can..."
            aria-describedby="msg-hint"
            class="ori-textarea__field"
        ></textarea>
        <p id="msg-hint" class="ori-textarea__hint">Attachments can be added on the next step.</p>
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
- All native attributes (`name`, `autocomplete`, `maxlength`, `wrap`, `spellcheck`, …) fall through
  to the underlying `<textarea>` — OriTextarea stays out of the way.

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
| `disabled`    | `boolean`             | `false`     | Real `disabled` attribute; blocks interaction, dims the field, and disables the resize handle.            |
| `error`       | `string`              | —           | Error message rendered below the field (`role="alert"`); also sets `aria-invalid="true"`.                 |
| `fluid`       | `boolean`             | `false`     | Full-width — stretches wrapper to 100 % of its container.                                                 |
| `hint`        | `string`              | —           | Helper text below the field; hidden while `error` is shown.                                               |
| `id`          | `string`              | —           | Explicit id for the `<textarea>`; auto-generated via `useId` when omitted.                                |
| `invalid`     | `boolean`             | `false`     | Sets `aria-invalid="true"` without rendering an error message (for external validation).                  |
| `label`       | `string`              | —           | Visible `<label>` text, wired to the field via `for`/`id`.                                                |
| `placeholder` | `string`              | —           | Native placeholder text.                                                                                  |
| `radius`      | `RadiusSize`          | `'md'`      | Corner radius of the field (`zero` · xs · sm · md · lg · xl · rounded).                                   |
| `required`    | `boolean`             | `false`     | Native `required` attribute; also renders a visual asterisk (`aria-hidden`).                              |
| `rows`        | `number`              | `3`         | Visible rows of text — sets the field min-height; the field still grows and is resizable.                 |
| `size`        | `ActionSize`          | `'md'`      | Field min-height + text scale (`xs` · sm · md · lg · xl · `xxl`).                                         |
| `variant`     | `'fill' \| 'outline'` | `'outline'` | Visual style: `outline` (border) or `fill` (tinted background).                                           |

### Events & attributes

`v-model` binds to a `string` via `defineModel<string>()` — it reads the `modelValue` prop and
emits `update:modelValue` on input, so you use it like any controlled field:

```vue
<OriTextarea v-model="myValue" label="Message" />
```

OriTextarea sets `inheritAttrs: false` and spreads `$attrs` onto the underlying `<textarea>`, so
native attributes and listeners pass through directly to the field element — not the wrapper `<div>`:

- Attributes: `name`, `autocomplete`, `maxlength`, `minlength`, `wrap`, `spellcheck`, `readonly`, …
- Listeners: `@input`, `@change`, `@focus`, `@blur`, `@keydown`, …

### Slots

OriTextarea exposes no named slots.

| Slot   | Description           |
| ------ | --------------------- |
| (none) | No slots are defined. |
