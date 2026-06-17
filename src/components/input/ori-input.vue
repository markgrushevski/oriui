<script lang="ts" setup>
import { computed, useId } from 'vue';
import type { ActionSize, RadiusSize, ThemeColor } from '../../types';

// OriInput — the first form control: a labelled, tokenized text field with real a11y wiring
// (label/for, aria-invalid, aria-describedby tied to the hint/error) and v-model via defineModel.
// State lives on the native element (real `disabled`, `aria-invalid`) and is styled with attribute
// selectors, matching the rest of oriUI. Arbitrary native attributes (name, autocomplete, maxlength,
// inputmode, …) fall through to the underlying <input> via inheritAttrs:false + v-bind="$attrs".
defineOptions({ inheritAttrs: false });

const {
    color = 'primary',
    describedby,
    disabled = false,
    error,
    hint,
    id,
    invalid = false,
    radius = 'md',
    size = 'md',
    type = 'text',
    variant = 'outline'
} = defineProps<{
    color?: ThemeColor;
    /** Extra element id(s) to append to aria-describedby (e.g. a shared form note). */
    describedby?: string;
    disabled?: boolean;
    /** Error message: rendered below the field (role=alert) and flips the field to aria-invalid. */
    error?: string;
    fluid?: boolean;
    /** Helper text below the field; hidden while an error is shown. */
    hint?: string;
    id?: string;
    invalid?: boolean;
    label?: string;
    placeholder?: string;
    radius?: RadiusSize;
    required?: boolean;
    size?: ActionSize;
    /** Native input type (text, email, password, search, tel, url, number, …). */
    type?: string;
    variant?: 'fill' | 'outline';
}>();

const model = defineModel<string>();

// SSR-safe unique id (Vue 3.5) so the label's `for` always targets the field — even when the
// caller doesn't pass an explicit id.
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
            'ori-input',
            'ori-color',
            `ori-color_${color}`,
            'ori-font-size',
            `ori-font-size_${size}`,
            `ori-input_${variant}`,
            { 'ori-input_fluid': fluid }
        ]"
    >
        <label v-if="label" :for="fieldId" class="ori-input__label">
            {{ label }}<span v-if="required" class="ori-input__required" aria-hidden="true">*</span>
        </label>

        <input
            v-bind="$attrs"
            :id="fieldId"
            v-model="model"
            :class="[
                'ori-input__field',
                'ori-size-action',
                `ori-size-action_${size}`,
                'ori-size-radius',
                `ori-size-radius_${radius}`
            ]"
            :type="type"
            :disabled="disabled"
            :required="required"
            :placeholder="placeholder"
            :aria-invalid="isInvalid ? 'true' : undefined"
            :aria-describedby="describedBy"
        />

        <p v-if="error" :id="errorId" class="ori-input__error" role="alert">{{ error }}</p>
        <p v-else-if="hint" :id="hintId" class="ori-input__hint">{{ hint }}</p>
    </div>
</template>

<style>
.ori-input {
    --ori-input-border: color-mix(in srgb, currentcolor 28%, transparent);
    --ori-input-bg: transparent;

    display: inline-flex;
    flex-direction: column;
    gap: 0.375em;
}

.ori-input.ori-input_fluid {
    display: flex;
    width: 100%;
}

.ori-input.ori-input_fill {
    --ori-input-border: transparent;
    --ori-input-bg: color-mix(in srgb, currentcolor 6%, transparent);
}

.ori-input__label {
    font-size: calc(var(--ori-font-size) * 0.875);
    font-weight: 500;
    line-height: 1.2;
}

.ori-input__required {
    margin-inline-start: 0.15em;

    color: var(--ori-color-danger);
}

.ori-input__field {
    box-sizing: border-box;
    width: 100%;
    height: var(--ori-size-action);
    padding-inline: 0.75em;

    transition:
        border-color 0.15s ease-out,
        box-shadow 0.15s ease-out,
        background-color 0.15s ease-out;

    border: 1px solid var(--ori-input-border);
    border-radius: var(--ori-size-radius);

    background: var(--ori-input-bg);
    color: inherit;

    font-family: inherit;
    font-size: var(--ori-font-size);
    line-height: 1;
}

.ori-input__field::placeholder {
    color: color-mix(in srgb, currentcolor 50%, transparent);
}

.ori-input__field:focus {
    border-color: var(--ori-color);
    outline: none;

    box-shadow: 0 0 0 3px color-mix(in srgb, var(--ori-color) 25%, transparent);
}

.ori-input__field[aria-invalid='true'] {
    border-color: var(--ori-color-danger);
}

.ori-input__field[aria-invalid='true']:focus {
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--ori-color-danger) 25%, transparent);
}

.ori-input__field:disabled {
    opacity: 0.55;

    background: color-mix(in srgb, currentcolor 4%, transparent);

    cursor: not-allowed;
}

.ori-input__hint,
.ori-input__error {
    margin: 0;

    font-size: calc(var(--ori-font-size) * 0.8);
    line-height: 1.3;
}

.ori-input__hint {
    opacity: 0.7;
}

.ori-input__error {
    color: var(--ori-color-danger);
}
</style>
