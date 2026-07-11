---
title: useTabs
---

# useTabs

A headless **WAI-ARIA tabs** widget with **automatic activation** — a `tablist` of tabs behind a single
Tab stop, navigated with the arrow keys via **roving tabindex** (real DOM focus, not
`aria-activedescendant`), where moving focus also selects. It is **data-driven**: you pass the `tabs`
array plus the selected value, and it returns the `tablist` prop bag plus per-tab and per-panel
prop-getters (ids, `aria-selected`, `aria-controls`, `aria-labelledby`, roving `tabindex`, `hidden`).

This is the **Vue** binding; the framework-agnostic core (the pure roving index/key math) lives in
[`@oriui/headless`](/headless/core), and the styled [`OriTabs`](/components/tabs) is built on it. Like
[`useColorPicker`](/headless/use-color-picker) and unlike the compositional
[`useToolbar`](/headless/use-toolbar) (arbitrary slotted items behind a `provide` / `inject` context),
Tabs is driven by a data array — there is no context and no state machine, just the shared roving
helpers plus a defensive selection resolver.

## Import

```ts
import { useTabs } from '@oriui/headless/vue';
```

## Options

`useTabs(() => ({ … }))` takes its options as a **getter** — like
[`useColorPicker`](/headless/use-color-picker) / [`useCombobox`](/headless/use-combobox) — so `tabs` /
`value` / `orientation` stay reactive.

| Option        | Type                                | Default        | Description                                                                                            |
| ------------- | ----------------------------------- | -------------- | ------------------------------------------------------------------------------------------------------ |
| `tabs`        | `TabItem[]`                         | —              | The set of tabs, in order. `TabItem` is `{ value: string \| number; disabled?: boolean }` (behaviour). |
| `value`       | `string \| number \| undefined`     | —              | The controlled selection (bind to `v-model`). Resolves to the first enabled tab when unset.            |
| `orientation` | `'horizontal' \| 'vertical'`        | `'horizontal'` | Arrow-key axis: `horizontal` navigates Left/Right, `vertical` Up/Down.                                 |
| `idBase`      | `string`                            | `useId()`      | SSR-stable base for the derived `${base}-tab-${i}` / `-panel-${i}` ids.                                |
| `onChange`    | `(value: string \| number) => void` | —              | Commit the next selected value (wire to your `v-model`).                                               |

## Returns

| Property        | Type                                         | Description                                                                                                                                                                                      |
| --------------- | -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `selectedValue` | `ComputedRef<string \| number \| undefined>` | The effective selection: `value` when it points at a real, enabled tab; otherwise the first enabled tab (recovers from an unset / missing / disabled value).                                     |
| `select`        | `(tab: TabItem) => void`                     | Commit a tab (no-op when `tab.disabled`); calls `onChange`.                                                                                                                                      |
| `tablistProps`  | `ComputedRef<object>`                        | The `tablist` element's bag: `role="tablist"`, `aria-orientation`, and the roving `onKeydown`. Bind with `v-bind`; no element ref — the handler resolves the tablist from `event.currentTarget`. |
| `getTabProps`   | `(tab, index) => object`                     | Per-tab `<button>` bag: `id`, `role="tab"`, `aria-selected`, `aria-controls`, the roving `tabindex` (`0` for the selected tab, `-1` otherwise), `disabled`, and an `onClick` that selects it.    |
| `getPanelProps` | `(tab, index) => object`                     | Per-panel bag: `id`, `role="tabpanel"`, `aria-labelledby` (its tab), `hidden` when not selected, and `tabindex="0"`.                                                                             |

## Usage

Spread `tablistProps` on the list, then `v-for` the `tabs` — a `<button>` per tab with
`getTabProps(tab, i)`, and a panel per tab with `getPanelProps(tab, i)`. This is exactly what the styled
[`OriTabs`](/components/tabs) wraps.

```vue
<!-- MyTabs.vue -->
<script setup lang="ts">
import { useTabs } from '@oriui/headless/vue';

const { tabs } = defineProps<{
    tabs: { value: string; label: string; disabled?: boolean }[];
}>();
const model = defineModel<string>();

const { tablistProps, getTabProps, getPanelProps } = useTabs(() => ({
    tabs,
    value: model.value,
    onChange: (value) => {
        model.value = value as string;
    }
}));
</script>

<template>
    <div>
        <!-- No element ref: the keydown handler resolves the tablist from event.currentTarget. -->
        <div v-bind="tablistProps">
            <button v-for="(tab, i) in tabs" :key="tab.value" v-bind="getTabProps(tab, i)">{{ tab.label }}</button>
        </div>

        <div v-for="(tab, i) in tabs" :key="tab.value" v-bind="getPanelProps(tab, i)">
            <slot :name="tab.value" />
        </div>
    </div>
</template>
```

The **Svelte** binding is the same — the prop bags are `Readable` stores you auto-subscribe with `$`, the
item / panel getters are **stores of functions** (`$getTabProps(tab, i)`), event handlers are lowercased
(`onkeydown` / `onclick`), and options are a plain object (or a store), not a getter:

```svelte
<!-- MyTabs.svelte -->
<script>
    import { useTabs } from '@oriui/headless/svelte';

    export let tabs;
    let value;
    $: t = useTabs({ tabs, value, onChange: (v) => (value = v) });
    $: ({ tablistProps, getTabProps, getPanelProps } = t);
</script>

<div {...$tablistProps}>
    {#each tabs as tab, i (tab.value)}
        <button {...$getTabProps(tab, i)}>{tab.label}</button>
    {/each}
</div>

{#each tabs as tab, i (tab.value)}
    <div {...$getPanelProps(tab, i)}><slot name={tab.value} /></div>
{/each}
```

## Accessibility

The prop bags carry the WAI-ARIA [Tabs](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/) pattern with
**automatic activation** (arrows move focus and select in one step); the keyboard behaviour is the
roving `onKeydown` on the tablist.

- `tablistProps` set `role="tablist"` + `aria-orientation`; each `getTabProps` bag is a
  `role="tab"` with `aria-selected`, `aria-controls` → its panel id, and the roving `tabindex`; each
  `getPanelProps` bag is a `role="tabpanel"` with `aria-labelledby` → its tab id, `hidden` when
  inactive, and `tabindex="0"` (the panel is focusable so keyboard users can reach its content).
- **Roving tabindex.** Exactly one tab is `tabindex="0"` — the selected one; every other tab is
  `tabindex="-1"`. Real DOM focus moves as you navigate; there is no `aria-activedescendant`.
- **DOM-order navigation.** The keydown handler resolves tabs by `querySelectorAll('[role="tab"]')` in
  document order, so navigation stays correct even when tabs are conditionally rendered or reordered.
- **Disabled tabs are skipped.** A `disabled` tab uses the native `disabled` attribute; arrow navigation
  steps **over** it (the core `resolveRovingIndex` skip predicate — "the Tabs model") and `selectedValue`
  recovers to the first enabled tab if a disabled/missing value is bound.

| Key                        | Action                                                                                            |
| -------------------------- | ------------------------------------------------------------------------------------------------- |
| `Tab` / `Shift+Tab`        | Move focus onto the selected tab, or past the tablist to the panel — the tablist is one tab stop. |
| `ArrowRight` / `ArrowLeft` | Horizontal: select + focus the next / previous enabled tab (wraps first⇄last, skipping disabled). |
| `ArrowDown` / `ArrowUp`    | Vertical (`orientation="vertical"`): select + focus the next / previous enabled tab.              |
| `Home` / `End`             | Select + focus the first / last enabled tab.                                                      |

## See also

- [@oriui/headless](/headless/core) — the framework-agnostic core: the pure roving index/key math
  (`rovingIntent` / `resolveRovingIndex`, with the skip-disabled predicate), shared with the Svelte twin.
- [Tabs](/components/tabs) — the styled `OriTabs` built on this composable.
- [useToolbar](/headless/use-toolbar) — the sibling roving primitive (compositional, slotted items).
- [CSS layer](/guides/css) — the standalone `.ori-tabs` classes for the tabs parts.
