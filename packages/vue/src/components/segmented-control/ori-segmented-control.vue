<script lang="ts" setup>
import { computed, useAttrs, useId } from 'vue'
import type { ActionSize, ThemeColor } from '../../types'
import { useOriField } from '../field/context'
import { OriIcon } from '../icon'

/** One segment of `<OriSegmentedControl>`'s `options` prop. */
export interface SegmentedOption {
    label: string
    value: string | number
    disabled?: boolean
    /** An SVG path drawn before the label (`OriIcon`). */
    icon?: string
}

// OriSegmentedControl — a compact "choose one" row (Light / Dark / Auto). Built like OriRadioGroup: a
// role="radiogroup" of real <input type="radio"> sharing one `name`, so arrow keys select, the group is
// one Tab stop, the value submits with a form and RTL works, all from the browser. Each input is hidden
// over its segment; the checked one is filled with the accent. v-model holds the selected value.
defineOptions({ inheritAttrs: false })

const {
    color = 'primary',
    disabled = false,
    fluid = false,
    label,
    name,
    options = [],
    required = false,
    size = 'md'
} = defineProps<{
    color?: ThemeColor
    disabled?: boolean
    /** Stretch to the container's width; segments stay equal. */
    fluid?: boolean
    /** Visible group label; without it, name the group with `aria-label`. */
    label?: string
    /** Shared radio `name`; auto-generated (useId) when omitted. */
    name?: string
    options?: SegmentedOption[]
    required?: boolean
    size?: ActionSize
}>()

const model = defineModel<string | number>()

// Inside an OriField the field owns the label and the a11y wiring, as for OriRadioGroup.
const field = useOriField()
const inField = Boolean(field)

const uid = useId()
const groupName = computed(() => name ?? uid)
const ownLabelId = computed(() => `${uid}-label`)
const labelledBy = computed(() => (field ? field.labelId.value : label ? ownLabelId.value : undefined))
// A caller's aria-describedby joins the field's hint instead of replacing it ($attrs is bound before it).
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
            'ori-segmented-control',
            `ori-color_${color}`,
            `ori-font-size_${groupSize}`,
            `ori-segmented-control_${groupSize}`,
            { 'ori-segmented-control_fluid': fluid || inField }
        ]"
        role="radiogroup"
        :aria-labelledby="labelledBy"
        :aria-invalid="isInvalid ? 'true' : undefined"
        :aria-required="isRequired ? 'true' : undefined"
        v-bind="$attrs"
        :aria-describedby="describedBy"
    >
        <div v-if="label && !inField" :id="ownLabelId" class="ori-segmented-control__label">{{ label }}</div>

        <div class="ori-segmented-control__track">
            <label v-for="opt in options" :key="opt.value" class="ori-segmented-control__item">
                <input
                    v-model="model"
                    class="ori-segmented-control__input"
                    type="radio"
                    :name="groupName"
                    :value="opt.value"
                    :disabled="isDisabled || opt.disabled"
                    :required="isRequired"
                />
                <OriIcon v-if="opt.icon" :icon="opt.icon" class="ori-segmented-control__icon" />
                <span class="ori-segmented-control__text">
                    <slot name="option" :option="opt">{{ opt.label }}</slot>
                </span>
            </label>
        </div>
    </div>
</template>
