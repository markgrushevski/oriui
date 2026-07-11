---
title: useMenu
---

# useMenu

A headless **menu button** primitive built on the WAI-ARIA menu-button pattern — a trigger that opens a
popup menu of actions, with **roving tabindex**, arrow / `Home` / `End` navigation, and `Enter` / `Space`
activation. It owns the open state and the highlighted item and exposes the ARIA wiring as ready-to-bind
prop bags; **you own the markup, the styles, and the DOM focus** (roving needs real focus, and
click-outside / focus-return are host concerns a state projection can't reach).

This is the **Vue** binding; the framework-agnostic core lives in [`@oriui/headless`](/headless/core), and
the styled [`OriMenu`](/components/menu) is built on it. Like [`useDialog`](/headless/use-dialog) /
[`useDisclosure`](/headless/use-disclosure), `useMenu` resolves through the swappable
[`OriHeadless`](/headless/core) contract — its default is a thin projection of the core menu **state
machine** (no adapter to register unless you want to swap one), and the composable hands you `open` /
`highlightedValue` to watch so the UI can move real DOM focus itself.

## Import

```ts
import { useMenu, type MenuItem } from '@oriui/headless/vue';
```

## Options

Pass an options object (or a getter returning one, to stay reactive):

| Option     | Type                      | Default        | Description                                                                      |
| ---------- | ------------------------- | -------------- | -------------------------------------------------------------------------------- |
| `items`    | `MenuItem[]`              | **required**   | The menu items, in render order. Reactive — navigation re-syncs when it changes. |
| `id`       | `string`                  | auto (`useId`) | Stable base id for the trigger / content / item ARIA wiring. Pass one for SSR.   |
| `disabled` | `boolean`                 | `false`        | Disables the trigger and blocks opening the menu.                                |
| `onSelect` | `(value: string) => void` | —              | Fired when an item is activated (click / `Enter` / `Space`); the menu closes.    |

Each `MenuItem` is a plain object — `value` is the stable identity and the `onSelect` payload:

```ts
interface MenuItem {
    value: string; // stable identity + the value passed to onSelect
    label?: string; // display text; falls back to value
    disabled?: boolean; // skipped by roving navigation and selection
}
```

## Returns

The open / highlight state plus the prop bags you bind to each part. Every `*Props` value is a
`ComputedRef`, and `getItemProps` returns a bag — bind each with `v-bind`.

| Property                    | Type                                           | Description                                                                                                                                            |
| --------------------------- | ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `open`                      | `ComputedRef<boolean>`                         | Whether the menu is open.                                                                                                                              |
| `highlightedValue`          | `ComputedRef<string \| null>`                  | The roving-highlighted item's `value`, or `null`. Watch it to move real DOM focus to the active item.                                                  |
| `items`                     | `ComputedRef<MenuItem[]>`                      | The current item list (echoes the `items` option) — convenient to `v-for` over.                                                                        |
| `triggerProps`              | `ComputedRef<object>`                          | The menu button: `type`, `aria-haspopup="menu"`, `aria-controls`, live `aria-expanded`, `data-state`, and the click / keydown handlers.                |
| `contentProps`              | `ComputedRef<object>`                          | The `role="menu"` panel: `aria-labelledby`, `aria-orientation="vertical"`, `tabindex="-1"`, `hidden` while closed, and the navigation keydown handler. |
| `separatorProps`            | `ComputedRef<object>`                          | A `role="separator"` divider (`aria-orientation="horizontal"`) for grouping items.                                                                     |
| `getItemProps(item, index)` | `(item: MenuItem, index: number) => object`    | Per-item bag: `role="menuitem"`, roving `tabindex`, `data-highlighted`, `aria-disabled`, and the click / pointermove handlers.                         |
| `getItemState(item)`        | `(item: MenuItem) => { highlighted: boolean }` | The item's derived state — currently just whether it is highlighted — for your own styling.                                                            |
| `setOpen(open)`             | `(open: boolean) => void`                      | Open / close imperatively (the host uses this to close on outside click).                                                                              |
| `highlight(value)`          | `(value: string \| null) => void`              | Set the highlighted item by `value`; `null` clears the highlight.                                                                                      |
| `highlightFirst()`          | `() => void`                                   | Highlight the first enabled item.                                                                                                                      |
| `highlightLast()`           | `() => void`                                   | Highlight the last enabled item.                                                                                                                       |

Every prop bag also carries `data-scope="menu"` and a `data-part` (`trigger` / `content` / `item` /
`separator`) styling hook.

## Usage

The composable projects state to prop bags; the **host** moves real DOM focus to the highlighted item
(roving requires it), returns focus to the trigger on close, and wires the outside-click dismissal —
things a framework-agnostic projection can't do itself:

```vue
<script setup lang="ts">
import { nextTick, onBeforeUnmount, useTemplateRef, watch } from 'vue';
import { useMenu, type MenuItem } from '@oriui/headless/vue';

const items: MenuItem[] = [
    { value: 'new', label: 'New file' },
    { value: 'open', label: 'Open…' },
    { value: 'delete', label: 'Delete', disabled: true }
];

const m = useMenu(() => ({ items, onSelect: (value) => console.log(value) }));

const contentRef = useTemplateRef<HTMLElement>('content');
const triggerEl = (): HTMLElement | null => {
    const id = m.triggerProps.value.id as string | undefined;
    return id ? document.getElementById(id) : null;
};

// Roving tabindex: move real DOM focus to the highlighted item whenever it changes while open.
watch(
    () => m.highlightedValue.value,
    async () => {
        if (!m.open.value) return;
        await nextTick();
        contentRef.value?.querySelector<HTMLElement>('[data-highlighted]')?.focus();
    }
);

// On open, focus the menu and wire outside-click; on close, return focus to the trigger.
const onOutside = (event: PointerEvent): void => {
    const target = event.target as Node;
    if (contentRef.value?.contains(target) || triggerEl()?.contains(target)) return;
    m.setOpen(false);
};
watch(
    () => m.open.value,
    async (open) => {
        if (open) {
            await nextTick();
            if (m.highlightedValue.value === null) contentRef.value?.focus();
            document.addEventListener('pointerdown', onOutside);
        } else {
            document.removeEventListener('pointerdown', onOutside);
            triggerEl()?.focus();
        }
    }
);
onBeforeUnmount(() => document.removeEventListener('pointerdown', onOutside));
</script>

<template>
    <button v-bind="m.triggerProps.value">Actions</button>

    <div v-bind="m.contentProps.value" ref="content" class="ori-menu">
        <div
            v-for="(item, index) in items"
            :key="item.value"
            v-bind="m.getItemProps(item, index)"
            class="ori-menu__item"
        >
            {{ item.label ?? item.value }}
        </div>
    </div>
</template>
```

The styled [`OriMenu`](/components/menu) wraps exactly this pattern — the roving-focus watch, the
open / close focus-return, and the outside-click listener — behind a `#trigger` slot and CSS Anchor
Positioning.

The **Svelte** binding is the same — auto-subscribe the stores with `$`, and move DOM focus in an
`$effect` (`getItemProps` is a store of a function, so call `$getItemProps(item, i)`):

```svelte
<script>
    import { useMenu } from '@oriui/headless/svelte';

    let contentEl;
    const { open, highlightedValue, items, triggerProps, contentProps, getItemProps } = useMenu({
        id: 'actions',
        items: [
            { value: 'new', label: 'New file' },
            { value: 'open', label: 'Open…' },
            { value: 'delete', label: 'Delete', disabled: true }
        ],
        onSelect: (value) => console.log(value)
    });

    // Roving tabindex: a projection can't touch the DOM, so move real focus to the highlighted item.
    $effect(() => {
        if ($open && $highlightedValue != null) contentEl?.querySelector('[data-highlighted]')?.focus();
    });
</script>

<button {...$triggerProps}>Actions</button>

<div {...$contentProps} bind:this={contentEl} class="ori-menu">
    {#each $items as item, i}
        <div {...$getItemProps(item, i)} class="ori-menu__item">{item.label ?? item.value}</div>
    {/each}
</div>
```

## Accessibility

The prop bags carry the full WAI-ARIA menu-button contract; the host completes it by moving real focus.

- **The trigger MUST be a real `<button>`** (or a component rendering one) with an accessible name.
  `triggerProps` set `type="button"`, `aria-haspopup="menu"`, `aria-controls` (the panel id), and a
  live `aria-expanded` that tracks `open` — the machine owns `open`, so this stays in sync.
- `contentProps` set `role="menu"`, `aria-labelledby` the trigger, `aria-orientation="vertical"`,
  `tabindex="-1"`, and `hidden` while closed. Items get `role="menuitem"` from `getItemProps`.
- **Roving tabindex**: exactly one item (the highlighted one) is `tabindex="0"` and carries
  `data-highlighted`; the rest are `tabindex="-1"`. There is no `aria-activedescendant` — the host moves
  real DOM focus to the highlighted item as you navigate, driven by watching `highlightedValue`.
- A disabled item (`disabled: true`) is `aria-disabled="true"` and is skipped by Arrow / `Home` / `End`
  navigation and by selection.
- Selecting an item (click, or `Enter` / `Space` on the highlighted one) fires `onSelect` with its
  `value` and closes the menu; the host returns focus to the trigger. `Escape`, `Tab`, and an outside
  click also close it — the machine sends `CLOSE` on `Escape` / `Tab`, and the host calls `setOpen(false)`
  on the outside click.

| Key                            | Action                                                           |
| ------------------------------ | ---------------------------------------------------------------- |
| `Enter` / `Space` (on trigger) | Opens the menu and highlights the first enabled item.            |
| `↓` (on trigger)               | Opens the menu and highlights the first enabled item.            |
| `↑` (on trigger)               | Opens the menu and highlights the last enabled item.             |
| `↓` / `↑` (in menu)            | Moves the highlight to the next / previous enabled item (wraps). |
| `Home` / `End` (in menu)       | Highlights the first / last enabled item.                        |
| `Enter` / `Space` (on item)    | Activates the highlighted item — fires `onSelect`, then closes.  |
| `Escape`                       | Closes the menu (the host returns focus to the trigger).         |
| `Tab`                          | Closes the menu and moves focus onward (does not trap focus).    |

## See also

- [@oriui/headless](/headless/core) — the framework-agnostic core: the menu state machine + the `connect`
  projection behind this binding.
- [OriMenu](/components/menu) — the styled component built on this composable.
- [useDialog](/headless/use-dialog) · [useDisclosure](/headless/use-disclosure) — the sibling headless
  overlay / show-hide primitives.
- [CSS layer](/guides/css) — the standalone `.ori-menu` / `.ori-menu__item` classes for the menu parts.
