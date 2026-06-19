<script lang="ts" setup>
import type { ActionSize, ThemeColor } from '../../types';

const { size = 'text' } = defineProps<{
    color?: ThemeColor;
    icon?: string;
    inline?: boolean;
    label?: string;
    size?: ActionSize;
    spaced?: boolean;
}>();
</script>

<template>
    <i
        :class="[
            'ori-icon',
            {
                'ori-icon_inline': inline,
                'ori-icon_spaced': size && spaced,
                [`ori-icon_${size}`]: size,
                [`ori-color_${color}`]: color
            }
        ]"
        :role="label ? 'img' : undefined"
        :aria-label="label || undefined"
        :aria-hidden="label ? undefined : 'true'"
    >
        <slot>
            <svg v-if="icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path :d="icon" />
            </svg>
        </slot>
    </i>
</template>
