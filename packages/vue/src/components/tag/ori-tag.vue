<script lang="ts" setup>
import type { ActionSize, RadiusSize, ThemeColor, Variant } from '../../types'
import { CLOSE_ICON } from '../../internal/icons'
import { OriIcon } from '../icon'

const {
    closeLabel = 'Remove',
    color = 'primary',
    radius = 'full',
    size = 'sm',
    variant = 'soft'
} = defineProps<{
    appendIcon?: string
    closable?: boolean
    closeLabel?: string
    color?: ThemeColor
    disabled?: boolean
    label?: string
    prependIcon?: string
    radius?: RadiusSize
    size?: ActionSize
    variant?: Variant
}>()

const emit = defineEmits<{ close: [] }>()
</script>

<template>
    <span
        :class="[
            'ori-tag',
            {
                [`ori-size-radius_${radius}`]: radius,
                [`ori-font-size_${size}`]: size,
                [`ori-variant_${variant}`]: variant,
                [`ori-color_${color}`]: color
            }
        ]"
        :aria-disabled="disabled ? 'true' : undefined"
    >
        <slot name="prepend">
            <ori-icon v-if="prependIcon" :icon="prependIcon" class="ori-tag__icon" />
        </slot>

        <span class="ori-tag__text">
            <slot>{{ label }}</slot>
        </span>

        <slot name="append">
            <ori-icon v-if="appendIcon" :icon="appendIcon" class="ori-tag__icon" />
        </slot>

        <button
            v-if="closable"
            type="button"
            class="ori-tag__close"
            :aria-label="closeLabel"
            :disabled="disabled"
            @click="emit('close')"
        >
            <ori-icon :icon="CLOSE_ICON" class="ori-tag__close-icon" />
        </button>
    </span>
</template>
