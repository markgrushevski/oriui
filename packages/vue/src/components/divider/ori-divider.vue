<script lang="ts" setup>
import type { Orientation, ThemeColor } from '../../types'

const { color, orientation = 'horizontal' } = defineProps<{
    color?: ThemeColor
    label?: string
    orientation?: Orientation
}>()
</script>

<template>
    <div
        :class="[
            'ori-divider',
            {
                'ori-divider_vertical': orientation === 'vertical',
                'ori-divider_text': label || $slots.default,
                [`ori-color_${color}`]: color
            }
        ]"
        role="separator"
        :aria-orientation="orientation === 'vertical' ? 'vertical' : undefined"
    >
        <span v-if="label || $slots.default" class="ori-divider__label">
            <slot>{{ label }}</slot>
        </span>
    </div>
</template>
