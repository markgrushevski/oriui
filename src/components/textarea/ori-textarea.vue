<script lang="ts" setup>
import { computed, useId } from 'vue';
import type { ActionSize, RadiusSize, ThemeColor } from '../../types';

// OriTextarea — the multiline sibling of OriInput: a labelled, tokenized text field with real a11y
// wiring (label/for, aria-invalid, aria-describedby tied to the hint/error) and v-model via
// defineModel. State lives on the native element (real `disabled`, `aria-invalid`) and is styled with
// attribute selectors, matching the rest of oriUI. Arbitrary native attributes (name, maxlength,
// autocomplete, wrap, …) fall through to the underlying <textarea> via inheritAttrs:false +
// v-bind="$attrs". Unlike OriInput the field has no fixed height — it grows from a `rows`-based
// min-height and stays user-resizable (resize: vertical).
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
    rows = 3,
    size = 'md',
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
    /** Visible rows of text — sets the field's min-height; it still grows and is resizable. */
    rows?: number;
    size?: ActionSize;
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
            'ori-textarea',
            'ori-color',
            `ori-color_${color}`,
            'ori-font-size',
            `ori-font-size_${size}`,
            `ori-textarea_${variant}`,
            { 'ori-textarea_fluid': fluid }
        ]"
    >
        <label v-if="label" :for="fieldId" class="ori-textarea__label">
            {{ label }}<span v-if="required" class="ori-textarea__required" aria-hidden="true">*</span>
        </label>

        <textarea
            v-bind="$attrs"
            :id="fieldId"
            v-model="model"
            :class="[
                'ori-textarea__field',
                'ori-size-action',
                `ori-size-action_${size}`,
                'ori-size-radius',
                `ori-size-radius_${radius}`
            ]"
            :rows="rows"
            :disabled="disabled"
            :required="required"
            :placeholder="placeholder"
            :aria-invalid="isInvalid ? 'true' : undefined"
            :aria-describedby="describedBy"
        />

        <p v-if="error" :id="errorId" class="ori-textarea__error" role="alert">{{ error }}</p>
        <p v-else-if="hint" :id="hintId" class="ori-textarea__hint">{{ hint }}</p>
    </div>
</template>

<style>
.ori-textarea {
    --ori-textarea-border: color-mix(in srgb, currentcolor 28%, transparent);
    --ori-textarea-bg: transparent;

    display: inline-flex;
    flex-direction: column;
    gap: 0.375em;
}

.ori-textarea.ori-textarea_fluid {
    display: flex;
    width: 100%;
}

.ori-textarea.ori-textarea_fill {
    --ori-textarea-border: transparent;
    --ori-textarea-bg: color-mix(in srgb, currentcolor 6%, transparent);
}

.ori-textarea__label {
    font-size: calc(var(--ori-font-size) * 0.875);
    font-weight: 500;
    line-height: 1.2;
}

.ori-textarea__required {
    margin-inline-start: 0.15em;

    color: var(--ori-color-danger);
}

.ori-textarea__field {
    box-sizing: border-box;
    width: 100%;
    min-height: var(--ori-size-action);
    padding-block: 0.5em;
    padding-inline: 0.75em;

    transition:
        border-color 0.15s ease-out,
        box-shadow 0.15s ease-out,
        background-color 0.15s ease-out;

    border: 1px solid var(--ori-textarea-border);
    border-radius: var(--ori-size-radius);

    background: var(--ori-textarea-bg);
    color: inherit;

    font-family: inherit;
    font-size: var(--ori-font-size);
    line-height: 1.5;

    resize: vertical;
}

.ori-textarea__field::placeholder {
    color: color-mix(in srgb, currentcolor 50%, transparent);
}

.ori-textarea__field:focus {
    border-color: var(--ori-color);
    outline: none;

    box-shadow: 0 0 0 3px color-mix(in srgb, var(--ori-color) 25%, transparent);
}

.ori-textarea__field[aria-invalid='true'] {
    border-color: var(--ori-color-danger);
}

.ori-textarea__field[aria-invalid='true']:focus {
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--ori-color-danger) 25%, transparent);
}

.ori-textarea__field:disabled {
    opacity: 0.55;

    background: color-mix(in srgb, currentcolor 4%, transparent);

    resize: none;
    cursor: not-allowed;
}

.ori-textarea__hint,
.ori-textarea__error {
    margin: 0;

    font-size: calc(var(--ori-font-size) * 0.8);
    line-height: 1.3;
}

.ori-textarea__hint {
    opacity: 0.7;
}

.ori-textarea__error {
    color: var(--ori-color-danger);
}
</style>
