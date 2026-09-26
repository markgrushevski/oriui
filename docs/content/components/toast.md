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
:class-table{:rows='[{"class":"ori-toaster","type":"Block","description":"Fixed portal container (pointer-events: none so it never blocks the page). Rendered by OriToaster via Teleport to body."},{"class":"ori-toaster_top-right","type":"Position","description":"Anchors the stack to the top-right corner (default)."},{"class":"ori-toaster_top-left","type":"Position","description":"Anchors the stack to the top-left corner."},{"class":"ori-toaster_top-center","type":"Position","description":"Anchors the stack to the top-center."},{"class":"align","type":"Prop (OriToaster)","description":"start (default) or center — the alignment of every toast in the stack. Pairs with a top-center / bottom-center position for one-line status messages."},{"class":"ori-toaster_bottom-right","type":"Position","description":"Anchors the stack to the bottom-right corner."},{"class":"ori-toaster_bottom-left","type":"Position","description":"Anchors the stack to the bottom-left corner."},{"class":"ori-toaster_bottom-center","type":"Position","description":"Anchors the stack to the bottom-center."},{"class":"ori-toast","type":"Block","description":"Single notification card: surface background, role-coloured left-border accent, elevation shadow."},{"class":"ori-toast_align-center","type":"Modifier","description":"Centres the body on the CARD: the dismiss button leaves the flex flow and the card reserves equal inline room on both sides, so the text is not pushed off-centre by the button. A leading icon deliberately stays in flow."},{"class":"ori-color_*","type":"Color","description":"Repoints --ori-color to drive the accent. Applied by useToast() severity shortcuts (success / danger / warning / info). Plain toast has no color class."},{"class":"ori-toast__icon","type":"Part","description":"Leading icon element; coloured by --ori-color."},{"class":"ori-toast__body","type":"Part","description":"Flex column holding the title and text."},{"class":"ori-toast__title","type":"Part","description":"Bold heading above the body text."},{"class":"ori-toast__text","type":"Part","description":"Body message; slightly muted opacity."},{"class":"ori-toast__action","type":"Part","description":"The action button (a small soft OriButton), between the body and the dismiss button."},{"class":"ori-toast__close","type":"Part","description":"Dismiss button (aria-label=Dismiss notification); shown when closable is true."},{"class":"role=alert","type":"State","description":"Applied when color=danger (assertive live region). All other colors use role=status (polite)."}]'}

**À la carte:** the classes above ship in `@oriui/css/components/toast.css`. `.ori-toast` and `.ori-toaster`
both live in `toast.css` — there is no `toaster.css`. Import a foundation (`@oriui/css/base.css` or
`@oriui/css/tokens.css`) first — the token utilities (`ori-color_*`, `ori-size-radius_*`, …) live there, not
in the component file. The full bundle `@oriui/css` is the default and already carries both; see [à-la-carte
imports](/guides/css).

## Live demo

Click a button to fire a real toast. The queue is shared: rapid-clicking stacks multiple
notifications; each auto-dismisses after 4 seconds unless sticky.

::example
:toast-demo

#vue

```vue
<script setup lang="ts">
import { useToast } from '@oriui/vue'

const { success, error, warning, info, toast } = useToast()

const checkIcon = 'M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z'
</script>

<template>
    <div style="display: flex; flex-wrap: wrap; gap: 0.5rem">
        <OriButton
            variant="outline"
            color="success"
            label="Success"
            @click="success({ title: 'Saved', text: 'Your changes were saved.', icon: checkIcon })"
        />
        <OriButton
            variant="outline"
            color="danger"
            label="Error"
            @click="error({ title: 'Upload failed', text: 'The file could not be uploaded.' })"
        />
        <OriButton
            variant="outline"
            color="warning"
            label="Warning"
            @click="warning('Your session expires in 5 minutes.')"
        />
        <OriButton variant="outline" color="info" label="Info" @click="info('A new version is available.')" />
        <OriButton variant="outline" label="Plain" @click="toast('Just a plain notification.')" />
        <OriButton
            variant="outline"
            label="Sticky"
            @click="toast({ text: 'I stay until you dismiss me.', duration: 0, closable: true })"
        />
        <OriButton
            variant="outline"
            label="With action"
            @click="toast({ text: 'Message archived.', action: { label: 'Undo', onClick: () => info('Restored.') } })"
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
:ori-toast{text="Your session expires in 5 minutes." color="warning"}
:ori-toast{text="A new version is available." color="info"}
:ori-toast{text="Just a plain notification."}

#vue

```vue
<script setup lang="ts">
import { useToast } from '@oriui/vue'

const { success, error, warning, info, toast } = useToast()
</script>

<template>
    <!-- each call returns the toast id -->
    <OriButton label="Success" @click="success('Your changes have been saved.')" />
    <OriButton label="Error" @click="error('Upload failed. Please try again.')" />
    <OriButton label="Warning" @click="warning('Your session expires in 5 minutes.')" />
    <OriButton label="Info" @click="info('A new version is available.')" />
    <OriButton label="Plain" @click="toast('Just a plain notification.')" />
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
import { useToast } from '@oriui/vue'

const { success, error, info } = useToast()

const checkIcon = 'M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z'
</script>

<template>
    <OriButton
        label="Fire"
        @click="success({ title: 'Saved', text: 'Your changes were saved successfully.', icon: checkIcon })"
    />
    <OriButton label="Error" @click="error({ title: 'Upload failed', text: 'The file could not be uploaded.' })" />
    <OriButton label="Info" @click="info({ title: 'Heads up', text: 'A new version is available.' })" />
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

`closable: true` renders a dismiss button. It is **off by default** — a toast that disappears on its own
in four seconds does not need one — with a single exception: a toast that never auto-dismisses
(`duration: 0`) opts itself in, because otherwise nothing could get rid of it. Pass `closable: false`
to suppress it — useful for short-lived toasts that auto-dismiss quickly.

::example
:ori-toast{text="Dismiss me whenever you like." color="info" :closable="true"}
:ori-toast{text="I auto-dismiss — no button needed." color="success" :closable="false"}

#vue

```vue
<script setup lang="ts">
import { useToast } from '@oriui/vue'

const { info } = useToast()
</script>

<template>
    <!-- opt in per toast; a duration: 0 toast gets the button automatically -->
    <OriButton label="Closable" @click="info({ text: 'Dismiss me.', closable: true })" />
    <!-- suppress the button for quick notifications -->
    <OriButton label="No button" @click="info({ text: 'Gone in 4 s.', closable: false })" />
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

The countdown stops while the pointer or keyboard focus is on the toasts, or while the page is hidden,
and then continues with the time that was left. A toast is never removed while someone is reading it
or reaching for its button.

::example
:ori-toast{text="I auto-dismiss after 4 s (default duration)." color="info" :closable="true"}
:ori-toast{text="I stay until dismissed (duration: 0)." color="warning" :closable="true"}

#vue

```vue
<script setup lang="ts">
import { useToast } from '@oriui/vue'

const { toast, warning } = useToast()
</script>

<template>
    <!-- default: auto-dismiss after 4000 ms -->
    <OriButton label="Default" @click="toast('Gone in 4 s.')" />

    <!-- custom duration -->
    <OriButton label="8 s" @click="toast({ text: 'Gone in 8 s.', duration: 8000 })" />

    <!-- sticky: pass duration: 0 -->
    <OriButton label="Sticky" @click="warning({ text: 'I stay until dismissed.', duration: 0, closable: true })" />
</template>
```

::

## Actions

Give a toast one `action`, such as Undo. Pressing it runs `onClick` and dismisses the toast.

```vue
<script setup lang="ts">
import { useToast } from '@oriui/vue'

const { toast } = useToast()

function remove(file: File) {
    deleteFile(file)
    toast({ text: `${file.name} deleted`, action: { label: 'Undo', onClick: () => restoreFile(file) } })
}
</script>
```

Keyboard users reach the action with `F8`, which moves focus to the toasts, then `Tab`. Keep the same
action available somewhere else too: a toast is a shortcut, not the only way to undo.

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
import { useToast } from '@oriui/vue'

const { toast, dismiss, clear } = useToast()

async function saveAndConfirm() {
    const id = toast({ text: 'Saving…', duration: 0 })
    await save()
    dismiss(id)
    toast({ text: 'Saved!', color: 'success' })
}
</script>
```

## Accessibility

Toasts are announced without moving focus.

- **The toaster is a live region from the start.** It is rendered empty on mount and toasts are
  inserted into it, because screen readers only report changes inside a region they already track.
- **`role="alert"` (assertive)** is used when `color="danger"` and interrupts the screen reader. Every
  other color uses **`role="status"`** (polite), which waits for the current announcement to finish.
- **The toaster is a labelled region**, "Notifications (F8)" by default (`label` and `hotkey` props).
  The hotkey moves focus to it, so the action and dismiss buttons are reachable from anywhere.
- **Nothing disappears while in use (WCAG 2.2.1).** Countdowns stop while the pointer or focus is on the
  toasts, or the page is hidden. A toast that is the only place an error is reported should still be
  sticky (`duration: 0`).
- Toasts are non-modal: they never trap focus. When a toast's own button removes it, a keyboard user
  stays on the toaster while other toasts remain, and otherwise returns to where the hotkey was pressed.
- The dismiss button carries `aria-label="Dismiss notification"`.
- With `prefers-reduced-motion`, the slide is dropped and only the fade remains.

| Key               | Action                                         |
| ----------------- | ---------------------------------------------- |
| `F8`              | Moves focus to the toasts (the `hotkey` prop). |
| `Tab`             | Moves between the action and dismiss buttons.  |
| `Enter` / `Space` | Activates the focused button.                  |

## Framework API

### `useToast()`

The composable is a module-level singleton — every call returns the same reactive queue. Import
it anywhere; no Vue injection or plugin registration required. Its behaviour is the framework-agnostic
[`useToast`](/headless/use-toast) — the same imperative API ships from `@oriui/headless/vue` and
`@oriui/headless/svelte`; this `@oriui/vue` re-export is unchanged.

```ts
import { useToast } from '@oriui/vue'

const { toasts, toast, success, error, warning, info, dismiss, clear } = useToast()
```

| Return value | Type / signature                              | Description                                                                             |
| ------------ | --------------------------------------------- | --------------------------------------------------------------------------------------- |
| `toasts`     | `ToastItem[]` (reactive)                      | The live queue; rendered by `<OriToaster>`. Read-only — mutate via push/clear.          |
| `toast`      | `(options: ToastOptions \| string) => number` | Push a plain notification; returns the toast id.                                        |
| `success`    | `(options: ToastOptions \| string) => number` | Push with `color="success"` preset.                                                     |
| `error`      | `(options: ToastOptions \| string) => number` | Push with `color="danger"` preset.                                                      |
| `warning`    | `(options: ToastOptions \| string) => number` | Push with `color="warning"` preset.                                                     |
| `info`       | `(options: ToastOptions \| string) => number` | Push with `color="info"` preset.                                                        |
| `dismiss`    | `(id: number) => void`                        | Remove a specific toast by its id and clear its timer.                                  |
| `clear`      | `() => void`                                  | Remove all toasts and clear all pending timers.                                         |
| `pause`      | `() => void`                                  | Stop every countdown. `<OriToaster>` calls it for the pointer, focus and a hidden page. |
| `resume`     | `() => void`                                  | Restart the countdowns with the time each one had left.                                 |

Passing a plain `string` is shorthand for `{ text: string }`.

### `ToastOptions`

| Option     | Type                                     | Default | Description                                                                                                     |
| ---------- | ---------------------------------------- | ------- | --------------------------------------------------------------------------------------------------------------- |
| `action`   | `{ label: string; onClick: () => void }` | —       | One action button. Pressing it runs `onClick` and dismisses the toast.                                          |
| `closable` | `boolean`                                | `false` | Renders a dismiss button. A sticky toast (`duration: 0`) opts itself in, because nothing else could dismiss it. |
| `color`    | `ThemeColor`                             | —       | Semantic color role; preset by severity shortcuts.                                                              |
| `duration` | `number`                                 | `4000`  | Auto-dismiss delay in ms. `0` keeps the toast until dismissed.                                                  |
| `icon`     | `string`                                 | —       | SVG path for a leading icon.                                                                                    |
| `text`     | `string`                                 | —       | Body message.                                                                                                   |
| `title`    | `string`                                 | —       | Bold heading above the body text.                                                                               |

`ThemeColor`: `'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info' | 'surface' | 'background'`

### `<OriToaster>` props

Place this component **once** near the app root (e.g. in the main layout). It Teleports to `<body>`
and is gated behind an `onMounted` check so SSR markup stays stable.

| Prop       | Type                                                                                              | Default           | Description                                                                                                                 |
| ---------- | ------------------------------------------------------------------------------------------------- | ----------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `align`    | `'start' \| 'center'`                                                                             | `'start'`         | Alignment of every toast in the stack — forwarded to each `OriToast`. Pairs with a `top-center` / `bottom-center` position. |
| `hotkey`   | `string`                                                                                          | `'F8'`            | The key (`KeyboardEvent.key`) that moves focus to the toasts. Pick one that types no text; `''` turns it off.               |
| `label`    | `string`                                                                                          | `'Notifications'` | Accessible name of the toast region; the hotkey is appended to it.                                                          |
| `position` | `'top-left' \| 'top-right' \| 'top-center' \| 'bottom-left' \| 'bottom-right' \| 'bottom-center'` | `'top-right'`     | Screen corner for the stack.                                                                                                |

`OriToaster` declares no custom events. It drives itself from the shared queue returned by
`useToast()` and calls `dismiss(id)` internally when a toast emits `close`.

### `<OriToast>` props

The single-toast card component. Used internally by `<OriToaster>` but also usable standalone
to display a static notification embedded in a page.

| Prop          | Type                  | Default     | Description                                                                                                                     |
| ------------- | --------------------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `actionLabel` | `string`              | —           | Renders an action button with this label; it emits `action`.                                                                    |
| `align`       | `'start' \| 'center'` | `'start'`   | `center` centres the body on the CARD: the dismiss button leaves the flex flow and equal inline room is reserved on both sides. |
| `closable`    | `boolean`             | `false`     | Renders a dismiss button (`aria-label="Dismiss notification"`).                                                                 |
| `color`       | `ThemeColor`          | `'surface'` | Semantic color role — drives the accent border and icon color.                                                                  |
| `icon`        | `string`              | —           | SVG path for a leading icon; rendered with `aria-hidden="true"`.                                                                |
| `text`        | `string`              | —           | Body message. Use the `default` slot for richer markup.                                                                         |
| `title`       | `string`              | —           | Bold heading above the body text.                                                                                               |

### Events

| Event    | Payload | Description                                                                                 |
| -------- | ------- | ------------------------------------------------------------------------------------------- |
| `action` | —       | Emitted when the action button is clicked.                                                  |
| `close`  | —       | Emitted when the dismiss button is clicked. Use it to call `dismiss(id)` or hide the toast. |

`OriToast` does not set `inheritAttrs: false`, so extra attributes (`class`, `style`, `data-*`)
fall through to the root `<div role="status/alert">`.

### Slots

| Slot      | Description                                                                        |
| --------- | ---------------------------------------------------------------------------------- |
| `default` | Body content. Replaces the `text` prop; renders inside `.ori-toast__text`.         |
| `icon`    | Leading icon. Replaces the `icon` prop render; falls back to it when not provided. |
| `title`   | Title content. Replaces the `title` prop; renders inside `.ori-toast__title`.      |
