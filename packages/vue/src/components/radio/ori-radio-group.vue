<script lang="ts" setup>
import { computed, useAttrs, useId } from 'vue'
import type { ActionSize, ThemeColor } from '../../types'
import { useOriField } from '../field/context'

/** One radio in `<OriRadioGroup>`'s `options` prop. */
export interface RadioOption {
    label: string
    value: string | number
    disabled?: boolean
}

// OriRadioGroup — a "choose one" control. A role="radiogroup" container names the set via
// aria-labelledby; each option is a real <input type="radio"> sharing one `name` (so the browser
// enforces single-select + native form submission), visually hidden over a styled circle. v-model
// holds the selected value. Unlabelled groups can pass aria-label, which falls through to the root.
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

// When nested in an OriField, the field owns the group's name + a11y wiring; standalone the group
// wires its own (behaviour unchanged). A radiogroup names itself via aria-labelledby, so it points at
// the field's label id rather than a `<label for>`.
const field = useOriField()
const inField = Boolean(field)

const uid = useId()
const groupName = computed(() => name ?? uid)
const ownLabelId = computed(() => `${uid}-label`)
const labelledBy = computed(() => (field ? field.labelId.value : label ? ownLabelId.value : undefined))
// A caller's aria-describedby joins the field's hint instead of replacing it. The template binds `$attrs`
// just before it, so every other attribute still goes to the caller, as plain fall-through would.
const attrs = useAttrs()
const describedBy = computed(() => {
    const ids = [field?.describedBy.value, attrs['aria-describedby'] as string | undefined].filter(Boolean)
    return ids.length ? ids.join(' ') : undefined
})
const isInvalid = computed(() => field?.invalid.value ?? false)
const isRequired = computed(() => required || (field?.required.value ?? false))
const isDisabled = computed(() => disabled || (field?.disabled.value ?? false))
const groupSize = computed(() => field?.size.value ?? size)
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
        :aria-labelledby="labelledBy"
        :aria-invalid="isInvalid ? 'true' : undefined"
        :aria-required="isRequired ? 'true' : undefined"
        v-bind="$attrs"
        :aria-describedby="describedBy"
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
