---
title: Combobox
---

# Combobox

A filterable single-select listbox — type to filter, navigate with the keyboard, pick one. It is the
first component driven end-to-end by **`@oriui/headless`**: the state machine + prop-getters own the
behaviour (open/close, filtering, the active-descendant highlight, selection, and the full
WAI-ARIA keyboard), and `OriCombobox` renders the styled shell on top. Unlike the pure-CSS
components, the behaviour needs JavaScript — the standalone classes give you the look, and
[`useCombobox`](#headless-usecombobox) gives you the behaviour for any UI.

State is expressed on real elements: `role="combobox"` with `aria-expanded` / `aria-controls` /
`aria-activedescendant` on the input, `role="listbox"` + `role="option"` + `aria-selected` on the
popup. `v-model` holds the selected option's `value`.

## Classes

The block is a labelled control wrapping a positioned listbox popup. The input reuses
[`.ori-input__field`](/components/input) for its box, so the field look stays in one place.

<!-- prettier-ignore -->
:class-table{:rows='[{"class":"ori-combobox","type":"Block","description":"Required base class (wrapper div)."},{"class":"ori-combobox_* (size)","type":"Size","description":"xs · sm · <b>md</b> · lg · xl · xxl field height."},{"class":"ori-color_*","type":"Color","description":"<b>primary</b> · … (focus ring + highlight + selected accent)."},{"class":"ori-combobox__control · __input · __trigger · __clear · __listbox · __option · __empty","type":"Part","description":"control wrap / input / chevron / clear / popup / option / no-results."},{"class":"ori-combobox__label · __required · __hint · __error","type":"Part","description":"label / required-asterisk / helper / error."},{"class":"ori-combobox_fluid","type":"Layout","description":"full-width (stretches wrapper to 100 %)."},{"class":"role=combobox · aria-expanded · aria-activedescendant · aria-selected · data-highlighted","type":"State","description":"real ARIA + data attributes, not classes."}]'}

## Basic

Pass `options` (`{ label, value, disabled? }[]`) and bind `v-model`. Type to filter; the list opens
as you type.

::example
:ori-combobox{:options='[{"label":"Apple","value":"apple"},{"label":"Banana","value":"banana"},{"label":"Cherry","value":"cherry"},{"label":"Grape","value":"grape"},{"label":"Mango","value":"mango"}]' label="Fruit" placeholder="Search a fruit…" hint="Type to filter."}

#vue

```vue
<script setup>
import { ref } from 'vue';
const fruit = ref(null);
const options = [
    { label: 'Apple', value: 'apple' },
    { label: 'Banana', value: 'banana' },
    { label: 'Cherry', value: 'cherry' },
    { label: 'Grape', value: 'grape' },
    { label: 'Mango', value: 'mango' }
];
</script>

<template>
    <OriCombobox
        v-model="fruit"
        :options="options"
        label="Fruit"
        placeholder="Search a fruit…"
        hint="Type to filter."
    />
</template>
```

#svelte

```svelte
<script>
    import { useCombobox } from '@oriui/headless/svelte';

    // The full state machine + WAI-ARIA listbox keyboard — the same engine as Vue, as Svelte stores.
    // (No styled Svelte component yet: compose @oriui/headless/svelte with the .ori-* classes.)
    const { items, rootProps, labelProps, controlProps, inputProps, listboxProps, getOptionProps, getOptionState } =
        useCombobox({
            id: 'fruit',
            options: [
                { label: 'Apple', value: 'apple' },
                { label: 'Banana', value: 'banana' },
                { label: 'Cherry', value: 'cherry' },
                { label: 'Grape', value: 'grape' },
                { label: 'Mango', value: 'mango' }
            ]
        });
</script>

<div {...$rootProps} class="ori-combobox ori-color_primary ori-font-size_md">
    <label {...$labelProps} class="ori-combobox__label">Fruit</label>
    <div {...$controlProps} class="ori-combobox__control">
        <input {...$inputProps} class="ori-input__field ori-combobox__input ori-size-radius_md" placeholder="Search a fruit…" />
        <ul {...$listboxProps} class="ori-combobox__listbox ori-anchored ori-anchored_bottom-start">
            {#each $items as item, i}
                <li
                    {...$getOptionProps(item, i)}
                    class="ori-combobox__option"
                    class:ori-combobox__option_selected={$getOptionState(item).selected}
                >
                    {item.label}
                </li>
            {/each}
        </ul>
    </div>
</div>
```

::

## Clearable

`clearable` shows a clear button while there is a selection.

::example
:ori-combobox{:options='[{"label":"Apple","value":"apple"},{"label":"Banana","value":"banana"},{"label":"Grape","value":"grape"}]' label="Fruit" :clearable="true" placeholder="Pick one"}

#vue

```vue
<OriCombobox v-model="fruit" :options="options" label="Fruit" clearable placeholder="Pick one" />
```

::

## Sizes

`xs` → `xxl`, like the other field controls.

::example
:ori-combobox{:options='[{"label":"Apple","value":"apple"},{"label":"Banana","value":"banana"}]' label="Small" size="sm" placeholder="sm"}
:ori-combobox{:options='[{"label":"Apple","value":"apple"},{"label":"Banana","value":"banana"}]' label="Large" size="lg" placeholder="lg"}

#vue

```vue
<OriCombobox v-model="a" :options="options" label="Small" size="sm" />
<OriCombobox v-model="b" :options="options" label="Large" size="lg" />
```

::

## States

`disabled` blocks the control; `error` renders a `role="alert"` message and flips `aria-invalid`;
`required` adds the asterisk and the native attribute. A disabled option is skipped during keyboard
navigation and can't be selected.

::example
:ori-combobox{:options='[{"label":"Apple","value":"apple"},{"label":"Banana","value":"banana"}]' label="Disabled" :disabled="true" placeholder="Cannot edit"}
:ori-combobox{:options='[{"label":"Apple","value":"apple"},{"label":"Banana","value":"banana"}]' label="With error" error="Please choose a fruit." placeholder="Required"}

#vue

```vue
<OriCombobox v-model="a" :options="options" label="Disabled" disabled />
<OriCombobox v-model="b" :options="options" label="With error" error="Please choose a fruit." required />
```

::

## Headless (`useCombobox`)

The behaviour ships separately in `@oriui/headless`, so you can build a fully custom combobox UI on
the same state machine + ARIA contract. `useCombobox` returns ready-to-`v-bind` prop bags and the
visible (filtered) items.

```vue
<script setup>
import { useCombobox } from '@oriui/headless/vue';

const { items, inputProps, listboxProps, getOptionProps, getOptionState } = useCombobox(() => ({
    options: [
        { label: 'Apple', value: 'apple' },
        { label: 'Banana', value: 'banana' }
    ]
}));
</script>

<template>
    <div>
        <input v-bind="inputProps" />
        <ul v-bind="listboxProps">
            <li
                v-for="(item, i) in items"
                :key="item.value"
                v-bind="getOptionProps(item, i)"
                :data-selected="getOptionState(item).selected"
            >
                {{ item.label }}
            </li>
        </ul>
    </div>
</template>
```

The same behaviour in Svelte 5 via `@oriui/headless/svelte` — the composable returns stores (auto-subscribe
with `$`), and the item prop-getters are a store of a function (`$getOptionProps(item, i)`):

```svelte
<script>
    import { useCombobox } from '@oriui/headless/svelte';

    const { items, inputProps, listboxProps, getOptionProps, getOptionState } = useCombobox({
        options: [
            { label: 'Apple', value: 'apple' },
            { label: 'Banana', value: 'banana' }
        ]
    });
</script>

<div>
    <input {...$inputProps} />
    <ul {...$listboxProps}>
        {#each $items as item, i}
            <li {...$getOptionProps(item, i)} data-selected={$getOptionState(item).selected}>
                {item.label}
            </li>
        {/each}
    </ul>
</div>
```

Options are a `MaybeReactive` — pass a Svelte store instead of a plain object to react to a changing
option list or `disabled`.

Pass a `filter` (`(item, query) => boolean`) to override the default case-insensitive substring
match — for fuzzy matching, async results, or server-side filtering.

## Accessibility

Implements the WAI-ARIA **combobox with listbox popup** pattern.

- The input is `role="combobox"` with `aria-autocomplete="list"`, `aria-expanded`, and
  `aria-controls` pointing at the listbox; the highlighted option is referenced by
  `aria-activedescendant` (focus stays on the input — no roving tabindex needed).
- Options are `role="option"` with `aria-selected`; the popup is `role="listbox"` labelled by the
  field label. A disabled option carries `aria-disabled` and is skipped by navigation.
- `hint` / `error` are wired through `aria-describedby` (error supersedes hint); `error` also sets
  `aria-invalid="true"` and `role="alert"`. `required` sets the native attribute.
- The list dismisses on blur and on `Escape`; selecting an option returns focus context to the input.

| Key            | Action                                        |
| -------------- | --------------------------------------------- |
| `↓` / `↑`      | Open the list and move the highlight (wraps). |
| `Home` / `End` | Highlight the first / last option.            |
| `Enter`        | Select the highlighted option.                |
| `Escape`       | Close the list.                               |
| `Tab`          | Move focus away (closes the list).            |
| Type           | Filter the options.                           |

## Framework API

### Props

| Prop            | Type                       | Default        | Description                                                 |
| --------------- | -------------------------- | -------------- | ----------------------------------------------------------- |
| `clearable`     | `boolean`                  | `false`        | Show a clear button while there is a selection.             |
| `color`         | `ThemeColor`               | `'primary'`    | Accent for the focus ring, highlight, and selected option.  |
| `describedby`   | `string`                   | —              | Extra id(s) appended to `aria-describedby`.                 |
| `disabled`      | `boolean`                  | `false`        | Disable the control.                                        |
| `error`         | `string`                   | —              | Error message (`role="alert"`); sets `aria-invalid="true"`. |
| `filter`        | `(item, query) => boolean` | substring      | Override the default case-insensitive label filter.         |
| `fluid`         | `boolean`                  | `false`        | Full-width.                                                 |
| `hint`          | `string`                   | —              | Helper text; hidden while `error` is shown.                 |
| `id`            | `string`                   | —              | Explicit base id; auto-generated via `useId` when omitted.  |
| `invalid`       | `boolean`                  | `false`        | Set `aria-invalid` without a message.                       |
| `label`         | `string`                   | —              | Visible label, wired to the input via `for` / `id`.         |
| `noResultsText` | `string`                   | `'No results'` | Shown when the filter matches nothing.                      |
| `options`       | `ComboboxItem[]`           | **required**   | `{ label, value, disabled? }[]`.                            |
| `placeholder`   | `string`                   | —              | Native placeholder.                                         |
| `radius`        | `RadiusSize`               | `'md'`         | Field + popup corner radius.                                |
| `required`      | `boolean`                  | `false`        | Asterisk + native `required`.                               |
| `size`          | `ActionSize`               | `'md'`         | Field height + text scale.                                  |

### v-model

`v-model` binds the selected option's `value` (`string | null`) via `defineModel`. Selecting an
option emits `update:modelValue`; clearing emits `null`.

### Slots

| Slot     | Scope                       | Description                                                                                                                           |
| -------- | --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `option` | `{ item, index, selected }` | Per-option content — rich options such as an avatar + email or a leading icon. Rendered for every option. Falls back to `item.label`. |
| `empty`  | none                        | No-results content, shown when the filter matches nothing. Falls back to the `noResultsText` prop.                                    |
