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
import { useToast } from '@oriui/headless/vue';
```

`@oriui/vue` re-exports the same `useToast`, so `import { useToast } from '@oriui/vue'` is equivalent (and
shares the one queue).

## Options

`toast(options)` (and the severity shortcuts) take either a **string** (its text) or a `ToastOptions`
object:

| Option     | Type         | Default | Description                                                                        |
| ---------- | ------------ | ------- | ---------------------------------------------------------------------------------- |
| `text`     | `string`     | —       | Body message. (`toast('hi')` is shorthand for `toast({ text: 'hi' })`.)            |
| `title`    | `string`     | —       | Optional bold heading above the text.                                              |
| `color`    | `ToastColor` | —       | Semantic role — drives the accent and the live-region assertiveness on `OriToast`. |
| `duration` | `number`     | `4000`  | Auto-dismiss delay in ms; `0` keeps the toast until it is dismissed.               |
| `closable` | `boolean`    | `true`  | Show a dismiss button on the toast.                                                |
| `icon`     | `string`     | —       | SVG path for a leading icon.                                                       |

`ToastColor` is `'primary' | 'secondary' | 'surface' | 'background' | 'success' | 'warn' | 'danger' | 'info'`.

## Returns

| Property                              | Type                                                   | Description                                                                                                                 |
| ------------------------------------- | ------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------- |
| `toasts`                              | `ToastItem[]` (Vue) · `Readable<ToastItem[]>` (Svelte) | The live queue the renderer iterates. `ToastItem` is `ToastOptions` + a numeric `id`.                                       |
| `toast(options)`                      | `(options: ToastOptions \| string) => number`          | Push a toast; returns its numeric `id` (pass to `dismiss`).                                                                 |
| `success` / `error` / `warn` / `info` | `(options: ToastOptions \| string) => number`          | Severity shortcuts — set `color` to `success` / `danger` / `warn` / `info` (an explicit `color` in the options still wins). |
| `dismiss(id)`                         | `(id: number) => void`                                 | Remove a toast (and cancel its timer); a no-op for an unknown id.                                                           |
| `clear()`                             | `() => void`                                           | Empty the queue and cancel every timer.                                                                                     |

## Usage

Call `toast()` from anywhere, and render the queue once. The styled
[`OriToaster`](/components/toast) does the rendering for you; to build your own, iterate `toasts`:

```vue
<!-- MyToaster.vue — render the queue (what OriToaster wraps) -->
<script setup lang="ts">
import { useToast } from '@oriui/headless/vue';

const { toasts, dismiss } = useToast();
</script>

<template>
    <div class="my-toaster">
        <div v-for="t in toasts" :key="t.id" role="status">
            {{ t.text }}
            <button v-if="t.closable" @click="dismiss(t.id)">×</button>
        </div>
    </div>
</template>
```

```ts
// anywhere — a component, a store, an interceptor
import { useToast } from '@oriui/headless/vue';

const { toast, success, error } = useToast();
success('Saved');
error({ title: 'Upload failed', text: 'Try again', duration: 0 }); // 0 = stay until dismissed
```

The **Svelte** binding is the same imperative API; `toasts` is a `readable` store you subscribe with `$`:

```svelte
<!-- MyToaster.svelte -->
<script>
    import { useToast } from '@oriui/headless/svelte';

    const { toasts, dismiss } = useToast();
</script>

{#each $toasts as t (t.id)}
    <div role="status">
        {t.text}
        {#if t.closable}<button on:click={() => dismiss(t.id)}>×</button>{/if}
    </div>
{/each}
```

## Accessibility

- The queue itself carries no roles — the **styled** [`OriToast`](/components/toast) is the live region:
  `role="alert"` for `color="danger"` (assertive), `role="status"` otherwise (polite). If you render your
  own, put the same roles on each toast so a screen reader announces it.
- Auto-dismiss is timer-based; keep `duration` generous (or `0` for important messages) so a screen-reader
  user has time to read it, and always offer `closable` for manual dismissal.

## See also

- [@oriui/headless](/headless/core) — the framework-agnostic layer (the queue engine ships from the
  `./vue` / `./svelte` adapters, not the core barrel).
- [Toast](/components/toast) — the styled `OriToast` + `OriToaster` (positioning, transitions, roles).
