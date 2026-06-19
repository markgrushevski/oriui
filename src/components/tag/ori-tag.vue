<script lang="ts" setup>
import type { ActionSize, RadiusSize, ThemeColor, Variant } from '../../types';
import { OriIcon } from '../icon';

const {
    closeLabel = 'Remove',
    color = 'primary',
    radius = 'rounded',
    size = 'sm',
    variant = 'tonal'
} = defineProps<{
    appendIcon?: string;
    closable?: boolean;
    closeLabel?: string;
    color?: ThemeColor;
    disabled?: boolean;
    prependIcon?: string;
    radius?: RadiusSize;
    size?: ActionSize;
    text?: string;
    variant?: Variant;
}>();

const emit = defineEmits<{ close: [] }>();

const CLOSE_ICON = 'M6.4 19 5 17.6l5.6-5.6L5 6.4 6.4 5l5.6 5.6L17.6 5 19 6.4 13.4 12l5.6 5.6-1.4 1.4-5.6-5.6Z';
</script>

<template>
    <span
        :class="[
            'ori-tag',
            {
                [`ori-size-radius ori-size-radius_${radius}`]: radius,
                [`ori-font-size ori-font-size_${size}`]: size,
                [`ori-variant ori-variant_${variant}`]: variant,
                [`ori-color ori-color_${color}`]: color
            }
        ]"
        :aria-disabled="disabled ? 'true' : undefined"
    >
        <ori-icon v-if="prependIcon" :icon="prependIcon" class="ori-tag__icon" />

        <span class="ori-tag__text">
            <slot>{{ text }}</slot>
        </span>

        <ori-icon v-if="appendIcon" :icon="appendIcon" class="ori-tag__icon" />

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
