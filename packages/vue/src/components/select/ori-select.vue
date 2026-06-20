<script lang="ts" setup>
import { computed, useId } from 'vue';
import type { ActionSize, RadiusSize, ThemeColor } from '../../types';
import { useOriField } from '../field/context';

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
    required = false,
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

// When nested in an OriField, adopt its shared id + a11y wiring and let the field own the
// label / hint / error; standalone the control wires its own (behaviour unchanged).
const field = useOriField();
const inField = Boolean(field);

// SSR-safe ids (Vue 3.5): the label's `for`, plus describedby targets for the hint/error. Inside a
// field, the field's id + wiring win.
const uid = useId();
const fieldId = computed(() => field?.id.value ?? id ?? uid);
const hintId = computed(() => `${fieldId.value}-hint`);
const errorId = computed(() => `${fieldId.value}-error`);
const isInvalid = computed(() => (field ? field.invalid.value : invalid || Boolean(error)));
const isRequired = computed(() => required || (field?.required.value ?? false));
const isDisabled = computed(() => disabled || (field?.disabled.value ?? false));
const fieldSize = computed(() => field?.size.value ?? size);

// Describe by whichever helper is actually rendered (error replaces hint), plus any caller-supplied
// id — never reference an element that isn't in the DOM. Inside a field, the field supplies it.
const describedBy = computed(() => {
    if (field) return field.describedBy.value;
    const ids = [error ? errorId.value : hint ? hintId.value : '', describedby].filter(Boolean);
    return ids.length ? ids.join(' ') : undefined;
});
</script>

<template>
    <div
        :class="[
            'ori-select',
            `ori-color_${color}`,
            `ori-font-size_${fieldSize}`,
            `ori-select_${fieldSize}`,
            { 'ori-select_fluid': fluid || inField }
        ]"
    >
        <label v-if="label && !inField" :for="fieldId" class="ori-select__label">
            {{ label }}<span v-if="required" class="ori-select__required" aria-hidden="true">*</span>
        </label>

        <div class="ori-select__control-wrap">
            <select
                v-bind="$attrs"
                :id="fieldId"
                v-model="model"
                :class="['ori-select__control', `ori-size-radius_${radius}`]"
                :disabled="isDisabled"
                :required="isRequired"
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

        <p v-if="error && !inField" :id="errorId" class="ori-select__error" role="alert">{{ error }}</p>
        <p v-else-if="hint && !inField" :id="hintId" class="ori-select__hint">{{ hint }}</p>
    </div>
</template>
