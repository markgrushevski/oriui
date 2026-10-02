<script lang="ts" setup>
import type { ActionSize, RadiusSize, ThemeColor } from '../../types'
import { useFieldControl } from '../field/use-field-control'

// OriTextarea — the multiline sibling of OriInput: a labeled, tokenized text field with real a11y
// wiring (label/for, aria-invalid, aria-describedby tied to the hint/error) and v-model via
// defineModel. State lives on the native element (real `disabled`, `aria-invalid`) and is styled with
// attribute selectors, matching the rest of oriUI. Arbitrary native attributes (name, maxlength,
// autocomplete, wrap, …) fall through to the underlying <textarea> via inheritAttrs:false +
// v-bind="$attrs". Unlike OriInput the field has no fixed height — it grows from a `rows`-based
// min-height and stays user-resizable (resize: vertical).
defineOptions({ inheritAttrs: false })

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
    color?: ThemeColor
    /** Extra element id(s) to append to aria-describedby (e.g. a shared form note). */
    describedby?: string
    disabled?: boolean
    /** Error message: rendered below the field (role=alert) and flips the field to aria-invalid. */
    error?: string
    fluid?: boolean
    /** Helper text below the field; hidden while an error is shown. */
    hint?: string
    id?: string
    invalid?: boolean
    label?: string
    placeholder?: string
    radius?: RadiusSize
    required?: boolean
    /** Visible rows of text — sets the field's min-height; it still grows and is resizable. */
    rows?: number
    size?: ActionSize
    variant?: 'solid' | 'outline'
}>()

const model = defineModel<string>()

// Inside an OriField the control takes the field's id and a11y wiring and the field renders the label,
// hint and error; standalone it wires its own.
const { inField, fieldId, hintId, errorId, describedBy, isInvalid, isRequired, isDisabled, fieldSize } =
    useFieldControl(() => ({ describedby, disabled, error, hint, id, invalid, required, size }))
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
