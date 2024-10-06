<script lang="ts" setup>
import type { ActionSize, ThemeColor } from '@lib';

withDefaults(
    defineProps<{
        color?: ThemeColor;
        icon?: string;
        inline?: boolean;
        size?: ActionSize;
        spaced?: boolean;
    }>(),
    { size: 'text' }
);
</script>

<template>
    <i
        :class="[
            'v-icon',
            {
                'v-icon_inline': inline,
                [`v-size-action v-size-action_${size}`]: size,
                [`v-size-action-space v-size-action-space_${size}`]: size && spaced,
                [`v-color v-color_${color}`]: color
            }
        ]"
    >
        <slot>
            <svg v-if="icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path :d="icon" />
            </svg>
        </slot>
    </i>
</template>

<style>
.v-icon {
    --v-color: currentcolor;

    display: flex;
    align-items: center;
    justify-content: center;

    width: var(--v-size-action);
    height: var(--v-size-action);

    margin: var(--v-size-action-space);

    border-radius: 50%;

    color: var(--v-color);
}

.v-icon.v-icon_inline {
    display: inline-flex;
    margin: 0.25em;
}

.v-icon > * {
    width: 100%;
    height: 100%;
    fill: currentcolor;
    color: currentcolor;
}
</style>
