---
title: useDismissable
---

# useDismissable

A headless **dismiss layer** — the "close the overlay on an outside interaction" glue a non-platform
overlay needs, the pattern Radix `DismissableLayer` / Floating-UI `useDismiss` standardize. While
`enabled`, it attaches `document` listeners and calls `onDismiss()` when an interaction lands **outside**
the overlay's own elements. Both triggers are on by default — a **pointerdown outside**
(`pointerDownOutside`) and **focus moving outside** (`focusOutside`) — and an overlay turns off the one that
does not fit it:

- a **combobox** (focus lives on its input) keeps both;
- a **menu** (no single focus anchor) turns `focusOutside` off;
- a **non-modal drawer** turns `focusOutside` off too, because focus may move to the page while it stays open.

`OriCombobox`, `OriMenu` and a non-modal `OriDrawer` use this internally. (An `OriPopover` / `OriDialog` get dismiss for free from
the native `[popover]` / `<dialog>` top-layer, and Escape lives in the core connects — so they don't need
it.) The pure `isTargetOutside(target, elements)` predicate it's built on is exported from
[`@oriui/headless`](/headless/core).

## Import

```ts
import { useDismissable } from '@oriui/headless/vue'
```

## Options

`useDismissable(() => ({ … }))` takes its options as a getter so `enabled` / `elements` stay reactive.

| Option               | Type                                         | Default | Description                                                                                         |
| -------------------- | -------------------------------------------- | ------- | --------------------------------------------------------------------------------------------------- |
| `enabled`            | `boolean`                                    | —       | Attach the listeners only while this is true — typically the overlay's `open`.                      |
| `elements`           | `() => (HTMLElement \| null \| undefined)[]` | —       | The overlay's own elements (content + trigger). An interaction inside ANY of them does NOT dismiss. |
| `onDismiss`          | `() => void`                                 | —       | Called to dismiss — typically `() => setOpen(false)`.                                               |
| `pointerDownOutside` | `boolean`                                    | `true`  | Close on a `pointerdown` outside `elements`.                                                        |
| `focusOutside`       | `boolean`                                    | `true`  | Close when focus lands outside `elements`.                                                          |

It returns nothing — it just manages the listeners (removed when `enabled` flips false or the scope
disposes). Attach happens after the render flush, so the interaction that opened the overlay can't
immediately dismiss it.

## Usage

Pass the overlay's `open`, its element refs, and a close callback — and turn off a trigger your widget does
not want:

::example

#vue

```vue
<!-- MyMenu.vue — pointerdown-outside only (a menu has no single focus anchor) -->
<script setup lang="ts">
import { ref } from 'vue'
import { useDismissable } from '@oriui/headless/vue'

const open = ref(false)
const content = ref<HTMLElement>()
const trigger = ref<HTMLElement>()

useDismissable(() => ({
    enabled: open.value,
    elements: () => [content.value, trigger.value],
    onDismiss: () => (open.value = false),
    focusOutside: false
}))
</script>
```

::

## Accessibility

- Dismiss is one half of an overlay's a11y contract; the other keys live elsewhere — **Escape** is handled
  by the [Menu](/headless/use-menu) / [Combobox](/headless/use-combobox) core connects, and roving focus by
  their own machines. `useDismissable` only adds the outside-interaction close.
- `pointerDownOutside` fires on `pointerdown` (before `click`), so the overlay closes as the outside press
  begins — matching native menus. `focusOutside` closes when focus genuinely leaves the widget (Tab-away or
  a click that moves focus out), so a screen-reader user Tabbing past a combobox closes its list.

## See also

- [@oriui/headless](/headless/core) — the `isTargetOutside` predicate the composables share.
- [useMenu](/headless/use-menu) · [useCombobox](/headless/use-combobox) — the overlays that consume it.
- [Popover](/components/popover) · [Dialog](/components/dialog) — the platform overlays that dismiss without it.
