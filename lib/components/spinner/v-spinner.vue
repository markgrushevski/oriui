<script lang="ts" setup>
import type { ActionSize, ThemeColor } from '@lib';

withDefaults(
    defineProps<{
        color?: ThemeColor;
        inline?: boolean;
        size?: ActionSize;
    }>(),
    { size: 'text' }
);
</script>

<template>
    <div
        :class="[
            'v-spinner',
            {
                'v-spinner_inline': inline,
                [`v-size-action v-size-action_${size}`]: size,
                [`v-color v-color_${color}`]: color
            }
        ]"
    ></div>
</template>

<style>
.v-spinner {
    --v-color: currentcolor;

    display: block;

    width: var(--v-size-action);
    height: var(--v-size-action);

    animation: rotation 1s linear infinite;

    border: 2px solid var(--v-color);
    border-radius: 50%;
    border-bottom-color: transparent;
}

.v-spinner.v-spinner_inline {
    display: inline-block;
    margin: 0.25em;
}

@keyframes rotation {
    from {
        transform: rotate(0deg);
    }

    to {
        transform: rotate(360deg);
    }
}
</style>
