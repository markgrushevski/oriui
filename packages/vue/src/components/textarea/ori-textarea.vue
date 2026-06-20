<script lang="ts" setup>
import { computed, useId } from 'vue';
import type { ActionSize, RadiusSize, ThemeColor } from '../../types';
import { useOriField } from '../field/context';

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
    required = false,
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

// When nested in an OriField, adopt its shared id + a11y wiring and let the field own the
// label / hint / error; standalone the control wires its own (behaviour unchanged).
const field = useOriField();
const inField = Boolean(field);

// SSR-safe unique id (Vue 3.5) so the label's `for` always targets the field — even when the
// caller doesn't pass an explicit id. Inside a field, the field's id wins.
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
            'ori-textarea',
            `ori-color_${color}`,
            `ori-font-size_${fieldSize}`,
            `ori-textarea_${variant}`,
            `ori-textarea_${fieldSize}`,
            { 'ori-textarea_fluid': fluid || inField }
        ]"
    >
        <label v-if="label && !inField" :for="fieldId" class="ori-textarea__label">
            {{ label }}<span v-if="required" class="ori-textarea__required" aria-hidden="true">*</span>
        </label>

        <textarea
            v-bind="$attrs"
            :id="fieldId"
            v-model="model"
            :class="['ori-textarea__field', `ori-size-radius_${radius}`]"
            :rows="rows"
            :disabled="isDisabled"
            :required="isRequired"
            :placeholder="placeholder"
            :aria-invalid="isInvalid ? 'true' : undefined"
            :aria-describedby="describedBy"
        />

        <p v-if="error && !inField" :id="errorId" class="ori-textarea__error" role="alert">{{ error }}</p>
        <p v-else-if="hint && !inField" :id="hintId" class="ori-textarea__hint">{{ hint }}</p>
    </div>
</template>
