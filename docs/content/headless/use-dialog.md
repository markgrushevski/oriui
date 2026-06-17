---
title: useDialog
---

# useDialog

A headless **modal dialog** primitive — focus trap, scroll lock, `Escape` to close, focus return, and
`aria-modal` semantics. It owns the open state, the keyboard contract, and the ARIA wiring as ready-to-bind
prop bags; **you own the markup and styles**.

This is the **Vue** binding; the engine-agnostic contract lives in [`@oriui/core`](/headless/core), and the
styled [`OriDialog`](/components/dialog) is built on it. Unlike [`useDisclosure`](/headless/use-disclosure),
a dialog has **no native default** — focus trap, scroll lock, and focus return are exactly the hard
behaviour oriUI delegates to an adapter (e.g. Zag). With no adapter wired, `useDialog` **fails loud**.

## Import

```ts
import { useDialog } from '@oriui/vue';
```

A dialog adapter must be registered first — see [Adapter](#adapter) (a dialog has no native default).

## Options

Pass an options object (or a getter returning one, to stay reactive):

| Option                   | Type                      | Default | Description                            |
| ------------------------ | ------------------------- | ------- | -------------------------------------- |
| `defaultOpen`            | `boolean`                 | `false` | Initial open state (uncontrolled).     |
| `modal`                  | `boolean`                 | `true`  | Trap focus and block the page behind.  |
| `closeOnEscape`          | `boolean`                 | `true`  | `Escape` closes the dialog.            |
| `closeOnInteractOutside` | `boolean`                 | `true`  | Click / touch outside closes it.       |
| `onOpenChange`           | `(open: boolean) => void` | —       | Fires whenever the open state changes. |
| `id`                     | `string`                  | auto    | Base id for the part ARIA wiring.      |

`useDialog` sets no defaults of its own — it forwards options straight to the adapter, so the values
above are the conventional adapter (Zag) defaults.

## Returns

A `DialogControl` — the open state plus the prop bags you bind to each structural part. Every `*Props`
value is a `ComputedRef`; bind it with `v-bind`.

| Property            | Type                      | Description                                            |
| ------------------- | ------------------------- | ------------------------------------------------------ |
| `open`              | `ComputedRef<boolean>`    | Current open state.                                    |
| `setOpen(open)`     | `(open: boolean) => void` | Open / close imperatively.                             |
| `triggerProps`      | `ComputedRef<object>`     | The control that opens the dialog.                     |
| `backdropProps`     | `ComputedRef<object>`     | The fixed overlay behind the panel.                    |
| `positionerProps`   | `ComputedRef<object>`     | The centring wrapper that holds the panel.             |
| `contentProps`      | `ComputedRef<object>`     | The dialog panel (`role`, `aria-modal`, labelling).    |
| `titleProps`        | `ComputedRef<object>`     | Wires the accessible name (`aria-labelledby`).         |
| `descriptionProps`  | `ComputedRef<object>`     | Wires the accessible description (`aria-describedby`). |
| `closeTriggerProps` | `ComputedRef<object>`     | The close control.                                     |

## Usage

```vue
<script setup lang="ts">
import { useDialog } from '@oriui/vue';

const {
    open,
    triggerProps,
    backdropProps,
    positionerProps,
    contentProps,
    titleProps,
    descriptionProps,
    closeTriggerProps
} = useDialog(() => ({ modal: true }));
</script>

<template>
    <button v-bind="triggerProps">Open</button>

    <Teleport v-if="open" to="body">
        <div v-bind="backdropProps"></div>
        <div v-bind="positionerProps">
            <div v-bind="contentProps">
                <h2 v-bind="titleProps">Title</h2>
                <p v-bind="descriptionProps">Body copy.</p>
                <button v-bind="closeTriggerProps">Close</button>
            </div>
        </div>
    </Teleport>
</template>
```

In an SSR app, gate the `<Teleport>` on a mounted ref the way the styled
[`OriDialog`](/components/dialog) does, so the server-rendered markup stays stable.

## Adapter

`useDialog` has **no native fallback**. A dialog's focus trap, scroll lock, and focus return are exactly
the behaviours that are easy to get subtly wrong, so oriUI delegates them to a battle-tested engine (Zag)
behind the [contract](/headless/core) rather than hand-rolling them. Register an adapter once at app entry:

```ts
// main.ts
import { createApp } from 'vue';
import { OriHeadless } from '@oriui/vue';
import { zagDialog } from './headless/zag-dialog'; // your adapter (Zag-backed)

const app = createApp(App);
app.use(OriHeadless, { dialog: zagDialog });
app.mount('#app');
```

`useDialog` resolves that adapter (or one from `provideHeadless` inside a subtree). With none wired it
**fails loud** rather than shipping a half-correct focus trap:

```text
[oriui] OriDialog needs a dialog headless adapter. Install @zag-js/dialog + @zag-js/vue
and provide it, e.g. app.use(OriHeadless, { dialog: zagDialog }).
```

Swap engines freely — the adapter produces the same `DialogControl` shape, so your markup never changes.

## Accessibility

The prop bags carry the full WAI-ARIA dialog contract; bind them and the wiring is correct by construction.

- `contentProps` set `role="dialog"`, `aria-modal` (per the `modal` option), and `aria-labelledby` /
  `aria-describedby` pointing at the elements you bind `titleProps` / `descriptionProps` to.
- `triggerProps` carry the `aria-*` and `id` attributes the open control needs.
- `closeTriggerProps` carry the close control's wiring; give it an accessible name (e.g.
  `aria-label="Close"`).
- The adapter owns the live behaviour — focus trap, scroll lock, and returning focus to the trigger on
  close — so a static panel is markup only until `useDialog` drives it.

| Key         | Action                                                                     |
| ----------- | -------------------------------------------------------------------------- |
| `Escape`    | Closes the dialog and returns focus to the trigger (when `closeOnEscape`). |
| `Tab`       | Cycles focus among interactive elements inside the dialog (focus trap).    |
| `Shift+Tab` | Cycles focus backwards inside the dialog.                                  |

## See also

- [@oriui/core](/headless/core) — the framework-agnostic contract and the native engine.
- [useDisclosure](/headless/use-disclosure) — the sibling show / hide primitive (with a native default).
- [OriDialog](/components/dialog) — the styled component built on this primitive.
- [CSS layer](/guides/css) — the standalone `.ori-*` classes for the dialog parts.
