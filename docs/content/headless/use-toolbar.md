---
title: useToolbar
---

# useToolbar

A headless **WAI-ARIA toolbar** — a set of related controls behind a **single Tab stop**, navigated
internally with the arrow keys via **roving tabindex** (real DOM focus, not `aria-activedescendant`).
The root owns orientation / loop / direction and a single keydown handler; each item registers itself
and receives its roving `tabindex`, so a toolbar is assembled from arbitrary **slotted** components
rather than a fixed data array.

This is the **Vue** binding; the framework-agnostic core (the pure roving index/key math) lives in
[`@oriui/headless`](/headless/core), and the styled [`OriToolbar`](/components/toolbar) is built on it.
Unlike [`useDialog`](/headless/use-dialog) (a state machine behind a swappable adapter) or
[`useMenu`](/headless/use-menu) (a state-machine projection with no adapter), a toolbar is a
compositional `provide` / `inject` roving **context** — real DOM order plus `.focus()`, with no
alternative engine to swap. It composes the pure roving helpers from the core rather than wrapping a
state machine.

## Import

```ts
import {
    useToolbar,
    useToolbarItem,
    useToolbarOrientation,
    useToolbarToggleGroup,
    useToolbarToggleItem
} from '@oriui/headless/vue';
```

The module exports five composables. `useToolbar` is the root — its options and return are below; the
four companions (`useToolbarItem`, `useToolbarOrientation`, `useToolbarToggleGroup`,
`useToolbarToggleItem`) follow in [Item & selection composables](#item--selection-composables).

## Options

`useToolbar(options?)` — every option is optional and accepts a plain value, a `ref`, or a getter
(`MaybeRefOrGetter`) so it can change reactively.

| Option        | Type                         | Default        | Description                                                                                                                |
| ------------- | ---------------------------- | -------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `orientation` | `'horizontal' \| 'vertical'` | `'horizontal'` | Arrow-key axis: `horizontal` navigates with Left/Right, `vertical` with Up/Down. Only `vertical` emits `aria-orientation`. |
| `loop`        | `boolean`                    | `true`         | Whether arrow navigation wraps first⇄last at the ends (the WAI-ARIA APG reference example wraps).                          |
| `dir`         | `'ltr' \| 'rtl'`             | `'ltr'`        | Text direction — `rtl` swaps the horizontal Left/Right mapping. Vertical navigation is direction-independent.              |
| `label`       | `string`                     | —              | Accessible name → `aria-label`. A toolbar MUST be named — via this or an `aria-labelledby` you pass through.               |

## Returns

| Property       | Type                  | Description                                                                                                                                                                                                                                 |
| -------------- | --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `toolbarProps` | `ComputedRef<object>` | The toolbar element's bag: `role="toolbar"`, `aria-orientation` (vertical only), `aria-label`, and the roving `onKeydown` handler. Bind with `v-bind`; no element ref is needed — the handler resolves the root from `event.currentTarget`. |

## Item & selection composables

Every prop bag these four return is a `ComputedRef` you bind with `v-bind`. `useToolbarItem` — and the
roving half of `useToolbarToggleItem` — registers with the `useToolbar` root: **outside a root there is
no context to join**, so its `tabindex` stays `-1` (unreachable by keyboard). `useToolbarToggleGroup` and
the **selection** half of `useToolbarToggleItem` (`aria-pressed` / `onChange`) run on their own
toggle-group context, independent of any toolbar root — only the roving tabindex depends on `useToolbar`.

### useToolbarItem

`useToolbarItem()` — registers the calling component as a toolbar item and returns its roving props.
Takes no arguments. Outside a `useToolbar` root there is nothing to register with, so `tabindex` stays
`-1` forever (unreachable by keyboard).

| Property    | Type                   | Description                                                                                                                                                                                                                   |
| ----------- | ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `itemProps` | `ComputedRef<object>`  | Spread on the focusable element (a `<button>`): the `data-ori-toolbar-item` marker the root navigates by, the roving `tabindex` (`0` when active, `-1` otherwise), and an `onFocus` that makes this item the active tab stop. |
| `isActive`  | `ComputedRef<boolean>` | Whether this item is the current roving tab stop (`tabindex="0"`).                                                                                                                                                            |

### useToolbarOrientation

`useToolbarOrientation()` — reads the enclosing toolbar's orientation, used by a custom separator or
group to render perpendicular / matching. It returns the getter **directly** (not a prop bag).

| Returns                | Type                      | Description                                                                                                                                                                            |
| ---------------------- | ------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| the orientation getter | `() => RovingOrientation` | Reads the enclosing orientation (`'horizontal' \| 'vertical'`); defaults to `'horizontal'` outside a toolbar. (The Svelte twin returns a `Readable<RovingOrientation>` store instead.) |

### useToolbarToggleGroup

`useToolbarToggleGroup(options)` — provides a toggle-selection context to nested
`useToolbarToggleItem`s. It is a `role="group"` layered over the flat toolbar roving order: its items
remain ordinary toolbar items, reached by the same arrow navigation, so the group adds no stop of its
own. Wire `value` / `onChange` to your `v-model`. All three `UseToolbarToggleGroupOptions` fields are
required:

| Option     | Type                                               | Description                                                                                        |
| ---------- | -------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| `type`     | `MaybeRefOrGetter<'single' \| 'multiple'>`         | `single` keeps one value and is deselectable (re-selecting clears it); `multiple` keeps a set.     |
| `value`    | `() => string \| string[] \| undefined`            | Getter for the current value: a string (or `undefined`) for `single`, a `string[]` for `multiple`. |
| `onChange` | `(value: string \| string[] \| undefined) => void` | Commit the next value (wire to your `v-model`).                                                    |

| Property     | Type                  | Description                                                                                    |
| ------------ | --------------------- | ---------------------------------------------------------------------------------------------- |
| `groupProps` | `ComputedRef<object>` | The group element's bag: `role="group"`. Bind with `v-bind`, and give it its own `aria-label`. |

### useToolbarToggleItem

`useToolbarToggleItem(value)` — composes `useToolbarItem` (roving) with the toggle-group selection
context. Pass the item's `value` (`MaybeRefOrGetter<string>`). Requires a surrounding
`useToolbarToggleGroup`.

| Property    | Type                   | Description                                                                                                                                                  |
| ----------- | ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `itemProps` | `ComputedRef<object>`  | `useToolbarItem`'s bag plus `aria-pressed` (derived from the group's selection) and an `onClick` that toggles this `value` in the group. Bind with `v-bind`. |
| `pressed`   | `ComputedRef<boolean>` | Whether this item is currently selected in the group.                                                                                                        |
| `isActive`  | `ComputedRef<boolean>` | Whether this item is the current roving tab stop.                                                                                                            |

## Usage

A toolbar is two pieces: a **root** that spreads `toolbarProps` (and owns the roving keydown), and
**items** that each call `useToolbarItem` to register and spread `itemProps`. This is exactly what the
styled [`OriToolbar`](/components/toolbar) / `OriToolbarButton` wrap.

```vue
<!-- MyToolbar.vue — the root: owns orientation / loop / dir + the roving keydown handler -->
<script setup lang="ts">
import { useToolbar } from '@oriui/headless/vue';

const { label = 'Formatting', orientation = 'horizontal' } = defineProps<{
    label?: string;
    orientation?: 'horizontal' | 'vertical';
}>();

// Pass getters so orientation / label stay reactive (vue/no-setup-props-reactivity-loss).
const { toolbarProps } = useToolbar({
    label: () => label,
    orientation: () => orientation
});
</script>

<template>
    <!-- No element ref: the keydown handler resolves the root from event.currentTarget. -->
    <div v-bind="toolbarProps">
        <slot></slot>
    </div>
</template>
```

```vue
<!-- MyToolbarButton.vue — an item: registers with the roving context, spreads itemProps -->
<script setup lang="ts">
import { useToolbarItem } from '@oriui/headless/vue';

defineProps<{ text: string }>();

// itemProps carries data-ori-toolbar-item + the roving tabindex + onFocus.
const { itemProps } = useToolbarItem();
</script>

<template>
    <button v-bind="itemProps">{{ text }}</button>
</template>
```

```vue
<MyToolbar label="Formatting">
    <MyToolbarButton text="New" />
    <MyToolbarButton text="Open" />
    <MyToolbarButton text="Save" />
</MyToolbar>
```

**A toggle group** layers selection state on the same roving context — a `useToolbarToggleGroup` root
plus `useToolbarToggleItem` children (`OriToolbarToggleGroup` / `OriToolbarToggleItem` wrap this):

```vue
<!-- MyToggleGroup.vue -->
<script setup lang="ts">
import { useToolbarToggleGroup } from '@oriui/headless/vue';

const { type = 'single' } = defineProps<{ type?: 'single' | 'multiple' }>();
const model = defineModel<string | string[]>();

const { groupProps } = useToolbarToggleGroup({
    type: () => type,
    value: () => model.value,
    onChange: (value) => {
        model.value = value;
    }
});
</script>

<template>
    <div v-bind="groupProps" aria-label="Text style">
        <slot></slot>
    </div>
</template>
```

```vue
<!-- MyToggleItem.vue -->
<script setup lang="ts">
import { useToolbarToggleItem } from '@oriui/headless/vue';

const { value } = defineProps<{ value: string }>();

// itemProps = roving props + aria-pressed (from the group) + the toggling onClick.
const { itemProps } = useToolbarToggleItem(() => value);
</script>

<template>
    <button v-bind="itemProps"><slot></slot></button>
</template>
```

The **Svelte** binding is the same — a `setContext` roving context, the prop bags as `Readable` stores
you auto-subscribe with `$`, and lowercased event handlers (`onkeydown` / `onfocus`). Options are a
plain object (or a store), not getters:

```svelte
<!-- MyToolbar.svelte -->
<script>
    import { useToolbar } from '@oriui/headless/svelte';

    export let label = 'Formatting';
    const { toolbarProps } = useToolbar({ label });
</script>

<div {...$toolbarProps}>
    <slot />
</div>
```

```svelte
<!-- MyToolbarButton.svelte -->
<script>
    import { useToolbarItem } from '@oriui/headless/svelte';

    export let text;
    const { itemProps } = useToolbarItem();
</script>

<button {...$itemProps}>{text}</button>
```

The **React** binding is the same two pieces — but because a React context needs a _rendered_ Provider
(Vue's `provide` / Svelte's `setContext` have no hook-only equivalent), `useToolbar` returns a stable
`ToolbarProvider` you wrap the items with. The prop bags are plain objects in React casing (`onKeyDown` /
`onFocus` / `tabIndex`), options are a plain object, and `@oriui/css` styles the markup with the same
`.ori-toolbar` classes in React / Next today:

```tsx
import { useToolbar, useToolbarItem } from '@oriui/headless/react';
import type { ReactNode } from 'react';

function Toolbar({ children, label = 'Formatting' }: { children: ReactNode; label?: string }) {
    const { toolbarProps, ToolbarProvider } = useToolbar({ label });
    // No element ref: the keydown handler resolves the root from event.currentTarget.
    return (
        <ToolbarProvider>
            <div {...toolbarProps}>{children}</div>
        </ToolbarProvider>
    );
}

function ToolbarButton({ text }: { text: string }) {
    // itemProps carries data-ori-toolbar-item + the roving tabIndex + onFocus.
    const { itemProps } = useToolbarItem();
    return <button {...itemProps}>{text}</button>;
}

// <Toolbar label="Formatting">
//     <ToolbarButton text="New" />
//     <ToolbarButton text="Open" />
//     <ToolbarButton text="Save" />
// </Toolbar>
```

A **toggle group** works the same way — `useToolbarToggleGroup` returns a `ToggleGroupProvider`, and
`useToolbarToggleItem` composes the roving item with the group's selection (`aria-pressed` + a toggling
`onClick`). It is controlled — pass `value` / `onChange`:

```tsx
import { useToolbarToggleGroup, useToolbarToggleItem } from '@oriui/headless/react';
import { useState, type ReactNode } from 'react';

function ToggleGroup({ children }: { children: ReactNode }) {
    const [value, setValue] = useState<string | string[] | undefined>();
    const { groupProps, ToggleGroupProvider } = useToolbarToggleGroup({ type: 'single', value, onChange: setValue });
    return (
        <ToggleGroupProvider>
            <div {...groupProps} aria-label="Text style">
                {children}
            </div>
        </ToggleGroupProvider>
    );
}

function ToggleItem({ value, children }: { value: string; children: ReactNode }) {
    // itemProps = roving props + aria-pressed (from the group) + the toggling onClick.
    const { itemProps } = useToolbarToggleItem(value);
    return <button {...itemProps}>{children}</button>;
}
```

## Accessibility

The prop bags carry the WAI-ARIA [Toolbar](https://www.w3.org/WAI/ARIA/apg/patterns/toolbar/) pattern;
the keyboard behaviour is the roving `onKeydown` on the root.

- `toolbarProps` set `role="toolbar"`, `aria-orientation` (emitted only for `vertical` — `horizontal`
  is the ARIA implicit default), `aria-label` (from `label`), and the roving `onKeydown`. A
  `role="toolbar"` **must** have an accessible name — pass `label`, or pass your own `aria-labelledby`
  through onto the element.
- **Roving tabindex.** Exactly one item is `tabindex="0"` at a time — the active one, defaulting to the
  first registered item; every other item is `tabindex="-1"`. Real DOM focus moves as you navigate;
  there is no `aria-activedescendant`. `itemProps`' `onFocus` makes the focused item the active stop.
- **DOM-order navigation.** The keydown handler resolves items by
  `root.querySelectorAll('[data-ori-toolbar-item]')` in document order, so navigation stays correct
  even when items are conditionally rendered or reordered — no order-stable ref array required.
- **Focusable disabled.** Navigation visits every registered item, so implement a disabled item as
  `aria-disabled` (leaving the element focusable and carrying the `data-ori-toolbar-item` marker)
  rather than the native `disabled` attribute — the WAI-ARIA toolbar keeps disabled controls
  discoverable, blocking only activation. (The styled `OriToolbarButton` does exactly this.)
- **Composite-child yield.** When focus sits on a control that owns the arrow keys, the toolbar's
  keydown yields entirely and does not steal them. That covers a native `input` (every type **except**
  `checkbox` / `button` — so a native radio yields), `textarea`, `select`, or `[contenteditable]`; an
  element whose **own** `role` is `slider` / `spinbutton` / `radiogroup` / `menu` / `listbox` /
  `combobox` / `textbox`; or any element **inside an ancestor** with `role` `radiogroup` / `menu` /
  `listbox` / `grid` / `tree`. Per the APG, include at most one such control and place it last.

| Key                                    | Action                                                                                                                               |
| -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `Tab` / `Shift+Tab`                    | Move focus into the toolbar (landing on the active item) or past it — the whole toolbar is a single tab stop.                        |
| `ArrowRight` / `ArrowLeft`             | Horizontal: move the roving stop to the next / previous item (wraps first⇄last when `loop`, the default). Swapped under `dir="rtl"`. |
| `ArrowDown` / `ArrowUp`                | Vertical: move the roving stop to the next / previous item (wraps when `loop`).                                                      |
| `Home` / `End`                         | Jump the roving stop to the first / last item, in either orientation.                                                                |
| `Enter` / `Space`                      | Activate the focused item — native for a `<button>`; a toggle item's `onClick` flips its value in the group.                         |
| Arrow keys, focus in a composite child | Not intercepted — the focused input / composite widget keeps its own arrow-key behaviour.                                            |

## See also

- [@oriui/headless](/headless/core) — the framework-agnostic core: the pure roving index/key math
  (`rovingIntent` / `resolveRovingIndex`) and the arrow-yield predicate, shared with the Svelte twin.
- [Toolbar](/components/toolbar) — the styled `OriToolbar` (+ Button / Separator / ToggleGroup /
  ToggleItem) built on these composables.
- [useDialog](/headless/use-dialog) · [useDisclosure](/headless/use-disclosure) — the sibling headless
  primitives (the machine-behind-a-swappable-adapter shape).
- [CSS layer](/guides/css) — the standalone `.ori-toolbar` classes for the toolbar parts.
