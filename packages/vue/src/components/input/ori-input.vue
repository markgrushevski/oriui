<script lang="ts" setup>
import type { ActionSize, RadiusSize, ThemeColor } from '../../types'
import { useFieldControl } from '../field/use-field-control'

// OriInput — the first form control: a labeled, tokenized text field with real a11y wiring
// (label/for, aria-invalid, aria-describedby tied to the hint/error) and v-model via defineModel.
// State lives on the native element (real `disabled`, `aria-invalid`) and is styled with attribute
// selectors, matching the rest of oriUI. Arbitrary native attributes (name, autocomplete, maxlength,
// inputmode, …) fall through to the underlying <input> via inheritAttrs:false + v-bind="$attrs".
defineOptions({ inheritAttrs: false })

const {
    color = 'primary',
    disabled = false,
    error,
    hint,
    id,
    invalid = false,
    radius = 'md',
    required = false,
    size = 'md',
    type = 'text',
    variant = 'outline'
} = defineProps<{
    color?: ThemeColor
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
    size?: ActionSize
    /** Native input type (text, email, password, search, tel, url, number, …). */
    type?: string
    variant?: 'solid' | 'outline'
}>()

const model = defineModel<string>()

// Inside an OriField the control takes the field's id and a11y wiring and the field renders the label,
// hint and error; standalone it wires its own.
const { inField, fieldId, hintId, errorId, describedBy, isInvalid, isRequired, isDisabled, fieldSize } =
    useFieldControl(() => ({ disabled, error, hint, id, invalid, required, size }))
</script>

<template>
    <div
        :class="[
            'ori-input',
            `ori-color_${color}`,
            `ori-font-size_${fieldSize}`,
            `ori-input_${variant}`,
            `ori-input_${fieldSize}`,
            { 'ori-input_fluid': fluid || inField }
        ]"
    >
        <label v-if="label && !inField" :for="fieldId" class="ori-input__label">
            {{ label }}<span v-if="required" class="ori-input__required" aria-hidden="true">*</span>
        </label>

        <input
            v-bind="$attrs"
            :id="fieldId"
            v-model="model"
            :class="['ori-input__field', `ori-size-radius_${radius}`]"
            :type="type"
            :disabled="isDisabled"
            :required="isRequired"
            :placeholder="placeholder"
            :aria-invalid="isInvalid ? 'true' : undefined"
            :aria-describedby="describedBy"
        />

        <p v-if="error && !inField" :id="errorId" class="ori-input__error" role="alert">{{ error }}</p>
        <p v-else-if="hint && !inField" :id="hintId" class="ori-input__hint">{{ hint }}</p>
    </div>
</template>
