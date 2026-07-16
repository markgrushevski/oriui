---
title: useDismissable
---

# useDismissable

A headless **dismiss layer** — the "close the overlay on an outside interaction" glue a non-platform
overlay needs, the pattern Radix `DismissableLayer` / Floating-UI `useDismiss` standardise. While
`enabled`, it attaches `document` listeners and calls `onDismiss()` when an interaction lands **outside**
the overlay's own elements. Each overlay picks the strategy that fits it:

- a **menu** (no single focus anchor) closes on **pointerdown outside** (`pointerDownOutside`);
- a **combobox** (focus lives on its input) closes on **focus-out** (`focusOutside`).

`OriMenu` and `OriCombobox` use this internally. (An `OriPopover` / `OriDialog` get dismiss for free from
the native `[popover]` / `<dialog>` top-layer, and Escape lives in the core connects — so they don't need
it.) The pure `isTargetOutside(target, elements)` predicate it's built on is exported from
[`@oriui/headless`](/headless/core).

## Import

```ts
import { useDismissable } from '@oriui/headless/vue';
```

## Options

`useDismissable(() => ({ … }))` takes its options as a getter (Svelte: a plain object or a store) so
`enabled` / `elements` stay reactive.

| Option               | Type                                         | Default | Description                                                                                         |
| -------------------- | -------------------------------------------- | ------- | --------------------------------------------------------------------------------------------------- |
| `enabled`            | `boolean`                                    | —       | Attach the listeners only while this is true — typically the overlay's `open`.                      |
| `elements`           | `() => (HTMLElement \| null \| undefined)[]` | —       | The overlay's own elements (content + trigger). An interaction inside ANY of them does NOT dismiss. |
| `onDismiss`          | `() => void`                                 | —       | Called to dismiss — typically `() => setOpen(false)`.                                               |
| `pointerDownOutside` | `boolean`                                    | `false` | Close on a `pointerdown` outside `elements`.                                                        |
| `focusOutside`       | `boolean`                                    | `false` | Close when focus lands outside `elements`.                                                          |

It returns nothing — it just manages the listeners (removed when `enabled` flips false or the scope
disposes). Attach happens after the render flush, so the interaction that opened the overlay can't
immediately dismiss it.

## Usage

Pass the overlay's `open`, its element refs, and a close callback — pick the strategy for your widget:

```vue
<!-- MyMenu.vue — pointerdown-outside (a menu has no single focus anchor) -->
<script setup lang="ts">
import { ref } from 'vue';
import { useDismissable } from '@oriui/headless/vue';

const open = ref(false);
const content = ref<HTMLElement>();
const trigger = ref<HTMLElement>();

useDismissable(() => ({
    enabled: open.value,
    elements: () => [content.value, trigger.value],
    onDismiss: () => (open.value = false),
    pointerDownOutside: true
}));
</script>
```

The **Svelte** binding is the same — options are a plain object or a store, and it wires the identical
listeners over the shared `isTargetOutside`:

```svelte
<script>
    import { writable, derived } from 'svelte/store';
    import { useDismissable } from '@oriui/headless/svelte';

    export let controlEl; // bound to the combobox control
    const open = writable(false);

    // focus-out for a combobox (focus lives on its input)
    useDismissable(derived(open, ($open) => ({
        enabled: $open,
        elements: () => [controlEl],
        onDismiss: () => open.set(false),
        focusOutside: true
    })));
</script>
```

The **React** binding is the same — options are a plain object (no getter / store), element refs come from
`useRef`, and it returns nothing; it wires the identical `document` capture listeners over the shared
`isTargetOutside`. The subscribe re-runs only when `enabled` / the strategy changes, and the latest
`onDismiss` / `elements` are always read on the event:

```tsx
// MyMenu.tsx — pointerdown-outside (a menu has no single focus anchor)
import { useRef, useState } from 'react';
import { useDismissable } from '@oriui/headless/react';

function MyMenu() {
    const [open, setOpen] = useState(false);
    const content = useRef<HTMLDivElement>(null);
    const trigger = useRef<HTMLButtonElement>(null);

    useDismissable({
        enabled: open,
        elements: () => [content.current, trigger.current],
        onDismiss: () => setOpen(false),
        pointerDownOutside: true
    });

    return (
        <>
            <button ref={trigger} onClick={() => setOpen((v) => !v)}>
                Menu
            </button>
            {open && <div ref={content}>…menu items…</div>}
        </>
    );
}
```

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
