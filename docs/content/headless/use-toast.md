---
title: useToast
---

# useToast

A headless **toast queue** — an imperative notification store you call from anywhere (`toast('Saved')`)
and render once near the app root. The behaviour is a framework-agnostic engine (a plain array + a `Set`
of listeners + auto-dismiss timers) projected into the host framework's reactivity: a Vue **reactive
array** and a Svelte **readable store**. It is a client-side **singleton** — every `useToast()` call
shares the one queue, so a push from anywhere reaches the single renderer.

This is the **Vue** binding; the framework-agnostic engine lives in
[`@oriui/headless`](/headless/core) (kept out of the core barrel so it never weighs on the core budget),
and the styled [`OriToaster`](/components/toast) + `OriToast` render the queue. Unlike the roving /
machine composables, a toast queue has no ARIA prop-getters — the live-region roles live on the styled
`OriToast` (`role="status"` / `role="alert"` by color).

## Import

```ts
import { useToast } from '@oriui/headless/vue'
```

`@oriui/vue` re-exports the same `useToast`, so `import { useToast } from '@oriui/vue'` is equivalent (and
shares the one queue).

## Options

`toast(options)` (and the severity shortcuts) take either a **string** (its text) or a `ToastOptions`
object:

| Option     | Type                                     | Default | Description                                                                                                                                                                                |
| ---------- | ---------------------------------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `text`     | `string`                                 | —       | Body message. (`toast('hi')` is shorthand for `toast({ text: 'hi' })`.)                                                                                                                    |
| `title`    | `string`                                 | —       | Optional bold heading above the text.                                                                                                                                                      |
| `color`    | `ToastColor`                             | —       | Semantic role — drives the accent and the live-region assertiveness on `OriToast`.                                                                                                         |
| `duration` | `number`                                 | `4000`  | Auto-dismiss delay in ms; `0` keeps the toast until it is dismissed.                                                                                                                       |
| `closable` | `boolean`                                | —       | Show a dismiss button. Left unset by the queue, so the renderer's own default applies — except for a toast with `duration: 0`, which opts itself in because nothing else could dismiss it. |
| `action`   | `{ label: string; onClick: () => void }` | —       | One action button, such as Undo. Your renderer runs `onClick` and then `dismiss(id)`.                                                                                                      |
| `icon`     | `string`                                 | —       | SVG path for a leading icon.                                                                                                                                                               |

`ToastColor` is `'primary' | 'secondary' | 'surface' | 'background' | 'success' | 'warning' | 'danger' | 'info'`.

## Returns

| Property                                 | Type                                                   | Description                                                                                                                    |
| ---------------------------------------- | ------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------ |
| `toasts`                                 | `ToastItem[]` (Vue) · `Readable<ToastItem[]>` (Svelte) | The live queue the renderer iterates. `ToastItem` is `ToastOptions` + a numeric `id`.                                          |
| `toast(options)`                         | `(options: ToastOptions \| string) => number`          | Push a toast; returns its numeric `id` (pass to `dismiss`).                                                                    |
| `success` / `error` / `warning` / `info` | `(options: ToastOptions \| string) => number`          | Severity shortcuts — set `color` to `success` / `danger` / `warning` / `info` (an explicit `color` in the options still wins). |
| `dismiss(id)`                            | `(id: number) => void`                                 | Remove a toast (and cancel its timer); a no-op for an unknown id.                                                              |
| `clear()`                                | `() => void`                                           | Empty the queue and cancel every timer.                                                                                        |
| `pause()` / `resume()`                   | `() => void`                                           | Stop every countdown, then restart each with the time it had left. Call them from your renderer (see below).                   |

## Usage

Call `toast()` from anywhere, and render the queue once. The styled
[`OriToaster`](/components/toast) does the rendering for you; to build your own, iterate `toasts`:

::example

#vue

```vue
<!-- MyToaster.vue — render the queue (what OriToaster wraps) -->
<script setup lang="ts">
import { useToast } from '@oriui/headless/vue'

const { toasts, dismiss, pause, resume } = useToast()
</script>

<template>
    <!-- A live region from mount. OriToaster also pauses for focus and a hidden page. -->
    <div class="my-toaster" aria-live="polite" @pointerenter="pause" @pointerleave="resume">
        <div v-for="t in toasts" :key="t.id" :role="t.color === 'danger' ? 'alert' : 'status'">
            {{ t.text }}
            <button v-if="t.action" @click="(dismiss(t.id), t.action.onClick())">{{ t.action.label }}</button>
            <button v-if="t.closable" @click="dismiss(t.id)">×</button>
        </div>
    </div>
</template>
```

```ts
// anywhere — a component, a store, an interceptor
import { useToast } from '@oriui/headless/vue'

const { toast, success, error } = useToast()
success('Saved')
error({ title: 'Upload failed', text: 'Try again', duration: 0 }) // 0 = stay until dismissed
```

#svelte

The **Svelte** binding is the same imperative API; `toasts` is a `readable` store you subscribe with `$`:

```svelte
<!-- MyToaster.svelte -->
<script>
    import { useToast } from '@oriui/headless/svelte';

    const { toasts, dismiss, pause, resume } = useToast();
</script>

<div aria-live="polite" on:pointerenter={pause} on:pointerleave={resume}>
    {#each $toasts as t (t.id)}
        <div role={t.color === 'danger' ? 'alert' : 'status'}>
            {t.text}
            {#if t.action}
                <button on:click={() => (dismiss(t.id), t.action.onClick())}>{t.action.label}</button>
            {/if}
            {#if t.closable}<button on:click={() => dismiss(t.id)}>×</button>{/if}
        </div>
    {/each}
</div>
```

#react

The **React** binding is the same imperative API; `toasts` is a **plain array** re-projected on every queue
change via `useSyncExternalStore` (no `.value` / `$`). Because it is a hook, call `useToast()` inside a
component (rules of hooks) to get the queue and the actions, then push from an event handler. `@oriui/css`
styles the markup with the same `.ori-toast` classes in React / Next today:

```tsx
import { useToast } from '@oriui/headless/react'

// Render the queue once near the app root.
function MyToaster() {
    const { toasts, dismiss, pause, resume } = useToast()

    return (
        <div className="my-toaster" aria-live="polite" onPointerEnter={pause} onPointerLeave={resume}>
            {toasts.map((t) => (
                <div key={t.id} role={t.color === 'danger' ? 'alert' : 'status'}>
                    {t.text}
                    {t.action && <button onClick={() => (dismiss(t.id), t.action!.onClick())}>{t.action.label}</button>}
                    {t.closable && <button onClick={() => dismiss(t.id)}>×</button>}
                </div>
            ))}
        </div>
    )
}

// Push from anywhere you can call the hook — the single module-level queue reaches the one <MyToaster />.
function SaveButton() {
    const { success, error } = useToast()
    return (
        <button onClick={() => success('Saved')} onDoubleClick={() => error({ title: 'Oops', duration: 0 })}>
            Save
        </button>
    )
}
```

::

## Accessibility

The queue carries no markup, so a renderer of your own has to do what [`OriToaster`](/components/toast)
does:

- Render the container empty on mount with `aria-live="polite"` and insert toasts into it; give each
  toast `role="alert"` for `color="danger"` and `role="status"` otherwise.
- Call `pause()` while the pointer or focus is inside the container or the page is hidden, and
  `resume()` when none of these holds any more (WCAG 2.2.1). Without it a toast can vanish while
  someone reads it or tabs to its action.
- Make the container a labelled `role="region"` with `tabindex="-1"` and a hotkey that focuses it, so
  keyboard users can reach the buttons.

## See also

- [@oriui/headless](/headless/core) — the framework-agnostic layer (the queue engine ships from the
  `./vue` / `./svelte` adapters, not the core barrel).
- [Toast](/components/toast) — the styled `OriToast` + `OriToaster` (positioning, transitions, roles).
