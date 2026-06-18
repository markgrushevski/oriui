---
title: useDialog
---

# useDialog

A headless **modal dialog** primitive built on the native `<dialog>` element — focus trap, scroll lock,
`Escape` to close, focus return, and `aria-modal` semantics all come from the platform via
`showModal()`. It owns the open state and the ARIA wiring as ready-to-bind prop bags; **you own the
markup and styles** (you render the `<dialog>` and drive `showModal()` / `close()` from `open`).

This is the **Vue** binding; the engine-agnostic contract lives in [`@oriui/core`](/headless/core), and the
styled [`OriDialog`](/components/dialog) is built on it. Like [`useDisclosure`](/headless/use-disclosure),
a dialog now has a **zero-dependency native default** — the browser's `<dialog>` supplies the focus trap,
`::backdrop`, top-layer and focus-return that used to require a heavyweight engine. No adapter is required.

## Import

```ts
import { useDialog } from '@oriui/vue';
```

No adapter needs to be registered — `useDialog` resolves the native engine by default. Swapping a custom
engine is optional; see [Adapter](#adapter).

## Options

Pass an options object (or a getter returning one, to stay reactive):

| Option                   | Type                      | Default | Description                               |
| ------------------------ | ------------------------- | ------- | ----------------------------------------- |
| `defaultOpen`            | `boolean`                 | `false` | Initial open state (uncontrolled).        |
| `modal`                  | `boolean`                 | `true`  | `showModal()` (trap + inert) vs `show()`. |
| `closeOnEscape`          | `boolean`                 | `true`  | `Escape` closes the dialog.               |
| `closeOnInteractOutside` | `boolean`                 | `true`  | Click on the `::backdrop` closes it.      |
| `onOpenChange`           | `(open: boolean) => void` | —       | Fires whenever the open state changes.    |
| `id`                     | `string`                  | auto    | Base id for the part ARIA wiring.         |

## Returns

A `DialogControl` — the open state plus the prop bags you bind to each part. Every `*Props` value is a
`ComputedRef`; bind it with `v-bind`.

| Property            | Type                      | Description                                                                                                                             |
| ------------------- | ------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `open`              | `ComputedRef<boolean>`    | Current open state.                                                                                                                     |
| `setOpen(open)`     | `(open: boolean) => void` | Open / close imperatively.                                                                                                              |
| `toggle()`          | `() => void`              | Flip the open state.                                                                                                                    |
| `triggerProps`      | `ComputedRef<object>`     | The control that opens the dialog.                                                                                                      |
| `dialogProps`       | `ComputedRef<object>`     | The `<dialog>` element: `role`, `aria-modal`, labelling, and the `close` / `cancel` / backdrop-click handlers that keep `open` in sync. |
| `titleProps`        | `ComputedRef<object>`     | Wires the accessible name (`aria-labelledby`).                                                                                          |
| `descriptionProps`  | `ComputedRef<object>`     | Wires the accessible description (`aria-describedby`).                                                                                  |
| `closeTriggerProps` | `ComputedRef<object>`     | The close control.                                                                                                                      |

## Usage

Render a real `<dialog>`, bind `dialogProps`, and drive `showModal()` / `close()` from `open`:

```vue
<script setup lang="ts">
import { useTemplateRef, watchPostEffect } from 'vue';
import { useDialog } from '@oriui/vue';

const dlg = useDialog(() => ({ modal: true }));

const dialogEl = useTemplateRef<HTMLDialogElement>('dialog');
watchPostEffect(() => {
    const el = dialogEl.value;
    if (!el) return;
    if (dlg.open.value && !el.open) el.showModal();
    else if (!dlg.open.value && el.open) el.close();
});
</script>

<template>
    <button v-bind="dlg.triggerProps.value">Open</button>

    <dialog ref="dialog" v-bind="dlg.dialogProps.value">
        <h2 v-bind="dlg.titleProps.value">Title</h2>
        <p v-bind="dlg.descriptionProps.value">Body copy.</p>
        <button v-bind="dlg.closeTriggerProps.value">Close</button>
    </dialog>
</template>
```

No `<Teleport>` and no mounted-ref gating are needed: a modal `<dialog>` renders in the browser's top
layer regardless of where it sits in the DOM, and a closed `<dialog>` is hidden, so the SSR markup stays
stable. The styled [`OriDialog`](/components/dialog) wraps exactly this pattern.

## Adapter

`useDialog` defaults to the native `<dialog>` engine — the focus trap, scroll lock, `Esc`, `::backdrop`
and focus-return are the platform's job now, so no dependency is required. The `OriHeadless` contract is
still there as a **hedge**: register a custom engine per primitive only if a project needs one (for
example a Zag-backed adapter for a genuinely hard widget), without touching your markup.

```ts
// main.ts
import { createApp } from 'vue';
import { OriHeadless } from '@oriui/vue';
import { myDialog } from './headless/my-dialog'; // optional custom adapter

const app = createApp(App);
app.use(OriHeadless, { dialog: myDialog });
app.mount('#app');
```

`useDialog` resolves that adapter (or one from `provideHeadless` inside a subtree), falling back to the
native engine when none is wired. Any adapter produces the same `DialogControl` shape, so your markup
never changes.

## Accessibility

The native `<dialog>` carries the WAI-ARIA dialog contract; the prop bags complete the wiring.

- `dialogProps` set `role="dialog"`, `aria-modal` (per the `modal` option), `aria-labelledby` pointing at
  the element you bind `titleProps` to, and the `close` / `cancel` handlers that keep `open` in sync when
  the browser closes the dialog (Esc, backdrop click).
- `triggerProps` carry the `aria-*` attributes the open control needs.
- `closeTriggerProps` carry the close control's wiring; give it an accessible name (e.g.
  `aria-label="Close"`).
- The live behaviour — focus trap, scroll lock, returning focus to the trigger on close — comes from
  `showModal()`. A non-modal `show()` (`modal: false`) does not trap focus or block the page.

| Key         | Action                                                                     |
| ----------- | -------------------------------------------------------------------------- |
| `Escape`    | Closes the dialog and returns focus to the trigger (when `closeOnEscape`). |
| `Tab`       | Cycles focus among interactive elements inside the dialog (focus trap).    |
| `Shift+Tab` | Cycles focus backwards inside the dialog.                                  |

## See also

- [@oriui/core](/headless/core) — the framework-agnostic contract and the native engine.
- [useDisclosure](/headless/use-disclosure) — the sibling show / hide primitive (also native by default).
- [OriDialog](/components/dialog) — the styled component built on this primitive.
- [CSS layer](/guides/css) — the standalone `.ori-*` classes for the dialog parts.
