---
title: Progress
---

# Progress

A horizontal progress bar that communicates task completion. It supports a determinate mode (a
known `value` out of a `max`) and an indeterminate mode (animated sweep) for tasks with no
measurable progress. State is expressed through ARIA attributes — `aria-valuenow` is omitted when
indeterminate, giving screen readers the correct cue automatically.

Every example is live and shows the standalone **HTML / `oriui/css`** markup by default — the same
classes you'd use in htmx, Astro, Svelte, or plain HTML. Flip any example to **Vue** for the styled
component.

## Classes

A progress bar is a block class plus paired token utilities. The Vue props in
[Framework API](#framework-api) map 1:1 to these.

:class-table{:rows='[{"class":"ori-progress","type":"Block","description":"Required base class. Renders full-width."},{"class":"ori-progress_sm · ori-progress_md · ori-progress_lg","type":"Size","description":"Track height: 4 px (sm) · <b>8 px (md)</b> · 12 px (lg)"},{"class":"ori-color + ori-color_*","type":"Color","description":"primary · secondary · success · warn · danger · info · surface — inherits currentcolor when omitted"},{"class":"ori-size-radius + ori-size-radius_*","type":"Radius","description":"zero · xs · sm · md · lg · xl · <b>rounded</b>"},{"class":"ori-progress__track","type":"Part","description":"Inner track element (tinted background)."},{"class":"ori-progress__indicator","type":"Part","description":"Fill element; width driven by inline style or data-indeterminate animation."},{"class":"data-indeterminate","type":"State","description":"Present on the indicator when no value is known; triggers the sweep animation."}]'}

## Determinate

Pass a `value` (0–`max`). The fill width and `aria-valuenow` update together.

::example
:ori-progress{:value="25" color="primary"}
:ori-progress{:value="50" color="primary"}
:ori-progress{:value="75" color="primary"}
:ori-progress{:value="100" color="primary"}

#vue

```vue
<OriProgress :value="25" color="primary" />
<OriProgress :value="50" color="primary" />
<OriProgress :value="75" color="primary" />
<OriProgress :value="100" color="primary" />
```

#html

```html
<!-- width is set via inline style on the indicator -->
<div
    class="ori-progress ori-progress_md ori-color ori-color_primary"
    role="progressbar"
    aria-label="Loading"
    aria-valuemin="0"
    aria-valuemax="100"
    aria-valuenow="50"
>
    <div class="ori-progress__track">
        <div class="ori-progress__indicator" style="width: 50%"></div>
    </div>
</div>
```

::

## Indeterminate

Omit `value` (or pass `:indeterminate="true"`) when progress cannot be measured. The indicator
sweeps continuously and `aria-valuenow` is not set.

::example
:ori-progress{:indeterminate="true" color="primary"}

#vue

```vue
<OriProgress indeterminate color="primary" />
```

#html

```html
<div
    class="ori-progress ori-progress_md ori-color ori-color_primary"
    role="progressbar"
    aria-label="Loading"
    aria-valuemin="0"
    aria-valuemax="100"
>
    <div class="ori-progress__track">
        <div class="ori-progress__indicator" data-indeterminate></div>
    </div>
</div>
```

::

## Colors

Every semantic role. Omit `color` to inherit `currentcolor` from the parent.

::example
:ori-progress{:value="60" color="primary"}
:ori-progress{:value="60" color="secondary"}
:ori-progress{:value="60" color="success"}
:ori-progress{:value="60" color="warn"}
:ori-progress{:value="60" color="danger"}
:ori-progress{:value="60" color="info"}

#vue

```vue
<OriProgress :value="60" color="primary" />
<OriProgress :value="60" color="secondary" />
<OriProgress :value="60" color="success" />
<OriProgress :value="60" color="warn" />
<OriProgress :value="60" color="danger" />
<OriProgress :value="60" color="info" />
```

#html

```html
<!-- swap the color pair: ori-color_primary → _secondary / _success / _warn / _danger / _info -->
<div
    class="ori-progress ori-progress_md ori-color ori-color_danger"
    role="progressbar"
    aria-label="Loading"
    aria-valuemin="0"
    aria-valuemax="100"
    aria-valuenow="60"
>
    <div class="ori-progress__track">
        <div class="ori-progress__indicator" style="width: 60%"></div>
    </div>
</div>
```

::

## Sizes

Three track heights — `sm` (4 px), `md` (8 px, default), and `lg` (12 px).

::example
:ori-progress{:value="50" size="sm" color="primary"}
:ori-progress{:value="50" size="md" color="primary"}
:ori-progress{:value="50" size="lg" color="primary"}

#vue

```vue
<OriProgress :value="50" size="sm" color="primary" />
<OriProgress :value="50" size="md" color="primary" />
<OriProgress :value="50" size="lg" color="primary" />
```

#html

```html
<!-- swap the size modifier: ori-progress_sm / ori-progress_md / ori-progress_lg -->
<div
    class="ori-progress ori-progress_lg ori-color ori-color_primary"
    role="progressbar"
    aria-label="Loading"
    aria-valuemin="0"
    aria-valuemax="100"
    aria-valuenow="50"
>
    <div class="ori-progress__track">
        <div class="ori-progress__indicator" style="width: 50%"></div>
    </div>
</div>
```

::

## Radius

From `zero` (square) to `rounded` (pill, default).

::example
:ori-progress{:value="60" radius="zero" size="lg" color="primary"}
:ori-progress{:value="60" radius="sm" size="lg" color="primary"}
:ori-progress{:value="60" radius="md" size="lg" color="primary"}
:ori-progress{:value="60" radius="rounded" size="lg" color="primary"}

#vue

```vue
<OriProgress :value="60" radius="zero" size="lg" color="primary" />
<OriProgress :value="60" radius="sm" size="lg" color="primary" />
<OriProgress :value="60" radius="rounded" size="lg" color="primary" />
```

#html

```html
<!-- swap the radius pair: ori-size-radius_zero → _sm / _md / _rounded -->
<div
    class="ori-progress ori-progress_lg ori-size-radius ori-size-radius_zero ori-color ori-color_primary"
    role="progressbar"
    aria-label="Loading"
    aria-valuemin="0"
    aria-valuemax="100"
    aria-valuenow="60"
>
    <div class="ori-progress__track">
        <div class="ori-progress__indicator" style="width: 60%"></div>
    </div>
</div>
```

::

## Custom max

`max` defaults to `100`. Pass any positive number and supply `value` in the same unit — the
component calculates the fill percentage.

::example
:ori-progress{:value="3" :max="10" color="success" label="Step 3 of 10"}

#vue

```vue
<OriProgress :value="3" :max="10" color="success" label="Step 3 of 10" />
```

#html

```html
<div
    class="ori-progress ori-progress_md ori-color ori-color_success"
    role="progressbar"
    aria-label="Step 3 of 10"
    aria-valuemin="0"
    aria-valuemax="10"
    aria-valuenow="3"
>
    <div class="ori-progress__track">
        <div class="ori-progress__indicator" style="width: 30%"></div>
    </div>
</div>
```

::

## Common patterns

An upload bar with a label and a multi-step wizard indicator.

::example
:ori-progress{:value="68" color="primary" size="sm" label="Uploading file"}
:ori-progress{:value="2" :max="5" color="secondary" label="Step 2 of 5"}
:ori-progress{:indeterminate="true" color="info" label="Fetching results"}

#vue

```vue
<!-- upload progress -->
<div style="display: flex; flex-direction: column; gap: 0.25rem">
    <span style="font-size: 0.875rem">Uploading… 68 %</span>
    <OriProgress :value="68" color="primary" size="sm" label="Uploading file" />
</div>

<!-- wizard step indicator -->
<OriProgress :value="2" :max="5" color="secondary" label="Step 2 of 5" />

<!-- indeterminate fetch -->
<OriProgress indeterminate color="info" label="Fetching results" />
```

#html

```html
<div style="display: flex; flex-direction: column; gap: 0.25rem">
    <span style="font-size: 0.875rem">Uploading… 68 %</span>
    <div
        class="ori-progress ori-progress_sm ori-color ori-color_primary"
        role="progressbar"
        aria-label="Uploading file"
        aria-valuemin="0"
        aria-valuemax="100"
        aria-valuenow="68"
    >
        <div class="ori-progress__track">
            <div class="ori-progress__indicator" style="width: 68%"></div>
        </div>
    </div>
</div>

<div
    class="ori-progress ori-progress_md ori-color ori-color_secondary"
    role="progressbar"
    aria-label="Step 2 of 5"
    aria-valuemin="0"
    aria-valuemax="5"
    aria-valuenow="2"
>
    <div class="ori-progress__track">
        <div class="ori-progress__indicator" style="width: 40%"></div>
    </div>
</div>
```

::

## Accessibility

The accessibility contract holds across every layer — the standalone classes and the Vue component
render the same attributes.

- Renders a `<div role="progressbar">` with `aria-valuemin="0"`, `aria-valuemax`, and
  `aria-valuenow` set from `value` and `max`.
- In indeterminate mode `aria-valuenow` is omitted — the WAI-ARIA spec says a progressbar without
  `aria-valuenow` is implicitly indeterminate, which assistive technology announces accordingly.
- The `label` prop sets `aria-label`. Always supply a meaningful label so screen readers can
  distinguish multiple bars on the same page (e.g. `"Uploading avatar"` vs `"Saving settings"`).
- The fill animation respects `prefers-reduced-motion`: the transition on the determinate indicator
  is removed and the indeterminate sweep freezes to a fully-filled bar.
- The component is not interactive — no keyboard interaction is defined.

## Framework API

The props, events, and slots of the **Vue** component. The standalone CSS layer has no component
API — its surface is the [classes](#classes) above. (Svelte bindings are planned.)

### Props

| Prop            | Type                   | Default     | Description                                                                                       |
| --------------- | ---------------------- | ----------- | ------------------------------------------------------------------------------------------------- |
| `color`         | `ThemeColor`           | —           | Semantic color role. Omit to inherit `currentcolor` from the parent.                              |
| `indeterminate` | `boolean`              | `false`     | Enables the animated sweep; omits `aria-valuenow` from the rendered element.                      |
| `label`         | `string`               | `'Loading'` | `aria-label` read by assistive technology. Use a descriptive message per-bar.                     |
| `max`           | `number`               | `100`       | Upper bound. `value` is clamped to this range before the percentage is computed.                  |
| `radius`        | `RadiusSize`           | `'rounded'` | Corner radius of the track and indicator (`zero` · `xs` · `sm` · `md` · `lg` · `xl` · `rounded`). |
| `size`          | `'sm' \| 'md' \| 'lg'` | `'md'`      | Track height: `sm` = 4 px, `md` = 8 px, `lg` = 12 px.                                             |
| `value`         | `number`               | `0`         | Current progress value, clamped to `[0, max]`. Ignored when `indeterminate` is `true`.            |

`ThemeColor`: `'primary' | 'secondary' | 'success' | 'warn' | 'danger' | 'info' | 'surface' | 'background'`

`RadiusSize`: `'zero' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'rounded'`

### Events & attributes

OriProgress declares **no custom events** and does not set `inheritAttrs: false`, so any extra
attributes you pass (`class`, `style`, `data-*`) fall through to the root `<div role="progressbar">`.
The ARIA attributes (`aria-label`, `aria-valuemin`, `aria-valuemax`, `aria-valuenow`) are bound
directly from props — set them through props rather than as fall-through attributes.

### Slots

OriProgress has **no slots**. Its visual output is a CSS-driven track and fill bar controlled
entirely by props.
