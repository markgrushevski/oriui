<script lang="ts" setup>
import type { ThemeColor } from '../../types';

const { color } = defineProps<{
    color?: ThemeColor;
    text?: string;
    vertical?: boolean;
}>();
</script>

<template>
    <div
        :class="[
            'ori-divider',
            {
                'ori-divider_vertical': vertical,
                'ori-divider_text': text || $slots.default,
                [`ori-color_${color}`]: color
            }
        ]"
        role="separator"
        :aria-orientation="vertical ? 'vertical' : undefined"
    >
        <span v-if="text || $slots.default" class="ori-divider__label">
            <slot>{{ text }}</slot>
        </span>
    </div>
</template>
