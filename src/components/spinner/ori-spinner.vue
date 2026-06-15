<script lang="ts" setup>
import type { ActionSize, ThemeColor } from '../../types';

withDefaults(
    defineProps<{
        color?: ThemeColor;
        inline?: boolean;
        /** @default "text" */
        size?: ActionSize;
    }>(),
    { size: 'text' }
);
</script>

<template>
    <div
        :class="[
            'ori-spinner',
            {
                'ori-spinner_inline': inline,
                [`ori-size-action ori-size-action_${size}`]: size,
                [`ori-color ori-color_${color}`]: color
            }
        ]"
    ></div>
</template>

<style>
.ori-spinner {
    --ori-color: currentcolor;

    display: block;

    width: var(--ori-size-action);
    height: var(--ori-size-action);

    animation: rotation 1s linear infinite;

    border: 2px solid var(--ori-color);
    border-radius: 50%;
    border-bottom-color: transparent;
}

.ori-spinner.ori-spinner_inline {
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
