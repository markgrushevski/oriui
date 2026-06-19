<script lang="ts" setup>
import { computed, useId } from 'vue';
import type { ActionSize, RadiusSize, ThemeColor } from '../../types';

interface SelectOption {
    label: string;
    value: string | number;
    disabled?: boolean;
}

// OriSelect — a native-first styled select: the real <select> owns the dropdown, keyboard and a11y;
// we only style the closed control and draw a decorative chevron. Mirrors the OriInput/OriTextarea
// form-control contract — a built-in label (label/for), hint, error (role=alert + aria-invalid +
// aria-describedby), and required asterisk — so a select is accessible without the caller wiring an
// external <label>. State lives on the native element (real `disabled`, `aria-invalid`) styled with
// attribute selectors. Options come from the `options` prop or a hand-written default slot. v-model
// holds the value; arbitrary native attrs (name, autocomplete, …) fall through to the <select> via
// inheritAttrs:false + v-bind="$attrs".
defineOptions({ inheritAttrs: false });

const {
    color = 'primary',
    describedby,
    disabled = false,
    error,
    hint,
    id,
    invalid = false,
    options = [],
    radius = 'md',
    size = 'md'
} = defineProps<{
    color?: ThemeColor;
    /** Extra element id(s) to append to aria-describedby (e.g. a shared form note). */
    describedby?: string;
    disabled?: boolean;
    /** Error message: rendered below the control (role=alert) and flips it to aria-invalid. */
    error?: string;
    fluid?: boolean;
    /** Helper text below the control; hidden while an error is shown. */
    hint?: string;
    id?: string;
    invalid?: boolean;
    label?: string;
    options?: SelectOption[];
    placeholder?: string;
    radius?: RadiusSize;
    required?: boolean;
    size?: ActionSize;
}>();

const model = defineModel<string | number>();

// SSR-safe ids (Vue 3.5): the label's `for`, plus describedby targets for the hint/error.
const uid = useId();
const fieldId = computed(() => id ?? uid);
const hintId = computed(() => `${fieldId.value}-hint`);
const errorId = computed(() => `${fieldId.value}-error`);
const isInvalid = computed(() => invalid || Boolean(error));

// Describe by whichever helper is actually rendered (error replaces hint), plus any caller-supplied
// id — never reference an element that isn't in the DOM.
const describedBy = computed(() => {
    const ids = [error ? errorId.value : hint ? hintId.value : '', describedby].filter(Boolean);
    return ids.length ? ids.join(' ') : undefined;
});
</script>

<template>
    <div
        :class="[
            'ori-select',
            `ori-color_${color}`,
            `ori-font-size_${size}`,
            `ori-select_${size}`,
            { 'ori-select_fluid': fluid }
        ]"
    >
        <label v-if="label" :for="fieldId" class="ori-select__label">
            {{ label }}<span v-if="required" class="ori-select__required" aria-hidden="true">*</span>
        </label>

        <div class="ori-select__control-wrap">
            <select
                v-bind="$attrs"
                :id="fieldId"
                v-model="model"
                :class="['ori-select__control', `ori-size-radius_${radius}`]"
                :disabled="disabled"
                :required="required"
                :aria-invalid="isInvalid ? 'true' : undefined"
                :aria-describedby="describedBy"
            >
                <option v-if="placeholder" value="" disabled>{{ placeholder }}</option>
                <slot>
                    <option v-for="opt in options" :key="opt.value" :value="opt.value" :disabled="opt.disabled">
                        {{ opt.label }}
                    </option>
                </slot>
            </select>

            <span class="ori-select__chevron" aria-hidden="true">
                <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path
                        d="M6 9l6 6 6-6"
                        fill="none"
                        stroke="currentcolor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                    />
                </svg>
            </span>
        </div>

        <p v-if="error" :id="errorId" class="ori-select__error" role="alert">{{ error }}</p>
        <p v-else-if="hint" :id="hintId" class="ori-select__hint">{{ hint }}</p>
    </div>
</template>
