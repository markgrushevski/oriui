---
title: Field
---

# Field

The shared shell for form controls — **one source of truth** for the `label` / `hint` / `error` /
`required` contract that [Input](/components/input), [Select](/components/select), and
[Textarea](/components/textarea) otherwise each wire by hand. Wrap a control in `OriField` and it
adopts the field's id, `aria-describedby`, `aria-invalid`, `required`, `disabled`, and `size` — and
stops rendering its own label and helper, so there is exactly one of each, wired identically every
time.

Any control works: an Ori control nested inside wires up automatically (via `provide`/`inject`); a
raw `<input>` or htmx markup wires up through the scoped-slot `controlAttrs`. The standalone
**HTML / `@oriui/css`** path is the same `.ori-field` shell around any `.ori-*` field element.

## Classes

The field is a wrapper that owns the label, the required asterisk, and the hint / error line; the
control sits in between. One class repoints one token — the `ori-font-size_*` scale drives the label
and helper text (and is inherited by a nested control).

<!-- prettier-ignore -->
:class-table{:rows='[{"class":"ori-field","type":"Block","description":"Required base class (wrapper div)."},{"class":"ori-font-size_*","type":"Font","description":"xs · sm · <b>md</b> · lg · xl · xxl — label + hint + error scale (and the nested control)."},{"class":"ori-field__label · ori-field__required · ori-field__hint · ori-field__error","type":"Part","description":"label / required-asterisk / helper / error elements."},{"class":"ori-field_fluid","type":"Layout","description":"full-width (stretches the field to 100 %)."},{"class":"for · id · aria-describedby · aria-invalid","type":"State","description":"real attributes on the control, not classes — shared with the label and helper."}]'}

## With a control

Wrap any Ori control. The field renders the label and helper; the control renders just its field
element and inherits the wiring.

::example
::ori-field{label="Email" hint="We never share it."}
:ori-input{type="email" placeholder="you@example.com"}
::

#vue

```vue
<OriField label="Email" hint="We never share it.">
    <OriInput v-model="email" type="email" placeholder="you@example.com" />
</OriField>
```

#html

```html
<div class="ori-field ori-font-size_md">
    <label class="ori-field__label" for="email">Email</label>
    <input
        id="email"
        type="email"
        placeholder="you@example.com"
        aria-describedby="email-hint"
        class="ori-input ori-input__field ori-size-radius_md"
    />
    <p id="email-hint" class="ori-field__hint">We never share it.</p>
</div>
```

::

## Required & error

`required` adds the asterisk (hidden from assistive tech) and the native `required` on the control.
`error` renders a `role="alert"` message, flips the control to `aria-invalid`, and supersedes the
hint — there is never a dangling `aria-describedby`.

::example
::ori-field{label="Email" :required="true" error="Enter a valid email address."}
:ori-input{type="email" placeholder="you@example.com"}
::

#vue

```vue
<OriField label="Email" required error="Enter a valid email address.">
    <OriInput v-model="email" type="email" placeholder="you@example.com" />
</OriField>
```

#html

```html
<div class="ori-field ori-font-size_md">
    <label class="ori-field__label" for="email">
        Email<span class="ori-field__required" aria-hidden="true">*</span>
    </label>
    <input
        id="email"
        type="email"
        required
        aria-invalid="true"
        aria-describedby="email-error"
        class="ori-input ori-input__field ori-size-radius_md"
    />
    <p id="email-error" class="ori-field__error" role="alert">Enter a valid email address.</p>
</div>
```

::

## Any control

The same shell wraps a [Select](/components/select) or [Textarea](/components/textarea) — each drops
its own label and helper and reads the field's wiring instead.

::example
::ori-field{label="Favourite fruit" hint="Pick one."}
:ori-select{:options='[{"label":"Apple","value":"apple"},{"label":"Banana","value":"banana"}]' placeholder="Choose…"}
::

::ori-field{label="Bio" hint="A short introduction."}
:ori-textarea{:rows="3" placeholder="Tell us about yourself"}
::

#vue

```vue
<OriField label="Favourite fruit" hint="Pick one.">
    <OriSelect v-model="fruit" :options="options" placeholder="Choose…" />
</OriField>

<OriField label="Bio" hint="A short introduction.">
    <OriTextarea v-model="bio" :rows="3" placeholder="Tell us about yourself" />
</OriField>
```

::

## Sizes

`size` lives on the field and propagates to the nested control, so the label, helper, and control
share one scale. `xs` → `xxl`.

::example
::ori-field{label="Small" size="sm" hint="size = sm"}
:ori-input{placeholder="sm"}
::

::ori-field{label="Large" size="lg" hint="size = lg"}
:ori-input{placeholder="lg"}
::

#vue

```vue
<OriField label="Small" size="sm" hint="size = sm">
    <OriInput v-model="a" placeholder="sm" />
</OriField>

<OriField label="Large" size="lg" hint="size = lg">
    <OriInput v-model="b" placeholder="lg" />
</OriField>
```

::

## Raw controls (CSS layer / htmx)

Without Vue, the field is still just markup: the `.ori-field` shell around any `.ori-*` field
element, with the `for` / `id` / `aria-describedby` written by hand. In Vue, a non-Ori control reads
the same values from the scoped-slot `controlAttrs`.

::example
::ori-field{label="Username" hint="Letters and numbers only."}
:ori-input{placeholder="ori_user"}
::

#vue

```vue
<!-- a non-Ori control: spread the field's wiring with v-bind -->
<OriField v-slot="field" label="Username" hint="Letters and numbers only.">
    <input v-bind="field.controlAttrs" class="ori-input ori-input__field ori-size-radius_md" />
</OriField>
```

#html

```html
<div class="ori-field ori-font-size_md">
    <label class="ori-field__label" for="username">Username</label>
    <input id="username" aria-describedby="username-hint" class="ori-input ori-input__field ori-size-radius_md" />
    <p id="username-hint" class="ori-field__hint">Letters and numbers only.</p>
</div>
```

::

## Accessibility

The contract holds across every layer — the standalone classes and the Vue component render the same
attributes and ARIA wiring.

- The `label` is tied to the control by `for` / `id`; the id is auto-generated (`useId`) when you
  don't pass one, and a nested Ori control adopts it so the association always holds.
- `hint` and `error` are wired through `aria-describedby`, referencing only the element actually
  rendered (`error` supersedes `hint`). Pass extra ids with `describedby` for a shared note.
- `error` sets `aria-invalid="true"` and announces via `role="alert"`; `invalid` flips
  `aria-invalid` on its own for external validation.
- `required` and `disabled` set the real native attributes on the control.
- A control nested in a field renders **no** label or helper of its own — exactly one of each, so
  there is never a duplicate label or a dangling description.

| Key   | Action                                  |
| ----- | --------------------------------------- |
| `Tab` | Moves focus to / away from the control. |

## Framework API

The props and slots of the **Vue** component. The standalone CSS layer has no component API — its
surface is the [classes](#classes) above. (Svelte bindings are planned.)

### Props

| Prop          | Type         | Default | Description                                                                                |
| ------------- | ------------ | ------- | ------------------------------------------------------------------------------------------ |
| `describedby` | `string`     | —       | Extra element id(s) appended to `aria-describedby` (e.g. a shared form note).              |
| `disabled`    | `boolean`    | `false` | Drives the nested control's native `disabled`.                                             |
| `error`       | `string`     | —       | Error message rendered below the control (`role="alert"`); sets `aria-invalid="true"`.     |
| `fluid`       | `boolean`    | `false` | Full-width — stretches the field to 100 % of its container.                                |
| `hint`        | `string`     | —       | Helper text below the control; hidden while `error` is shown.                              |
| `id`          | `string`     | —       | Explicit shared id; auto-generated via `useId` when omitted.                               |
| `invalid`     | `boolean`    | `false` | Sets `aria-invalid="true"` without an error message (for external validation).             |
| `label`       | `string`     | —       | Visible `<label>` text, wired to the control via `for` / `id`.                             |
| `required`    | `boolean`    | `false` | Renders the asterisk and sets the control's native `required`.                             |
| `size`        | `ActionSize` | `'md'`  | Label + helper scale, propagated to the nested control (`xs` · sm · md · lg · xl · `xxl`). |

### Slots

The default slot is the control. It receives scoped props for wiring a non-Ori control — Ori controls
ignore them and read the context directly.

| Slot prop      | Type      | Description                                                                     |
| -------------- | --------- | ------------------------------------------------------------------------------- |
| `controlAttrs` | `object`  | Ready-to-`v-bind` `{ id, aria-describedby, aria-invalid, disabled, required }`. |
| `id`           | `string`  | The shared field id.                                                            |
| `describedby`  | `string`  | The resolved `aria-describedby` (or `undefined`).                               |
| `invalid`      | `boolean` | Whether the field is in an invalid state.                                       |
