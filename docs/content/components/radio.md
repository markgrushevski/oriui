---
title: Radio
---

# Radio

A "choose one" group. A `role="radiogroup"` container names the set (via `aria-labelledby`), and each
option is a **real `<input type="radio">`** sharing a single `name` — so the browser enforces
single-select and native form submission — visually hidden over a styled circle. `v-model` holds the
selected `value`. Pass the options as an array; per-option `disabled` is supported.

Every example is live; flip its source between **Vue** and **HTML** (the standalone `oriui/css`
classes — same markup for htmx, Astro, Svelte, or plain HTML).

## Classes

| Class                                            | Category | Values (default in **bold**)                                         |
| ------------------------------------------------ | -------- | -------------------------------------------------------------------- |
| `ori-radio-group`                                | Block    | container, `role="radiogroup"`                                       |
| `ori-radio-group_inline`                         | Layout   | lay the options out in a row instead of a column                     |
| `ori-color` + `ori-color_*`                      | Accent   | **`primary`** · `secondary` · `success` · `warn` · `danger` · `info` |
| `ori-font-size` + `ori-font-size_*`              | Size     | `xs` · `sm` · **`md`** · `lg` · `xl` · `xxl`                         |
| `ori-radio-group__label` · `__options`           | Parts    | group label / options wrapper                                        |
| `ori-radio` · `__input` · `__circle` · `__label` | Option   | each radio option                                                    |
| `disabled` · `aria-required`                     | State    | real attributes, not classes                                         |

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
<div
    class="ori-radio-group ori-color ori-color_primary ori-font-size ori-font-size_md"
    role="radiogroup"
    aria-labelledby="plan-label"
>
    <div id="plan-label" class="ori-radio-group__label">Choose a plan</div>
    <div class="ori-radio-group__options">
        <label class="ori-radio">
            <input class="ori-radio__input" type="radio" name="plan" value="free" />
            <span class="ori-radio__circle" aria-hidden="true"></span>
            <span class="ori-radio__label">Free</span>
        </label>
        <!-- one <label class="ori-radio"> per option, sharing name="plan" -->
    </div>
</div>
```

::

## Inline

::example
:ori-radio-group{label="Notifications" :inline="true" :options='[{"label":"All","value":"all"},{"label":"Mentions","value":"mentions"},{"label":"None","value":"none"}]'}

#vue

```vue
<OriRadioGroup v-model="notify" label="Notifications" inline :options="notifyOptions" />
```

#html

```html
<!-- ori-radio-group_inline lays the options out in a row -->
<div
    class="ori-radio-group ori-radio-group_inline ori-color ori-color_primary ori-font-size ori-font-size_md"
    role="radiogroup"
>
    …
</div>
```

::

## States

::example
:ori-radio-group{label="Plan (locked)" :disabled="true" :options='[{"label":"Free","value":"free"},{"label":"Pro","value":"pro"}]'}

#vue

```vue
<!-- disable the whole group, or a single option via { disabled: true } -->
<OriRadioGroup v-model="plan" label="Plan (locked)" disabled :options="planOptions" />
```

#html

```html
<div class="ori-radio-group ori-color ori-color_primary ori-font-size ori-font-size_md" role="radiogroup">
    <label class="ori-radio ori-radio_disabled">
        <input class="ori-radio__input" type="radio" name="plan" value="free" disabled />
        <span class="ori-radio__circle" aria-hidden="true"></span>
        <span class="ori-radio__label">Free</span>
    </label>
</div>
```

::

## Accessibility

- A `role="radiogroup"` container with `aria-labelledby` pointing at the group label names the set;
  an unlabelled group can pass `aria-label`, which falls through to the root.
- Each option is a real `<input type="radio">` sharing one `name` (auto `useId`), so keyboard arrow
  navigation, single-select, and form submission are native; the visual `__circle` is `aria-hidden`.
- `disabled` (group or per-option) is the native attribute; `required` sets `aria-required` on the
  group; the focus ring is visible via `:focus-visible`.
