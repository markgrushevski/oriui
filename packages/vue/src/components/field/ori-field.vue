<script lang="ts" setup>
import { computed, provide, useId, useSlots } from 'vue';
import type { ActionSize } from '../../types';
import { oriFieldKey } from './context';

// OriField — the shared form-field shell: one source of truth for the label / hint / error / required
// a11y contract the text controls (OriInput, OriSelect, OriTextarea) otherwise each wire by hand. It
// renders the `<label>` (with the required asterisk), the slotted control, and the hint/error line,
// and provides a context so an Ori control nested inside adopts the field's id, aria-describedby,
// aria-invalid, required, disabled and size — and suppresses its own label/hint/error. Any non-Ori
// control (a raw `<input>`, htmx markup) wires up via the scoped-slot `controlAttrs` instead.

const {
    describedby,
    disabled = false,
    error,
    fluid,
    hint,
    id,
    invalid = false,
    label,
    required = false,
    size = 'md'
} = defineProps<{
    /** Extra element id(s) to append to aria-describedby (e.g. a shared form note). */
    describedby?: string;
    disabled?: boolean;
    /** Error message: rendered below the control (role=alert) and flips the field to aria-invalid. */
    error?: string;
    fluid?: boolean;
    /** Helper text below the control; hidden while an error is shown. */
    hint?: string;
    id?: string;
    invalid?: boolean;
    label?: string;
    required?: boolean;
    size?: ActionSize;
}>();

// SSR-safe shared id (Vue 3.5) so the label's `for` always targets the control — even without an
// explicit id.
const uid = useId();
const fieldId = computed(() => id ?? uid);
const labelId = computed(() => `${fieldId.value}-label`);
const hintId = computed(() => `${fieldId.value}-hint`);
const errorId = computed(() => `${fieldId.value}-error`);
// error / hint can come from a prop OR a slot; the a11y wiring must track whichever actually renders
// a `<p>` (the template renders error/hint on `prop || $slots.<name>`), else aria-describedby dangles.
const slots = useSlots();
const hasError = computed(() => Boolean(error) || Boolean(slots.error));
const hasHint = computed(() => Boolean(hint) || Boolean(slots.hint));
const isInvalid = computed(() => invalid || hasError.value);

// Describe by whichever helper is actually rendered (error replaces hint), plus any caller-supplied
// id — never reference an element that isn't in the DOM.
const describedBy = computed(() => {
    const ids = [hasError.value ? errorId.value : hasHint.value ? hintId.value : '', describedby].filter(Boolean);
    return ids.length ? ids.join(' ') : undefined;
});

// Hand the contract to a nested Ori control.
provide(oriFieldKey, {
    id: fieldId,
    labelId,
    describedBy,
    invalid: isInvalid,
    required: computed(() => required),
    disabled: computed(() => disabled),
    size: computed(() => size)
});

// Ready-to-spread attributes for a raw control via the scoped slot (the css-layer / htmx path).
const controlAttrs = computed(() => ({
    id: fieldId.value,
    'aria-describedby': describedBy.value,
    'aria-invalid': isInvalid.value ? 'true' : undefined,
    disabled: disabled || undefined,
    required: required || undefined
}));
const slotProps = computed(() => ({
    id: fieldId.value,
    invalid: isInvalid.value,
    describedby: describedBy.value,
    controlAttrs: controlAttrs.value
}));
</script>

<template>
    <div :class="['ori-field', `ori-font-size_${size}`, { 'ori-field_fluid': fluid }]">
        <label v-if="label || $slots.label" :id="labelId" :for="fieldId" class="ori-field__label">
            <slot name="label">{{ label }}</slot
            ><span v-if="required" class="ori-field__required" aria-hidden="true">*</span>
        </label>

        <slot v-bind="slotProps" />

        <p v-if="error || $slots.error" :id="errorId" class="ori-field__error" role="alert">
            <slot name="error">{{ error }}</slot>
        </p>
        <p v-else-if="hint || $slots.hint" :id="hintId" class="ori-field__hint">
            <slot name="hint">{{ hint }}</slot>
        </p>
    </div>
</template>
