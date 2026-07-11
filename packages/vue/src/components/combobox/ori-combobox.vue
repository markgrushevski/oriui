<script lang="ts" setup>
import { computed, mergeProps, ref, useId, watch, watchEffect } from 'vue';
import { useCombobox, type ComboboxItem } from '@oriui/headless/vue';
import type { ActionSize, RadiusSize, ThemeColor } from '../../types';

// OriCombobox — a filterable single-select listbox, and the first styled component driven by the
// @oriui/headless core (state machine + prop-getters + WAI-ARIA listbox keyboard). The composable
// owns behaviour (open/close, filter, highlight, selection, Arrow/Home/End/Enter/Escape); this SFC
// renders the styled shell and layers the form contract (label/hint/error/required + aria) on top of
// the headless prop bags. State lives on real elements/attributes (role=combobox, aria-expanded,
// aria-activedescendant, aria-selected) so it stays a11y-correct and zero-runtime to theme. Arbitrary
// native attributes (autocomplete, …) fall through to the visible <input> via inheritAttrs:false +
// $attrs; `name` is a real prop instead, so the form submits the selected VALUE through a hidden input
// (the visible input only carries the label text) — see the hidden <input> below.
defineOptions({ inheritAttrs: false });

const {
    clearable = false,
    color = 'primary',
    describedby,
    disabled = false,
    error,
    filter,
    hint,
    id,
    invalid = false,
    label,
    noResultsText = 'No results',
    options,
    placeholder,
    radius = 'md',
    required = false,
    size = 'md'
} = defineProps<{
    /** Show a clear button while there is a selection. */
    clearable?: boolean;
    color?: ThemeColor;
    /** Extra element id(s) to append to aria-describedby (e.g. a shared form note). */
    describedby?: string;
    disabled?: boolean;
    /** Error message: rendered below the control (role=alert) and flips it to aria-invalid. */
    error?: string;
    /** Filter predicate; default = case-insensitive substring on the label. */
    filter?: (item: ComboboxItem, query: string) => boolean;
    fluid?: boolean;
    /** Associate the submitted value's hidden input with a form by id (when not a descendant of it). */
    form?: string;
    /** Helper text below the control; hidden while an error is shown. */
    hint?: string;
    id?: string;
    invalid?: boolean;
    label?: string;
    /** Submit the selected value under this field name via a hidden input; the visible input is text-only. */
    name?: string;
    /** Text shown when the filter matches nothing. */
    noResultsText?: string;
    options: ComboboxItem[];
    placeholder?: string;
    radius?: RadiusSize;
    required?: boolean;
    size?: ActionSize;
}>();

const model = defineModel<string | null>();

// Per-instance anchor-name tethers the fixed listbox to the control (CSS Anchor Positioning + flip).
const anchorName = `--ori-combobox-${useId()}`;

const {
    open,
    value: selectedValue,
    items,
    rootProps,
    labelProps,
    controlProps,
    inputProps,
    triggerProps,
    clearTriggerProps,
    listboxProps,
    getOptionProps,
    getOptionState,
    setOpen,
    select,
    clear
} = useCombobox(() => ({
    id,
    options,
    value: model.value ?? null,
    inputValue: model.value != null ? (options.find((o) => o.value === model.value)?.label ?? '') : '',
    disabled,
    filter
}));

// Two-way sync between v-model and the machine selection (equality-guarded so the watchers settle).
watch(selectedValue, (next) => {
    if (next !== model.value) model.value = next;
});
watch(
    () => model.value,
    (next) => {
        if (next === selectedValue.value) return;
        const item = next != null ? options.find((o) => o.value === next) : undefined;
        if (item) select(item);
        else clear();
    }
);

// hint / error live in this SFC (the machine doesn't know about validation); wire aria-describedby +
// aria-invalid onto the headless input, and label the listbox only when a visible label exists.
const inputId = computed(() => inputProps.value.id as string);
const labelId = computed(() => labelProps.value.id as string);
const hintId = computed(() => `${inputId.value}-hint`);
const errorId = computed(() => `${inputId.value}-error`);
const isInvalid = computed(() => invalid || Boolean(error));
const describedBy = computed(() => {
    const ids = [error ? errorId.value : hint ? hintId.value : '', describedby].filter(Boolean);
    return ids.length ? ids.join(' ') : undefined;
});

// `required` must guard the SELECTION, not the visible input's label text. Typing a non-matching query
// never commits a value, so a native `required` on the text field would report VALID while the form
// submits an empty value (and, conversely, a bound value absent from `options` clears the text and would
// wrongly BLOCK a form that does hold a value). A `type=hidden` input can't participate in constraint
// validation, so mirror the rule onto the visible input via setCustomValidity — invalid iff required and
// nothing is selected, regardless of the typed text.
const inputEl = ref<HTMLInputElement>();
watchEffect(() => {
    inputEl.value?.setCustomValidity(required && !selectedValue.value ? 'Please select an option.' : '');
});

// Keyboard clear path (WCAG 2.1.1): the clear button is a pointer affordance (tabindex -1), so give
// keyboard users an equivalent — Escape clears the committed selection when the listbox is already
// closed (while open, the headless handler uses Escape to close). Only active while `clearable`.
const onInputKeydown = (event: KeyboardEvent) => {
    if (event.key === 'Escape' && clearable && !open.value && selectedValue.value) {
        event.preventDefault();
        clear();
    }
};
</script>

<template>
    <div
        v-bind="rootProps"
        :class="[
            'ori-combobox',
            `ori-color_${color}`,
            `ori-font-size_${size}`,
            `ori-combobox_${size}`,
            { 'ori-combobox_fluid': fluid }
        ]"
    >
        <label v-if="label || $slots.label" v-bind="labelProps" class="ori-combobox__label">
            <slot name="label">{{ label }}</slot
            ><span v-if="required" class="ori-combobox__required" aria-hidden="true">*</span>
        </label>

        <div v-bind="controlProps" class="ori-combobox__control" :style="{ anchorName }">
            <input
                ref="inputEl"
                v-bind="mergeProps($attrs, { onKeydown: onInputKeydown }, inputProps)"
                :class="['ori-input__field', 'ori-combobox__input', `ori-size-radius_${radius}`]"
                :placeholder="placeholder"
                :form="form"
                :aria-required="required || undefined"
                :aria-invalid="isInvalid ? 'true' : undefined"
                :aria-describedby="describedBy"
                @blur="setOpen(false)"
            />

            <button
                v-if="clearable && selectedValue"
                v-bind="clearTriggerProps"
                class="ori-combobox__clear"
                @mousedown.prevent
            >
                <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <path
                        d="M6 6l12 12M18 6L6 18"
                        fill="none"
                        stroke="currentcolor"
                        stroke-width="2"
                        stroke-linecap="round"
                    />
                </svg>
            </button>

            <button v-bind="triggerProps" class="ori-combobox__trigger" @mousedown.prevent>
                <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <path
                        d="M6 9l6 6 6-6"
                        fill="none"
                        stroke="currentcolor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                    />
                </svg>
            </button>

            <ul
                v-bind="listboxProps"
                :class="['ori-combobox__listbox', 'ori-anchored', 'ori-anchored_bottom-start']"
                :style="{ '--ori-anchor': anchorName }"
                :aria-labelledby="label || $slots.label ? labelId : undefined"
            >
                <li
                    v-for="(item, index) in items"
                    :key="item.value"
                    v-bind="getOptionProps(item, index)"
                    :class="[
                        'ori-combobox__option',
                        { 'ori-combobox__option_selected': getOptionState(item).selected }
                    ]"
                    @mousedown.prevent
                >
                    <slot name="option" :item="item" :index="index" :selected="getOptionState(item).selected">{{
                        item.label
                    }}</slot>
                </li>
                <li v-if="items.length === 0" class="ori-combobox__empty">
                    <slot name="empty">{{ noResultsText }}</slot>
                </li>
            </ul>

            <!-- Form submission carries the selected VALUE (the visible input shows the label). Disabled
                 excludes it from FormData, matching a native disabled control. -->
            <input
                v-if="name"
                type="hidden"
                :name="name"
                :form="form"
                :value="selectedValue ?? ''"
                :disabled="disabled || undefined"
            />
        </div>

        <p v-if="error" :id="errorId" class="ori-combobox__error" role="alert">{{ error }}</p>
        <p v-else-if="hint" :id="hintId" class="ori-combobox__hint">{{ hint }}</p>
    </div>
</template>
