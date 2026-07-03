---
title: Alert
---

# Alert

A styled, accessible notification banner. Its live-region politeness is derived from the color —
urgent `danger` / `warn` render `role="alert"` (assertive), everything else `role="status"` (polite) —
so a non-urgent banner isn't announced assertively (override with the `live` prop). It supports an
optional icon, a title, body text, an actions row, and a dismiss button.

The examples are organised by **layer**: the [class reference](#classes) is the standalone
**`@oriui/css`** layer, and the [Framework API](#framework-api) is the **`@oriui/vue`** component. Every
example is live — flip its code between **HTML** (the standalone classes, also your htmx / Astro / Svelte /
plain-HTML usage), **Vue**; HTML is the default.

## Classes

An alert is a block class plus single-class token utilities — one class repoints one token; no base
class needed. The Vue props in [Framework API](#framework-api) map 1:1 to these.

<!-- prettier-ignore -->
:class-table{:rows='[{"class":"ori-alert","type":"Block","description":"Required base class. The Vue component sets role=alert (danger/warn) or role=status (otherwise); standalone markup picks the role itself."},{"class":"ori-variant_*","type":"Style","description":"fill · <b>tonal</b> · outline · text · plain"},{"class":"ori-color_*","type":"Color","description":"primary · secondary · success · warn · danger · <b>info</b> · surface · background"},{"class":"ori-size-radius_*","type":"Radius","description":"zero · xs · sm · <b>md</b> · lg · xl · rounded"},{"class":"ori-font-size_*","type":"Size","description":"xs · sm · <b>md</b> · lg · xl · xxl — scales the body text"},{"class":"ori-alert__icon · ori-alert__content · ori-alert__title · ori-alert__body · ori-alert__actions · ori-alert__close","type":"Part","description":"internal layout elements"}]'}

## Variants

Five visual styles, all driven by the `ori-variant_*` utility. `tonal` is the default.

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
<div class="ori-alert ori-variant_tonal ori-color_info" role="status">
    <div class="ori-alert__content">
        <div class="ori-alert__body">Tonal alert</div>
    </div>
</div>
<!-- swap the variant: ori-variant_tonal → ori-variant_fill / ori-variant_outline / ori-variant_text / ori-variant_plain -->
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
<!-- swap the color: ori-color_info → ori-color_success / ori-color_warn / ori-color_danger / ori-color_primary -->
<div class="ori-alert ori-variant_tonal ori-color_danger" role="alert">
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
<div class="ori-alert ori-variant_outline ori-color_danger" role="alert">
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
<div class="ori-alert ori-variant_tonal ori-color_warn" role="alert">
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
<div class="ori-alert ori-variant_tonal ori-color_success" role="status">
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
<div class="ori-alert ori-variant_tonal ori-color_info" role="status">
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
<!-- swap the font-size: ori-font-size_md → ori-font-size_xs / ori-font-size_sm / ori-font-size_lg / ori-font-size_xl / ori-font-size_xxl -->
<div class="ori-alert ori-font-size_lg ori-variant_tonal ori-color_info" role="status">
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
<!-- swap the radius: ori-size-radius_md → ori-size-radius_zero / ori-size-radius_sm / ori-size-radius_lg / ori-size-radius_xl / ori-size-radius_rounded -->
<div class="ori-alert ori-size-radius_rounded ori-variant_tonal ori-color_info" role="status">
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
<OriAlert
    title="New terms of service"
    text="We have updated our terms. Please review before continuing."
    color="warn"
    variant="tonal"
>
    <template #actions>
        <OriButton text="Review" size="sm" variant="tonal" color="warn" />
        <OriButton text="Dismiss" size="sm" variant="text" color="warn" />
    </template>
</OriAlert>
```

#html

```html
<!-- form error banner -->
<div class="ori-alert ori-variant_outline ori-color_danger" role="alert">
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
<div class="ori-alert ori-variant_tonal ori-color_warn" role="alert">
    <div class="ori-alert__content">
        <div class="ori-alert__title">New terms of service</div>
        <div class="ori-alert__body">We have updated our terms. Please review before continuing.</div>
        <div class="ori-alert__actions">
            <button class="ori-button ori-variant_tonal ori-color_warn …">Review</button>
            <button class="ori-button ori-variant_text ori-color_warn …">Dismiss</button>
        </div>
    </div>
</div>
```

::

## Accessibility

The accessibility contract holds across every layer — the standalone classes and the Vue component
render the same attributes.

- The **live-region politeness is derived from the color** so non-urgent content isn't announced
  assertively: urgent colors (`danger` / `warn`) render `role="alert"` (`aria-live="assertive"` —
  interrupts the screen reader), and everything else (the `info` default, `success`, …) renders
  `role="status"` (`aria-live="polite"` — announced at the next pause). Override with the `live` prop
  (`assertive` / `polite` / `off`); `off` removes the live region entirely (for content that is part of
  the static page and shouldn't be announced as it appears).
- Icons inside the alert are decorative (`aria-hidden="true"` on the `ori-icon`); the alert text itself
  is the accessible announcement.
- The dismiss button has an `aria-label` (default `"Dismiss"`, configurable via `closeLabel`) so its
  purpose is clear without visible text.
- The dismiss button has a visible `:focus-visible` ring. No other keyboard interaction is required;
  the alert itself is not focusable.
- For a **live** announcement, insert (or reveal) the element with its content already in place — some
  screen readers announce only content present when the region appears. For content that is part of the
  page on load, prefer `live="off"` (or a non-urgent color) so it isn't announced as the page renders.

| Key     | Action                                          |
| ------- | ----------------------------------------------- |
| `Tab`   | Moves focus to the dismiss button (if present). |
| `Enter` | Activates the focused dismiss button.           |
| `Space` | Activates the focused dismiss button.           |

## Framework API

The props, events, slots, and slots of the **Vue** component. The standalone CSS layer has no
component API — its surface is the [classes](#classes) above. (Svelte bindings are planned.)

### Props

| Prop         | Type                                                  | Default     | Description                                                                                                                                                     |
| ------------ | ----------------------------------------------------- | ----------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `closable`   | `boolean`                                             | `false`     | Renders a dismiss button; emit `close` to remove the alert.                                                                                                     |
| `closeLabel` | `string`                                              | `'Dismiss'` | `aria-label` on the dismiss button.                                                                                                                             |
| `color`      | `ThemeColor`                                          | `'info'`    | Semantic role: primary · secondary · success · warn · danger · info · surface · background.                                                                     |
| `icon`       | `string`                                              | —           | SVG path for the leading icon. Use the `icon` slot for custom markup.                                                                                           |
| `live`       | `'assertive' \| 'polite' \| 'off'`                    | _derived_   | Live-region politeness. Defaults to `assertive` (`role="alert"`) for `danger` / `warn` and `polite` (`role="status"`) otherwise; `off` removes the live region. |
| `radius`     | `RadiusSize`                                          | `'md'`      | Corner radius (`zero` · xs · sm · md · lg · xl · `rounded`).                                                                                                    |
| `size`       | `ActionSize`                                          | `'md'`      | Body font scale (`xs`–`xxl`).                                                                                                                                   |
| `text`       | `string`                                              | —           | Body text. Use the `default` slot for richer markup.                                                                                                            |
| `title`      | `string`                                              | —           | Bold heading above the body. Use the `title` slot for richer markup.                                                                                            |
| `variant`    | `'fill' \| 'tonal' \| 'outline' \| 'text' \| 'plain'` | `'tonal'`   | Visual style.                                                                                                                                                   |

`ThemeColor`: `'primary' | 'secondary' | 'success' | 'warn' | 'danger' | 'info' | 'surface' | 'background'`

`ActionSize`: `'text' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl'`

`RadiusSize`: `'zero' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'rounded'`

### Events & attributes

| Event   | Payload | Description                                                                     |
| ------- | ------- | ------------------------------------------------------------------------------- |
| `close` | —       | Emitted when the dismiss button is clicked. Use it to hide or remove the alert. |

OriAlert does not set `inheritAttrs: false`, so extra attributes (`class`, `style`, `data-*`, …)
fall through to the root `<div>` (whose `role` is `alert` / `status` / none per the `live` rule above).

### Slots

| Slot      | Description                                                                                                                            |
| --------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `default` | Body content. Replaces the `text` prop; renders inside `ori-alert__body`.                                                              |
| `icon`    | Custom icon markup. Replaces the `icon` prop; renders inside `ori-alert__icon`.                                                        |
| `title`   | Custom title markup. Replaces the `title` prop; renders inside `ori-alert__title`.                                                     |
| `actions` | Action controls (buttons, links) rendered in a flex row below the body (`ori-alert__actions`). Only mounted when the slot is provided. |
