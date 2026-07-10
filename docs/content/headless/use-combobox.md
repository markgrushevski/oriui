---
title: useCombobox
---

# useCombobox

A headless **combobox** primitive — an editable text input paired with a popup listbox — implementing
the WAI-ARIA _combobox with listbox popup_ pattern: type to filter, navigate with the keyboard via
active-descendant, and pick a single option. It owns the behaviour (open/close, filtering, the
highlight, selection, and the full keyboard) and the ARIA wiring as ready-to-bind prop bags; **you own
the markup and styles**.

This is the **Vue** binding; the framework-agnostic core lives in [`@oriui/headless`](/headless/core),
and the styled [`OriCombobox`](/components/combobox) is built on it. Unlike
[`useDialog`](/headless/use-dialog) / [`useDisclosure`](/headless/use-disclosure) — which lean on a
zero-dependency native platform default — a combobox has no native primitive, so `useCombobox` consumes
the core **state machine + prop-getters** directly (there is no swappable adapter): it is the first
behavior to fully exercise the [`@oriui/headless`](/headless/core) engine.

## Import

```ts
import { useCombobox } from '@oriui/headless/vue';
```

## Options

Pass an options object — or a getter returning one, to stay reactive (the styled component passes
`() => ({ … })`). `options`, `disabled`, and `filter` are read live; `id` and the initial `value` /
`inputValue` are read once at setup.

| Option       | Type                                             | Default        | Description                                                                                     |
| ------------ | ------------------------------------------------ | -------------- | ----------------------------------------------------------------------------------------------- |
| `options`    | `ComboboxItem[]`                                 | **required**   | The full option list. Reactive — filtering re-runs when it changes.                             |
| `id`         | `string`                                         | auto (`useId`) | Stable base id for the part ARIA wiring; auto-generated when omitted (pass one for stable SSR). |
| `value`      | `string \| null`                                 | `null`         | Initial selected value (uncontrolled).                                                          |
| `inputValue` | `string`                                         | `''`           | Initial input text (uncontrolled).                                                              |
| `disabled`   | `boolean`                                        | `false`        | Disable the control; also closes the listbox.                                                   |
| `filter`     | `(item: ComboboxItem, query: string) => boolean` | substring      | Filter predicate; default = case-insensitive substring on the label. Swap for fuzzy / async.    |

Each option is a `ComboboxItem` — `value` is the stable identity, `label` is what the input shows:

```ts
interface ComboboxItem {
    value: string;
    label: string;
    disabled?: boolean;
}
```

## Returns

A control object — the reactive state plus the prop bags you bind to each part. Every `*Props` value is
a `ComputedRef`; bind it with `v-bind`. The `get*` / `set*` and the action members are plain functions.

| Property                      | Type                                                                  | Description                                                                                                                                       |
| ----------------------------- | --------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `open`                        | `ComputedRef<boolean>`                                                | Whether the listbox is open.                                                                                                                      |
| `value`                       | `ComputedRef<string \| null>`                                         | The selected option's `value`, or `null`.                                                                                                         |
| `inputValue`                  | `ComputedRef<string>`                                                 | The current input text.                                                                                                                           |
| `highlightedValue`            | `ComputedRef<string \| null>`                                         | The active (keyboard-highlighted) option's `value`, or `null`.                                                                                    |
| `items`                       | `ComputedRef<ComboboxItem[]>`                                         | The visible (filtered) options — render these, and pass their index into `getOptionProps`.                                                        |
| `rootProps`                   | `ComputedRef<object>`                                                 | The wrapper element (`data-state`).                                                                                                               |
| `labelProps`                  | `ComputedRef<object>`                                                 | The `<label>` wiring (`id` / `for` → the input).                                                                                                  |
| `controlProps`                | `ComputedRef<object>`                                                 | The control wrapper around input + triggers (`data-state` / `data-disabled`).                                                                     |
| `inputProps`                  | `ComputedRef<object>`                                                 | The `role="combobox"` input: `aria-autocomplete` / `aria-expanded` / `aria-controls` / `aria-activedescendant` plus the input & keydown handlers. |
| `triggerProps`                | `ComputedRef<object>`                                                 | The open/close toggle button (`tabindex="-1"`, `aria-expanded` / `aria-controls`).                                                                |
| `clearTriggerProps`           | `ComputedRef<object>`                                                 | The clear button (`tabindex="-1"`).                                                                                                               |
| `listboxProps`                | `ComputedRef<object>`                                                 | The `role="listbox"` popup (`aria-labelledby`, `hidden` while closed).                                                                            |
| `getOptionProps(item, index)` | `(item: ComboboxItem, index: number) => object`                       | Per-option prop bag (`role="option"`, `aria-selected`, `data-highlighted`, click / pointermove). `index` must be the position in `items`.         |
| `getOptionState(item)`        | `(item: ComboboxItem) => { highlighted: boolean; selected: boolean }` | The `{ highlighted, selected }` state for the item — for conditional classes.                                                                     |
| `setOpen(open)`               | `(open: boolean) => void`                                             | Open / close the listbox imperatively.                                                                                                            |
| `setInputValue(next)`         | `(next: string) => void`                                              | Set the input text (filters and opens).                                                                                                           |
| `select(item)`                | `(item: ComboboxItem) => void`                                        | Commit a selection — reflects its `label` into the input and closes.                                                                              |
| `clear()`                     | `() => void`                                                          | Clear the selection and the input.                                                                                                                |

## Usage

Bind each part's prop bag with `v-bind`, render `items`, and pass the same `index` you iterate with into
`getOptionProps`:

```vue
<script setup lang="ts">
import { useCombobox } from '@oriui/headless/vue';

const cb = useCombobox(() => ({
    options: [
        { label: 'Apple', value: 'apple' },
        { label: 'Banana', value: 'banana' },
        { label: 'Cherry', value: 'cherry' }
    ]
}));
</script>

<template>
    <div v-bind="cb.rootProps.value">
        <label v-bind="cb.labelProps.value">Fruit</label>

        <div v-bind="cb.controlProps.value">
            <input v-bind="cb.inputProps.value" placeholder="Search a fruit…" @blur="cb.setOpen(false)" />
            <button v-bind="cb.triggerProps.value">▾</button>

            <ul v-bind="cb.listboxProps.value">
                <li
                    v-for="(item, index) in cb.items.value"
                    :key="item.value"
                    v-bind="cb.getOptionProps(item, index)"
                    :data-selected="cb.getOptionState(item).selected"
                >
                    {{ item.label }}
                </li>
            </ul>
        </div>
    </div>
</template>
```

The machine keeps no notion of validation, `v-model`, or blur-to-close — those live in the consumer. The
styled [`OriCombobox`](/components/combobox) wraps exactly this pattern and layers the form contract
(label / hint / error / `required`), `v-model` sync, and `@blur="setOpen(false)"` on top.

The **Svelte** binding is the same — the composable returns stores (auto-subscribe with `$`), and the
item prop-getters are a store of a function (`$getOptionProps(item, i)`):

```svelte
<script>
    import { useCombobox } from '@oriui/headless/svelte';

    const { items, rootProps, labelProps, controlProps, inputProps, triggerProps, listboxProps, getOptionProps, getOptionState, setOpen } =
        useCombobox({
            options: [
                { label: 'Apple', value: 'apple' },
                { label: 'Banana', value: 'banana' },
                { label: 'Cherry', value: 'cherry' }
            ]
        });
</script>

<div {...$rootProps}>
    <label {...$labelProps}>Fruit</label>

    <div {...$controlProps}>
        <input {...$inputProps} placeholder="Search a fruit…" on:blur={() => setOpen(false)} />
        <button {...$triggerProps}>▾</button>

        <ul {...$listboxProps}>
            {#each $items as item, i}
                <li {...$getOptionProps(item, i)} data-selected={$getOptionState(item).selected}>
                    {item.label}
                </li>
            {/each}
        </ul>
    </div>
</div>
```

In Svelte the options are a `MaybeReactive` — pass a store instead of a plain object to react to a
changing option list or `disabled`.

## Accessibility

Implements the WAI-ARIA **combobox with listbox popup** pattern; the prop bags carry the wiring.

- `inputProps` set `role="combobox"` with `aria-autocomplete="list"`, `autocomplete="off"`,
  `aria-expanded`, and `aria-controls` pointing at the listbox; the highlighted option is referenced by
  `aria-activedescendant` — focus never leaves the input, so no roving `tabindex` is needed.
- `listboxProps` set `role="listbox"`, `aria-labelledby` (the element you bind `labelProps` to), and
  `hidden` while closed. Options from `getOptionProps` are `role="option"` with `aria-selected`; a
  disabled item carries `aria-disabled` and is skipped by keyboard navigation. Each option also exposes
  `data-highlighted` (active) and `data-state="checked|unchecked"` for styling.
- `triggerProps` / `clearTriggerProps` are `tabindex="-1"` buttons (the input keeps focus) with
  accessible labels ("Open / Close suggestions", "Clear selection"); the trigger also carries
  `aria-expanded` / `aria-controls`.
- Selecting an option reflects its `label` into the input and closes the list. The machine does **not**
  dismiss on blur — wire `setOpen(false)` on the input's `blur` yourself (as the example and the styled
  component do); `Tab` therefore moves focus away but does not itself close the list.
- Option ids are derived from the position in `items`, so always pass the same `index` you iterate
  `items` with into `getOptionProps(item, index)`, or `aria-activedescendant` will point at the wrong row.

| Key            | Action                                                                                          |
| -------------- | ----------------------------------------------------------------------------------------------- |
| `↓` / `↑`      | Open the list (if closed) and move the highlight to the next / previous enabled option (wraps). |
| `Home` / `End` | Highlight the first / last enabled option (when open).                                          |
| `Enter`        | Select the highlighted option (when open).                                                      |
| `Escape`       | Close the list (when open).                                                                     |
| Type           | Filter the options and (re)open the list.                                                       |

## See also

- [@oriui/headless](/headless/core) — the framework-agnostic contract and the core state machine.
- [OriCombobox](/components/combobox) — the styled component built on this primitive.
- [useDialog](/headless/use-dialog) · [useDisclosure](/headless/use-disclosure) ·
  [useTheme](/headless/use-theme) — the other headless primitives.
- [CSS layer](/guides/css) — the standalone `.ori-combobox` classes for the parts.
