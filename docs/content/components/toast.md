---
title: Toast
---

# Toast

An imperative notification system. Push a toast from anywhere with `useToast()` and render
`<OriToaster />` once near the app root to display the queue. No event bus, no Vuex, no provide/inject —
just a module-level reactive queue that every call site shares.

The live demo below fires real toasts into the docs page (an `<OriToaster />` is already mounted in
the docs layout). The appearance examples further down use the static `<OriToast>` component to
show the look without triggering a notification.

## Classes

<!-- prettier-ignore -->
:class-table{:rows='[{"class":"ori-toaster","type":"Block","description":"Fixed portal container (pointer-events: none so it never blocks the page). Rendered by OriToaster via Teleport to body."},{"class":"ori-toaster_top-right","type":"Position","description":"Anchors the stack to the top-right corner (default)."},{"class":"ori-toaster_top-left","type":"Position","description":"Anchors the stack to the top-left corner."},{"class":"ori-toaster_top-center","type":"Position","description":"Anchors the stack to the top-center."},{"class":"ori-toaster_bottom-right","type":"Position","description":"Anchors the stack to the bottom-right corner."},{"class":"ori-toaster_bottom-left","type":"Position","description":"Anchors the stack to the bottom-left corner."},{"class":"ori-toaster_bottom-center","type":"Position","description":"Anchors the stack to the bottom-center."},{"class":"ori-toast","type":"Block","description":"Single notification card: surface background, role-coloured left-border accent, elevation shadow."},{"class":"ori-color_*","type":"Color","description":"Repoints --ori-color to drive the accent. Applied by useToast() severity shortcuts (success / danger / warn / info). Plain toast has no color class."},{"class":"ori-toast__icon","type":"Part","description":"Leading icon element; coloured by --ori-color."},{"class":"ori-toast__body","type":"Part","description":"Flex column holding the title and text."},{"class":"ori-toast__title","type":"Part","description":"Bold heading above the body text."},{"class":"ori-toast__text","type":"Part","description":"Body message; slightly muted opacity."},{"class":"ori-toast__close","type":"Part","description":"Dismiss button (aria-label=Dismiss notification); shown when closable is true."},{"class":"role=alert","type":"State","description":"Applied when color=danger (assertive live region). All other colors use role=status (polite)."}]'}

## Live demo

Click a button to fire a real toast. The queue is shared: rapid-clicking stacks multiple
notifications; each auto-dismisses after 4 seconds unless sticky.

::example
:toast-demo

#vue

```vue
<script setup lang="ts">
import { useToast } from '@oriui/vue';

const { success, error, warn, info, toast } = useToast();

const checkIcon = 'M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z';
</script>

<template>
    <div style="display: flex; flex-wrap: wrap; gap: 0.5rem">
        <OriButton
            variant="outline"
            color="success"
            text="Success"
            @click="success({ title: 'Saved', text: 'Your changes were saved.', icon: checkIcon })"
        />
        <OriButton
            variant="outline"
            color="danger"
            text="Error"
            @click="error({ title: 'Upload failed', text: 'The file could not be uploaded.' })"
        />
        <OriButton variant="outline" color="warn" text="Warning" @click="warn('Your session expires in 5 minutes.')" />
        <OriButton variant="outline" color="info" text="Info" @click="info('A new version is available.')" />
        <OriButton variant="outline" text="Plain" @click="toast('Just a plain notification.')" />
        <OriButton
            variant="outline"
            text="Sticky"
            @click="toast({ text: 'I stay until you dismiss me.', duration: 0, closable: true })"
        />
    </div>
</template>
```

::

## Severity / colors

Four severity shortcuts preset a color; the plain `toast()` call has no color class (neutral surface accent).

::example
:ori-toast{text="Your changes have been saved." color="success"}
:ori-toast{text="Upload failed. Please try again." color="danger"}
:ori-toast{text="Your session expires in 5 minutes." color="warn"}
:ori-toast{text="A new version is available." color="info"}
:ori-toast{text="Just a plain notification."}

#vue

```vue
<script setup lang="ts">
import { useToast } from '@oriui/vue';

const { success, error, warn, info, toast } = useToast();
</script>

<template>
    <!-- each call returns the toast id -->
    <OriButton text="Success" @click="success('Your changes have been saved.')" />
    <OriButton text="Error" @click="error('Upload failed. Please try again.')" />
    <OriButton text="Warning" @click="warn('Your session expires in 5 minutes.')" />
    <OriButton text="Info" @click="info('A new version is available.')" />
    <OriButton text="Plain" @click="toast('Just a plain notification.')" />
</template>
```

#html

```html
<!-- Static appearance — no auto-dismiss or queue without JS. -->
<div class="ori-toast ori-color_success" role="status">
    <div class="ori-toast__body">
        <div class="ori-toast__text">Your changes have been saved.</div>
    </div>
</div>
<div class="ori-toast ori-color_danger" role="alert">
    <div class="ori-toast__body">
        <div class="ori-toast__text">Upload failed. Please try again.</div>
    </div>
</div>
<!-- plain: no ori-color_* class -->
<div class="ori-toast" role="status">
    <div class="ori-toast__body">
        <div class="ori-toast__text">Just a plain notification.</div>
    </div>
</div>
```

::

## Titles and icons

Pass `title` for a bold heading and `icon` (SVG path) for a coloured leading icon.

::example
:ori-toast{title="Saved" text="Your changes were saved successfully." color="success" icon="M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"}
:ori-toast{title="Upload failed" text="The file could not be uploaded. Check your connection and try again." color="danger"}
:ori-toast{title="Heads up" text="A new version is available." color="info"}

#vue

```vue
<script setup lang="ts">
import { useToast } from '@oriui/vue';

const { success, error, info } = useToast();

const checkIcon = 'M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z';
</script>

<template>
    <OriButton
        text="Fire"
        @click="success({ title: 'Saved', text: 'Your changes were saved successfully.', icon: checkIcon })"
    />
    <OriButton text="Error" @click="error({ title: 'Upload failed', text: 'The file could not be uploaded.' })" />
    <OriButton text="Info" @click="info({ title: 'Heads up', text: 'A new version is available.' })" />
</template>
```

#html

```html
<div class="ori-toast ori-color_success" role="status">
    <i class="ori-icon ori-toast__icon" aria-hidden="true">
        <svg viewBox="0 0 24 24"><path d="M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" /></svg>
    </i>
    <div class="ori-toast__body">
        <div class="ori-toast__title">Saved</div>
        <div class="ori-toast__text">Your changes were saved successfully.</div>
    </div>
</div>
```

::

## Closable

`closable: true` (the default when called via `useToast()`) renders a dismiss button. Pass `closable: false`
to suppress it — useful for short-lived toasts that auto-dismiss quickly.

::example
:ori-toast{text="Dismiss me whenever you like." color="info" :closable="true"}
:ori-toast{text="I auto-dismiss — no button needed." color="success" :closable="false"}

#vue

```vue
<script setup lang="ts">
import { useToast } from '@oriui/vue';

const { info } = useToast();
</script>

<template>
    <!-- closable: true is the default from useToast() -->
    <OriButton text="Closable" @click="info({ text: 'Dismiss me.', closable: true })" />
    <!-- suppress the button for quick notifications -->
    <OriButton text="No button" @click="info({ text: 'Gone in 4 s.', closable: false })" />
</template>
```

#html

```html
<!-- with dismiss button -->
<div class="ori-toast ori-color_info" role="status">
    <div class="ori-toast__body">
        <div class="ori-toast__text">Dismiss me whenever you like.</div>
    </div>
    <button type="button" class="ori-toast__close" aria-label="Dismiss notification">×</button>
</div>
```

::

## Duration and sticky

The default auto-dismiss delay is **4000 ms**. Pass `duration: 0` to make a toast sticky — it stays
until the user clicks the dismiss button or you call `dismiss(id)` / `clear()` manually.

::example
:ori-toast{text="I auto-dismiss after 4 s (default duration)." color="info" :closable="true"}
:ori-toast{text="I stay until dismissed (duration: 0)." color="warn" :closable="true"}

#vue

```vue
<script setup lang="ts">
import { useToast } from '@oriui/vue';

const { toast, warn } = useToast();
</script>

<template>
    <!-- default: auto-dismiss after 4000 ms -->
    <OriButton text="Default" @click="toast('Gone in 4 s.')" />

    <!-- custom duration -->
    <OriButton text="8 s" @click="toast({ text: 'Gone in 8 s.', duration: 8000 })" />

    <!-- sticky: pass duration: 0 -->
    <OriButton text="Sticky" @click="warn({ text: 'I stay until dismissed.', duration: 0, closable: true })" />
</template>
```

::

## Positions

Place `<OriToaster>` once (typically in the app root layout) and set its `position` prop. The
six positions are anchored with CSS — no re-ordering of the queue required. Bottom stacks grow
upward (`flex-direction: column-reverse`).

```vue
<!-- top-right is the default -->
<OriToaster position="top-right" />

<!-- other positions -->
<OriToaster position="top-left" />
<OriToaster position="top-center" />
<OriToaster position="bottom-left" />
<OriToaster position="bottom-right" />
<OriToaster position="bottom-center" />
```

## Programmatic dismiss

`toast()` and the severity shortcuts all return the toast id. Pass it to `dismiss(id)` to remove
a specific toast early, or call `clear()` to flush the entire queue.

```vue
<script setup lang="ts">
import { useToast } from '@oriui/vue';

const { toast, dismiss, clear } = useToast();

async function saveAndConfirm() {
    const id = toast({ text: 'Saving…', duration: 0 });
    await save();
    dismiss(id);
    toast({ text: 'Saved!', color: 'success' });
}
</script>
```

## Accessibility

Toast follows the ARIA live-region pattern — content is announced without moving keyboard focus.

- **`role="alert"` (assertive)** — used when `color="danger"`. The announcement interrupts the
  screen reader immediately. Reserve this for genuine errors.
- **`role="status"` (polite)** — used for every other color, including the plain/neutral toast.
  The announcement waits for the reader to finish its current utterance.
- The dismiss button carries `aria-label="Dismiss notification"` so its purpose is clear with no
  visible text.
- Toasts are **non-modal**: they never trap focus and do not require keyboard interaction to
  proceed. They appear and disappear without a focus change.
- Content must be present when the element is inserted — some screen readers announce only the
  content that is in the live region at the moment it is added to the DOM. `useToast()` pushes
  a fully-constructed item, so the rendered `<OriToast>` already contains its text on mount.
- Set `duration: 0` and `closable: true` for toasts that contain interactive content or links,
  so keyboard users can reach them before auto-dismiss removes the element.
- The `<OriToaster>` uses a `<TransitionGroup>` with `prefers-reduced-motion` support — the
  slide animation is disabled for users who opt out; only the fade remains.

| Key     | Action                                        |
| ------- | --------------------------------------------- |
| `Tab`   | Moves focus to the dismiss button (if shown). |
| `Enter` | Activates the focused dismiss button.         |
| `Space` | Activates the focused dismiss button.         |

## Framework API

### `useToast()`

The composable is a module-level singleton — every call returns the same reactive queue. Import
it anywhere; no Vue injection or plugin registration required.

```ts
import { useToast } from '@oriui/vue';

const { toasts, toast, success, error, warn, info, dismiss, clear } = useToast();
```

| Return value | Type / signature                              | Description                                                                    |
| ------------ | --------------------------------------------- | ------------------------------------------------------------------------------ |
| `toasts`     | `ToastItem[]` (reactive)                      | The live queue; rendered by `<OriToaster>`. Read-only — mutate via push/clear. |
| `toast`      | `(options: ToastOptions \| string) => number` | Push a plain notification; returns the toast id.                               |
| `success`    | `(options: ToastOptions \| string) => number` | Push with `color="success"` preset.                                            |
| `error`      | `(options: ToastOptions \| string) => number` | Push with `color="danger"` preset.                                             |
| `warn`       | `(options: ToastOptions \| string) => number` | Push with `color="warn"` preset.                                               |
| `info`       | `(options: ToastOptions \| string) => number` | Push with `color="info"` preset.                                               |
| `dismiss`    | `(id: number) => void`                        | Remove a specific toast by its id and clear its timer.                         |
| `clear`      | `() => void`                                  | Remove all toasts and clear all pending timers.                                |

Passing a plain `string` is shorthand for `{ text: string }`.

### `ToastOptions`

| Option     | Type         | Default | Description                                                    |
| ---------- | ------------ | ------- | -------------------------------------------------------------- |
| `closable` | `boolean`    | `true`  | Renders a dismiss button on the toast.                         |
| `color`    | `ThemeColor` | —       | Semantic color role; preset by severity shortcuts.             |
| `duration` | `number`     | `4000`  | Auto-dismiss delay in ms. `0` keeps the toast until dismissed. |
| `icon`     | `string`     | —       | SVG path for a leading icon.                                   |
| `text`     | `string`     | —       | Body message.                                                  |
| `title`    | `string`     | —       | Bold heading above the body text.                              |

`ThemeColor`: `'primary' | 'secondary' | 'success' | 'warn' | 'danger' | 'info' | 'surface' | 'background'`

### `<OriToaster>` props

Place this component **once** near the app root (e.g. in the main layout). It Teleports to `<body>`
and is gated behind an `onMounted` check so SSR markup stays stable.

| Prop       | Type                                                                                              | Default       | Description                  |
| ---------- | ------------------------------------------------------------------------------------------------- | ------------- | ---------------------------- |
| `position` | `'top-left' \| 'top-right' \| 'top-center' \| 'bottom-left' \| 'bottom-right' \| 'bottom-center'` | `'top-right'` | Screen corner for the stack. |

`OriToaster` declares no custom events. It drives itself from the shared queue returned by
`useToast()` and calls `dismiss(id)` internally when a toast emits `close`.

### `<OriToast>` props

The single-toast card component. Used internally by `<OriToaster>` but also usable standalone
to display a static notification embedded in a page.

| Prop       | Type         | Default     | Description                                                      |
| ---------- | ------------ | ----------- | ---------------------------------------------------------------- |
| `closable` | `boolean`    | `false`     | Renders a dismiss button (`aria-label="Dismiss notification"`).  |
| `color`    | `ThemeColor` | `'surface'` | Semantic color role — drives the accent border and icon color.   |
| `icon`     | `string`     | —           | SVG path for a leading icon; rendered with `aria-hidden="true"`. |
| `text`     | `string`     | —           | Body message. Use the `default` slot for richer markup.          |
| `title`    | `string`     | —           | Bold heading above the body text.                                |

### Events

| Event   | Payload | Description                                                                                 |
| ------- | ------- | ------------------------------------------------------------------------------------------- |
| `close` | —       | Emitted when the dismiss button is clicked. Use it to call `dismiss(id)` or hide the toast. |

`OriToast` does not set `inheritAttrs: false`, so extra attributes (`class`, `style`, `data-*`)
fall through to the root `<div role="status/alert">`.

### Slots

| Slot      | Description                                                                |
| --------- | -------------------------------------------------------------------------- |
| `default` | Body content. Replaces the `text` prop; renders inside `.ori-toast__text`. |
