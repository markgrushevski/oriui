---
title: Alert
---

# Alert

A styled, accessible notification banner. Renders `role="alert"` so assistive technology
announces it immediately when it appears — no extra wiring required. It supports an optional
icon, a title, body text, an actions row, and a dismiss button.

Every example is live and shows the standalone **HTML / `oriui/css`** markup by default — the same
classes you'd use in htmx, Astro, Svelte, or plain HTML. Flip any example to **Vue** for the styled
component.

## Classes

An alert is a block class plus paired token utilities — each pair is a base class (`ori-color`) and
a scale value (`ori-color_info`), so one class repoints one token. The Vue props in
[Framework API](#framework-api) map 1:1 to these.

:class-table{:rows='[{"class":"ori-alert","type":"Block","description":"Required base class. Renders role=alert."},{"class":"ori-variant + ori-variant_*","type":"Style","description":"fill · <b>tonal</b> · outline · text · plain"},{"class":"ori-color + ori-color_*","type":"Color","description":"primary · secondary · success · warn · danger · <b>info</b> · surface · background"},{"class":"ori-size-radius + ori-size-radius_*","type":"Radius","description":"zero · xs · sm · <b>md</b> · lg · xl · rounded"},{"class":"ori-font-size + ori-font-size_*","type":"Size","description":"xs · sm · <b>md</b> · lg · xl · xxl — scales the body text"},{"class":"ori-alert__icon · ori-alert__content · ori-alert__title · ori-alert__body · ori-alert__actions · ori-alert__close","type":"Part","description":"internal layout elements"}]'}

## Variants

Five visual styles, all driven by the `ori-variant` token pair. `tonal` is the default.

::example
:ori-alert{text="Fill alert" variant="fill" color="info"}
:ori-alert{text="Tonal alert" variant="tonal" color="info"}
:ori-alert{text="Outline alert" variant="outline" color="info"}
:ori-alert{text="Text alert" variant="text" color="info"}
:ori-alert{text="Plain alert" variant="plain" color="info"}

#vue

```vue
<OriAlert text="Fill alert" variant="fill" color="info" />
<OriAlert text="Tonal alert" variant="tonal" color="info" />
<OriAlert text="Outline alert" variant="outline" color="info" />
<OriAlert text="Text alert" variant="text" color="info" />
<OriAlert text="Plain alert" variant="plain" color="info" />
```

#html

```html
<div class="ori-alert ori-variant ori-variant_tonal ori-color ori-color_info" role="alert">
    <div class="ori-alert__content">
        <div class="ori-alert__body">Tonal alert</div>
    </div>
</div>
<!-- swap the variant pair: ori-variant_tonal → _fill / _outline / _text / _plain -->
```

::

## Colors

Every semantic role. Use `success`, `warn`, `danger`, and `info` for status messages.

::example
:ori-alert{text="Primary" color="primary"}
:ori-alert{text="Secondary" color="secondary"}
:ori-alert{text="Success" color="success"}
:ori-alert{text="Warning" color="warn"}
:ori-alert{text="Danger" color="danger"}
:ori-alert{text="Info" color="info"}

#vue

```vue
<OriAlert text="Primary" color="primary" />
<OriAlert text="Success" color="success" />
<OriAlert text="Warning" color="warn" />
<OriAlert text="Danger" color="danger" />
<OriAlert text="Info" color="info" />
```

#html

```html
<!-- swap the color pair: ori-color_info → _success / _warn / _danger / _primary -->
<div class="ori-alert ori-variant ori-variant_tonal ori-color ori-color_danger" role="alert">
    <div class="ori-alert__content">
        <div class="ori-alert__body">Danger</div>
    </div>
</div>
```

::

Variant and color compose freely — e.g. an outline danger alert:

::example
:ori-alert{text="Something went wrong. Please try again." variant="outline" color="danger"}
:ori-alert{text="Your changes have been saved." variant="fill" color="success"}

#vue

```vue
<OriAlert text="Something went wrong. Please try again." variant="outline" color="danger" />
<OriAlert text="Your changes have been saved." variant="fill" color="success" />
```

#html

```html
<div class="ori-alert ori-variant ori-variant_outline ori-color ori-color_danger" role="alert">
    <div class="ori-alert__content">
        <div class="ori-alert__body">Something went wrong. Please try again.</div>
    </div>
</div>
```

::

## With title

Pass `title` to add a bold heading above the body text.

::example
:ori-alert{title="Session expired" text="Please sign in again to continue." color="warn"}

#vue

```vue
<OriAlert title="Session expired" text="Please sign in again to continue." color="warn" />
```

#html

```html
<div class="ori-alert ori-variant ori-variant_tonal ori-color ori-color_warn" role="alert">
    <div class="ori-alert__content">
        <div class="ori-alert__title">Session expired</div>
        <div class="ori-alert__body">Please sign in again to continue.</div>
    </div>
</div>
```

::

## With icon

Pass an SVG path to `icon` to prepend a visual cue.

::example
:ori-alert{title="Success" text="Your profile has been updated." color="success" icon="M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"}
:ori-alert{title="Warning" text="Disk space is running low." color="warn" icon="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"}
:ori-alert{title="Error" text="Failed to load data." color="danger" icon="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"}

#vue

```vue
<!-- success -->
<OriAlert
    title="Success"
    text="Your profile has been updated."
    color="success"
    icon="M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"
/>
<!-- warning -->
<OriAlert
    title="Warning"
    text="Disk space is running low."
    color="warn"
    icon="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"
/>
```

#html

```html
<div class="ori-alert ori-variant ori-variant_tonal ori-color ori-color_success" role="alert">
    <div class="ori-alert__icon">
        <i class="ori-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24"><path d="M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" /></svg>
        </i>
    </div>
    <div class="ori-alert__content">
        <div class="ori-alert__title">Success</div>
        <div class="ori-alert__body">Your profile has been updated.</div>
    </div>
</div>
```

::

## Dismissible

`closable` adds a close button in the top-right corner. Handle the `close` event to remove or hide
the alert. The button label defaults to `"Dismiss"` and is configurable via `closeLabel`.

::example
:ori-alert{title="Update available" text="A new version is ready to install." color="info" :closable="true"}

#vue

```vue
<script setup lang="ts">
import { ref } from 'vue';
const visible = ref(true);
</script>

<template>
    <OriAlert
        v-if="visible"
        title="Update available"
        text="A new version is ready to install."
        color="info"
        closable
        @close="visible = false"
    />
</template>
```

#html

```html
<div class="ori-alert ori-variant ori-variant_tonal ori-color ori-color_info" role="alert">
    <div class="ori-alert__content">
        <div class="ori-alert__title">Update available</div>
        <div class="ori-alert__body">A new version is ready to install.</div>
    </div>
    <button type="button" class="ori-alert__close" aria-label="Dismiss">
        <!-- close icon -->
    </button>
</div>
```

::

## Sizes

`size` scales the body text from `xs` to `xxl`. The default is `md`.

::example
:ori-alert{text="Extra small alert" size="xs" color="info"}
:ori-alert{text="Small alert" size="sm" color="info"}
:ori-alert{text="Medium alert (default)" size="md" color="info"}
:ori-alert{text="Large alert" size="lg" color="info"}

#vue

```vue
<OriAlert text="Extra small alert" size="xs" color="info" />
<OriAlert text="Small alert" size="sm" color="info" />
<OriAlert text="Medium alert (default)" size="md" color="info" />
<OriAlert text="Large alert" size="lg" color="info" />
```

#html

```html
<!-- swap the font-size pair: ori-font-size_md → _xs / _sm / _lg / _xl / _xxl -->
<div
    class="ori-alert ori-font-size ori-font-size_lg ori-variant ori-variant_tonal ori-color ori-color_info"
    role="alert"
>
    <div class="ori-alert__content">
        <div class="ori-alert__body">Large alert</div>
    </div>
</div>
```

::

## Radius

From `zero` (sharp corners) to `rounded` (pill). Default is `md`.

::example
:ori-alert{text="No radius" radius="zero" color="info"}
:ori-alert{text="Small radius" radius="sm" color="info"}
:ori-alert{text="Medium radius (default)" radius="md" color="info"}
:ori-alert{text="Large radius" radius="lg" color="info"}
:ori-alert{text="Rounded" radius="rounded" color="info"}

#vue

```vue
<OriAlert text="No radius" radius="zero" color="info" />
<OriAlert text="Medium radius (default)" radius="md" color="info" />
<OriAlert text="Rounded" radius="rounded" color="info" />
```

#html

```html
<!-- swap the radius pair: ori-size-radius_md → _zero / _sm / _lg / _xl / _rounded -->
<div
    class="ori-alert ori-size-radius ori-size-radius_rounded ori-variant ori-variant_tonal ori-color ori-color_info"
    role="alert"
>
    <div class="ori-alert__content">
        <div class="ori-alert__body">Rounded</div>
    </div>
</div>
```

::

## Common patterns

A form submission result and a persistent banner with actions — the everyday compositions.

::example
:ori-alert{title="Payment failed" text="Your card was declined. Check your details and try again." color="danger" variant="outline" icon="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" :closable="true"}

#vue

```vue
<!-- form error banner -->
<OriAlert
    title="Payment failed"
    text="Your card was declined. Check your details and try again."
    color="danger"
    variant="outline"
    icon="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"
    closable
    @close="handleDismiss"
/>

<!-- alert with an actions slot -->
<OriAlert title="New terms of service" color="warn" variant="tonal">
    <template #text>We have updated our terms. Please review before continuing.</template>
    <template #actions>
        <OriButton text="Review" size="sm" variant="tonal" color="warn" />
        <OriButton text="Dismiss" size="sm" variant="text" color="warn" />
    </template>
</OriAlert>
```

#html

```html
<!-- form error banner -->
<div class="ori-alert ori-variant ori-variant_outline ori-color ori-color_danger" role="alert">
    <div class="ori-alert__icon">
        <i class="ori-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24">
                <path
                    d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"
                />
            </svg>
        </i>
    </div>
    <div class="ori-alert__content">
        <div class="ori-alert__title">Payment failed</div>
        <div class="ori-alert__body">Your card was declined. Check your details and try again.</div>
    </div>
    <button type="button" class="ori-alert__close" aria-label="Dismiss"><!-- icon --></button>
</div>

<!-- alert with actions row -->
<div class="ori-alert ori-variant ori-variant_tonal ori-color ori-color_warn" role="alert">
    <div class="ori-alert__content">
        <div class="ori-alert__title">New terms of service</div>
        <div class="ori-alert__body">We have updated our terms. Please review before continuing.</div>
        <div class="ori-alert__actions">
            <button class="ori-button ori-variant ori-variant_tonal ori-color ori-color_warn …">Review</button>
            <button class="ori-button ori-variant ori-variant_text ori-color ori-color_warn …">Dismiss</button>
        </div>
    </div>
</div>
```

::

## Accessibility

The accessibility contract holds across every layer — the standalone classes and the Vue component
render the same attributes.

- Renders a `<div role="alert">` — an ARIA live region with an implicit `aria-live="assertive"` and
  `aria-atomic="true"`. The browser announces the full content to screen readers immediately when the
  element is inserted into the DOM.
- Icons inside the alert are decorative (`aria-hidden="true"` on the `ori-icon`); the alert text itself
  is the accessible announcement.
- The dismiss button has an `aria-label` (default `"Dismiss"`, configurable via `closeLabel`) so its
  purpose is clear without visible text.
- The dismiss button has a visible `:focus-visible` ring. No other keyboard interaction is required;
  the alert itself is not focusable.
- Do not inject `role="alert"` elements that are hidden and then reveal them — some screen readers
  announce only content present at insertion time. Insert or show the element with content already in
  place.

| Key     | Action                                          |
| ------- | ----------------------------------------------- |
| `Tab`   | Moves focus to the dismiss button (if present). |
| `Enter` | Activates the focused dismiss button.           |
| `Space` | Activates the focused dismiss button.           |

## Framework API

The props, events, slots, and slots of the **Vue** component. The standalone CSS layer has no
component API — its surface is the [classes](#classes) above. (Svelte bindings are planned.)

### Props

| Prop         | Type                                                  | Default     | Description                                                                                 |
| ------------ | ----------------------------------------------------- | ----------- | ------------------------------------------------------------------------------------------- |
| `closable`   | `boolean`                                             | `false`     | Renders a dismiss button; emit `close` to remove the alert.                                 |
| `closeLabel` | `string`                                              | `'Dismiss'` | `aria-label` on the dismiss button.                                                         |
| `color`      | `ThemeColor`                                          | `'info'`    | Semantic role: primary · secondary · success · warn · danger · info · surface · background. |
| `icon`       | `string`                                              | —           | SVG path for the leading icon. Use the `icon` slot for custom markup.                       |
| `radius`     | `RadiusSize`                                          | `'md'`      | Corner radius (`zero` · xs · sm · md · lg · xl · `rounded`).                                |
| `size`       | `ActionSize`                                          | `'md'`      | Body font scale (`xs`–`xxl`).                                                               |
| `text`       | `string`                                              | —           | Body text. Use the `default` slot for richer markup.                                        |
| `title`      | `string`                                              | —           | Bold heading above the body. Use the `title` slot for richer markup.                        |
| `variant`    | `'fill' \| 'tonal' \| 'outline' \| 'text' \| 'plain'` | `'tonal'`   | Visual style.                                                                               |

`ThemeColor`: `'primary' | 'secondary' | 'success' | 'warn' | 'danger' | 'info' | 'surface' | 'background'`

`ActionSize`: `'text' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl'`

`RadiusSize`: `'zero' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'rounded'`

### Events & attributes

| Event   | Payload | Description                                                                     |
| ------- | ------- | ------------------------------------------------------------------------------- |
| `close` | —       | Emitted when the dismiss button is clicked. Use it to hide or remove the alert. |

OriAlert does not set `inheritAttrs: false`, so extra attributes (`class`, `style`, `data-*`, …)
fall through to the root `<div role="alert">`.

### Slots

| Slot      | Description                                                                                                                            |
| --------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `default` | Body content. Replaces the `text` prop; renders inside `ori-alert__body`.                                                              |
| `icon`    | Custom icon markup. Replaces the `icon` prop; renders inside `ori-alert__icon`.                                                        |
| `title`   | Custom title markup. Replaces the `title` prop; renders inside `ori-alert__title`.                                                     |
| `actions` | Action controls (buttons, links) rendered in a flex row below the body (`ori-alert__actions`). Only mounted when the slot is provided. |
