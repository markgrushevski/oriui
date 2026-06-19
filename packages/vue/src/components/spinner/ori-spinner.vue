<script lang="ts" setup>
import type { ActionSize, ThemeColor } from '../../types';

const { label = 'Loading', size = 'text' } = defineProps<{
    color?: ThemeColor;
    inline?: boolean;
    label?: string;
    size?: ActionSize;
}>();
</script>

<template>
    <div
        :class="[
            'ori-spinner',
            {
                'ori-spinner_inline': inline,
                [`ori-spinner_${size}`]: size,
                [`ori-color_${color}`]: color
            }
        ]"
        role="status"
        :aria-label="label"
    ></div>
</template>
