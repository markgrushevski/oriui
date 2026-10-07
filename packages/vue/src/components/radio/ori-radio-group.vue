<script lang="ts" setup>
import type { ActionSize, ThemeColor } from '../../types'
import { useFieldGroup } from '../field/use-field-control'
import { useKeyboardModality } from '../../internal/keyboard-modality'

/** One radio in `<OriRadioGroup>`'s `options` prop. */
export interface RadioOption {
    label: string
    value: string | number
    disabled?: boolean
}

// OriRadioGroup — a "choose one" control. A role="radiogroup" container names the set via
// aria-labelledby; each option is a real <input type="radio"> sharing one `name` (so the browser
// enforces single-select + native form submission), visually hidden over a styled circle. v-model
// holds the selected value. Unlabeled groups can pass aria-label, which falls through to the root.
defineOptions({ inheritAttrs: false })

const {
    color = 'primary',
    disabled = false,
    label,
    name,
    options = [],
    required = false,
    size = 'md'
} = defineProps<{
    color?: ThemeColor
    disabled?: boolean
    inline?: boolean
    label?: string
    /** Shared radio `name`; auto-generated (useId) when omitted. */
    name?: string
    options?: RadioOption[]
    required?: boolean
    size?: ActionSize
}>()

const model = defineModel<string | number>()

// A radiogroup names itself via aria-labelledby, so inside an OriField it points at the field's label id
// rather than a `<label for>`; standalone it wires its own.
const { inField, groupName, ownLabelId, labelledBy, describedBy, isInvalid, isRequired, isDisabled, groupSize } =
    useFieldGroup(() => ({ disabled, label, name, required, size }))

const { keyboard, onKeydown, onPointerdown } = useKeyboardModality()
</script>

<template>
    <div
        :class="[
            'ori-radio-group',
            `ori-color_${color}`,
            `ori-font-size_${groupSize}`,
            { 'ori-radio-group_inline': inline }
        ]"
        role="radiogroup"
        :data-ori-keyboard="keyboard ? '' : undefined"
        :aria-labelledby="labelledBy"
        :aria-invalid="isInvalid ? 'true' : undefined"
        :aria-required="isRequired ? 'true' : undefined"
        v-bind="$attrs"
        :aria-describedby="describedBy"
        @keydown="onKeydown"
        @pointerdown="onPointerdown"
    >
        <div v-if="label && !inField" :id="ownLabelId" class="ori-radio-group__label">{{ label }}</div>

        <div class="ori-radio-group__options">
            <label
                v-for="opt in options"
                :key="opt.value"
                :class="['ori-radio', { 'ori-radio_disabled': isDisabled || opt.disabled }]"
            >
                <input
                    v-model="model"
                    class="ori-radio__input"
                    type="radio"
                    :name="groupName"
                    :value="opt.value"
                    :disabled="isDisabled || opt.disabled"
                    :required="isRequired"
                />
                <span class="ori-radio__circle" aria-hidden="true"></span>
                <span class="ori-radio__label"
                    ><slot name="option" :option="opt">{{ opt.label }}</slot></span
                >
            </label>
        </div>
    </div>
</template>
