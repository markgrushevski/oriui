---
title: useDialog
---

# useDialog

A headless **modal dialog** primitive — focus trap, scroll lock, `Escape` to close, focus return, and
`aria-modal` semantics. This is the hard-behaviour case oriUI deliberately **delegates to an adapter**
(e.g. Zag); there is **no native default**, so it fails loud if no adapter is wired. The styled
[`OriDialog`](/components/dialog) is built on it.

The Vue binding of the headless layer; behaviour is engine-agnostic behind the contract.

## Setup

```ts
import { OriHeadless } from '@oriui/vue';
import { zagDialog } from './headless/zag-dialog'; // your adapter (Zag-backed)

app.use(OriHeadless, { dialog: zagDialog });
```

## Returns (`DialogControl`)

| Property                            | Type                   | Description                              |
| ----------------------------------- | ---------------------- | ---------------------------------------- |
| `open`                              | `ComputedRef<boolean>` | Current open state.                      |
| `setOpen(open)`                     | `(b: boolean) => void` | Open / close imperatively.               |
| `triggerProps`                      | `ComputedRef<object>`  | The control that opens the dialog.       |
| `backdropProps` · `positionerProps` | `ComputedRef<object>`  | The overlay + centring layers.           |
| `contentProps`                      | `ComputedRef<object>`  | The dialog panel (`role`, `aria-modal`). |
| `titleProps` · `descriptionProps`   | `ComputedRef<object>`  | Wire the accessible name / description.  |
| `closeTriggerProps`                 | `ComputedRef<object>`  | The close control.                       |

## Options

| Option                   | Type                      | Default | Description                            |
| ------------------------ | ------------------------- | ------- | -------------------------------------- |
| `defaultOpen`            | `boolean`                 | `false` | Initial open state.                    |
| `modal`                  | `boolean`                 | `true`  | Trap focus + block the page behind.    |
| `closeOnEscape`          | `boolean`                 | `true`  | `Escape` closes.                       |
| `closeOnInteractOutside` | `boolean`                 | `true`  | Click/touch outside closes.            |
| `onOpenChange`           | `(open: boolean) => void` | —       | Fires whenever the open state changes. |

## Usage

```vue
<script setup lang="ts">
import { useDialog } from '@oriui/vue';

const dlg = useDialog(() => ({ modal: true }));
</script>

<template>
    <button v-bind="dlg.triggerProps.value">Open</button>

    <Teleport v-if="dlg.open.value" to="body">
        <div v-bind="dlg.backdropProps.value"></div>
        <div v-bind="dlg.positionerProps.value">
            <div v-bind="dlg.contentProps.value">
                <h2 v-bind="dlg.titleProps.value">Title</h2>
                <button v-bind="dlg.closeTriggerProps.value">Close</button>
            </div>
        </div>
    </Teleport>
</template>
```

## Why an adapter?

A dialog's focus trap, scroll lock, and focus return are exactly the behaviours that are easy to get
subtly wrong — so oriUI delegates them to a battle-tested engine (Zag) behind the contract, rather
than hand-rolling them. See [DECISIONS.md](https://github.com/markgrushevski/oriui/blob/main/DECISIONS.md).
