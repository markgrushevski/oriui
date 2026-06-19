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
