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
                [`ori-size-action ori-size-action_${size}`]: size,
                [`ori-size-action-space ori-size-action-space_${size}`]: size && spaced,
                [`ori-color ori-color_${color}`]: color
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

<style>
.ori-icon {
    --ori-color: currentcolor;

    display: flex;
    align-items: center;
    justify-content: center;

    width: var(--ori-size-action);
    height: var(--ori-size-action);

    margin: var(--ori-size-action-space);

    border-radius: 50%;

    color: var(--ori-color);
}

.ori-icon.ori-icon_inline {
    display: inline-flex;
    margin: 0.25em;
}

.ori-icon > * {
    width: 100%;
    height: 100%;
    fill: currentcolor;
    color: currentcolor;
}
</style>
