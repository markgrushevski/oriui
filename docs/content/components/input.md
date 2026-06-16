---
title: Input
---

# Input

A labelled, accessible text field with `v-model`. State is expressed through real attributes — the
native `disabled`, `aria-invalid` when there's an error, and an `aria-describedby` that points at the
rendered hint or error. The label is wired to the field with `for`/`id` (auto-generated when you
don't pass one), and arbitrary native attributes (`name`, `autocomplete`, `inputmode`, …) fall
through to the underlying `<input>`.

Every example is live; flip its source between **Vue** (the styled component) and **HTML** (the
standalone `oriui/css` classes — the same markup for htmx, Astro, Svelte, or plain HTML).

## Classes

The CSS layer composes a field from a block wrapper plus paired token utilities — each pair is a base
class (`ori-color`) plus a scale value (`ori-color_primary`), so a class repoints one token. The
`ori-color` accent is used for the **focus** ring; the idle border is a neutral, theme-aware blend.

| Class                                                 | Category | Values (default in **bold**)                                                 |
| ----------------------------------------------------- | -------- | ---------------------------------------------------------------------------- |
| `ori-input`                                           | Block    | required base class (wrapper)                                                |
| `ori-input_*`                                         | Variant  | **`outline`** · `fill`                                                       |
| `ori-color` + `ori-color_*`                           | Accent   | **`primary`** · `secondary` · `success` · `warn` · `danger` · `info` (focus) |
| `ori-size-action` + `ori-size-action_*`               | Size     | `xs` · `sm` · **`md`** · `lg` · `xl` · `xxl` (field height)                  |
| `ori-size-radius` + `ori-size-radius_*`               | Radius   | `zero` · `xs` · `sm` · **`md`** · `lg` · `xl` · `rounded`                    |
| `ori-font-size` + `ori-font-size_*`                   | Font     | `xs` · `sm` · **`md`** · `lg` · `xl` · `xxl`                                 |
| `ori-input__label` · `__field` · `__hint` · `__error` | Parts    | label / input / helper / error elements                                      |
| `disabled` · `aria-invalid` · `aria-describedby`      | State    | real attributes, not classes                                                 |

## Variants

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
<div class="ori-input ori-color ori-color_primary ori-font-size ori-font-size_md ori-input_outline">
    <label class="ori-input__label" for="name">Outline</label>
    <input
        id="name"
        placeholder="Type here"
        class="ori-input__field ori-size-action ori-size-action_md ori-size-radius ori-size-radius_md"
    />
</div>

<!-- swap the variant: ori-input_outline → ori-input_fill -->
```

::

## Sizes

::example
:ori-input{label="sm" size="sm" placeholder="Small"}
:ori-input{label="md" size="md" placeholder="Medium"}
:ori-input{label="lg" size="lg" placeholder="Large"}

#vue

```vue
<OriInput v-model="value" label="sm" size="sm" />
<OriInput v-model="value" label="lg" size="lg" />
```

#html

```html
<!-- ori-size-action drives the field height; ori-font-size scales the text -->
<div class="ori-input ori-color ori-color_primary ori-font-size ori-font-size_lg ori-input_outline">
    <label class="ori-input__label" for="big">lg</label>
    <input id="big" class="ori-input__field ori-size-action ori-size-action_lg ori-size-radius ori-size-radius_md" />
</div>
```

::

## Label, hint & required

::example
:ori-input{label="Email" type="email" placeholder="you@example.com" hint="We never share it." :required="true"}

#vue

```vue
<OriInput v-model="email" type="email" label="Email" placeholder="you@example.com" hint="We never share it." required />
```

#html

```html
<div class="ori-input ori-color ori-color_primary ori-font-size ori-font-size_md ori-input_outline">
    <label class="ori-input__label" for="email"
        >Email<span class="ori-input__required" aria-hidden="true">*</span></label
    >
    <input
        id="email"
        type="email"
        required
        placeholder="you@example.com"
        aria-describedby="email-hint"
        class="ori-input__field ori-size-action ori-size-action_md ori-size-radius ori-size-radius_md"
    />
    <p id="email-hint" class="ori-input__hint">We never share it.</p>
</div>
```

::

## States

::example
:ori-input{label="Disabled" placeholder="Can't edit" :disabled="true"}
:ori-input{label="With error" type="email" error="Enter a valid email." placeholder="you@example.com"}

#vue

```vue
<OriInput v-model="value" label="Disabled" disabled />
<OriInput v-model="email" label="With error" error="Enter a valid email." />
```

#html

```html
<!-- state is real attributes; the error gets role=alert and is referenced by aria-describedby -->
<input class="ori-input__field …" disabled />

<input class="ori-input__field …" aria-invalid="true" aria-describedby="email-error" />
<p id="email-error" class="ori-input__error" role="alert">Enter a valid email.</p>
```

::

## Accessibility

- The `label` is associated with the field via `for`/`id`; the id is auto-generated (`useId`) when
  you don't pass one, so the association holds even for unlabelled-prop usage.
- `hint` and `error` are wired through `aria-describedby`, referencing only the element that is
  actually rendered (`error` supersedes `hint`). `error` also sets `aria-invalid="true"` and is
  announced via `role="alert"`; `invalid` flips `aria-invalid` on its own.
- Uses the real `disabled` attribute and native `required`; the focus ring is visible and turns
  `danger` when invalid.
- Native attributes (`name`, `autocomplete`, `inputmode`, `maxlength`, `type`, …) pass through to the
  underlying `<input>`.
