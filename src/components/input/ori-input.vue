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
            `ori-color_${color}`,
            `ori-font-size_${size}`,
            `ori-input_${variant}`,
            `ori-input_${size}`,
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
            :class="['ori-input__field', `ori-size-radius_${radius}`]"
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
