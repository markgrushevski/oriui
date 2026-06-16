---
title: Switch
---

# Switch

An on/off toggle built on a **real `<input type="checkbox" role="switch">`** — kept in the DOM
(visually hidden over a track + thumb) so keyboard, focus, and form submission work for free, and
assistive tech announces it as a switch. `v-model` is a boolean. The "on" track colour and the
`:focus-visible` ring come from the `ori-color` token.

Every example is live; flip its source between **Vue** and **HTML** (the standalone `oriui/css`
classes — same markup for htmx, Astro, Svelte, or plain HTML).

## Classes

| Class                                                   | Category | Values (default in **bold**)                                                  |
| ------------------------------------------------------- | -------- | ----------------------------------------------------------------------------- |
| `ori-switch`                                            | Block    | required base class (the `<label>` wrapper)                                   |
| `ori-color` + `ori-color_*`                             | Accent   | **`primary`** · `secondary` · `success` · `warn` · `danger` · `info`          |
| `ori-font-size` + `ori-font-size_*`                     | Size     | `xs` · `sm` · **`md`** · `lg` · `xl` · `xxl` (the track scales with the text) |
| `ori-switch__input` · `__track` · `__thumb` · `__label` | Parts    | native input / track / thumb / text label                                     |
| `disabled` · `aria-invalid`                             | State    | real attributes, not classes                                                  |

## Colors

::example
:ori-switch{label="Primary" color="primary"}
:ori-switch{label="Success" color="success"}
:ori-switch{label="Danger" color="danger"}

#vue

```vue
<OriSwitch v-model="on" label="Primary" color="primary" />
<OriSwitch v-model="on" label="Success" color="success" />
```

#html

```html
<label class="ori-switch ori-color ori-color_primary ori-font-size ori-font-size_md" for="s1">
    <input id="s1" type="checkbox" role="switch" class="ori-switch__input" />
    <span class="ori-switch__track" aria-hidden="true"><span class="ori-switch__thumb"></span></span>
    <span class="ori-switch__label">Primary</span>
</label>
```

::

## Sizes

::example
:ori-switch{label="sm" size="sm"}
:ori-switch{label="md" size="md"}
:ori-switch{label="lg" size="lg"}

#vue

```vue
<OriSwitch v-model="on" label="sm" size="sm" />
<OriSwitch v-model="on" label="lg" size="lg" />
```

#html

```html
<!-- the track and thumb scale off ori-font-size -->
<label class="ori-switch ori-color ori-color_primary ori-font-size ori-font-size_lg" for="big">
    <input id="big" type="checkbox" role="switch" class="ori-switch__input" />
    <span class="ori-switch__track" aria-hidden="true"><span class="ori-switch__thumb"></span></span>
    <span class="ori-switch__label">lg</span>
</label>
```

::

## States

::example
:ori-switch{label="Disabled" :disabled="true"}

#vue

```vue
<OriSwitch v-model="on" label="Disabled" disabled />
```

#html

```html
<label class="ori-switch ori-switch_disabled ori-color ori-color_primary ori-font-size ori-font-size_md" for="d1">
    <input id="d1" type="checkbox" role="switch" class="ori-switch__input" disabled />
    <span class="ori-switch__track" aria-hidden="true"><span class="ori-switch__thumb"></span></span>
    <span class="ori-switch__label">Disabled</span>
</label>
```

::

## Accessibility

- A real `<input type="checkbox" role="switch">` drives keyboard and form behavior and is announced
  as a switch; the visual `__track` / `__thumb` are `aria-hidden`.
- The wrapping `<label>` (with `for`/`id`, auto `useId`) names the control — clicking the label or
  text toggles it.
- Focus is visible via `:focus-visible` on the track; `disabled` is the native attribute; `invalid`
  sets `aria-invalid="true"`.
