<script lang="ts" setup>
import type { ActionSize, RadiusSize, ThemeColor, Variant } from '../../types';
import { OriIcon } from '../icon';

const {
    closeLabel = 'Dismiss',
    color = 'info',
    radius = 'md',
    size = 'md',
    variant = 'tonal'
} = defineProps<{
    closable?: boolean;
    closeLabel?: string;
    color?: ThemeColor;
    icon?: string;
    radius?: RadiusSize;
    size?: ActionSize;
    text?: string;
    title?: string;
    variant?: Variant;
}>();

const emit = defineEmits<{
    close: [];
}>();

const CLOSE_ICON = 'M6.4 19 5 17.6l5.6-5.6L5 6.4 6.4 5l5.6 5.6L17.6 5 19 6.4 13.4 12l5.6 5.6-1.4 1.4-5.6-5.6Z';
</script>

<template>
    <div
        :class="[
            'ori-alert',
            {
                [`ori-size-radius ori-size-radius_${radius}`]: radius,
                [`ori-font-size ori-font-size_${size}`]: size,
                [`ori-variant ori-variant_${variant}`]: variant,
                [`ori-color ori-color_${color}`]: color
            }
        ]"
        role="alert"
    >
        <div v-if="icon || $slots['icon']" class="ori-alert__icon">
            <slot name="icon">
                <ori-icon v-if="icon" :icon="icon" size="sm" />
            </slot>
        </div>

        <div class="ori-alert__content">
            <div v-if="title || $slots['title']" class="ori-alert__title">
                <slot name="title">{{ title }}</slot>
            </div>
            <div v-if="text || $slots['default']" class="ori-alert__body">
                <slot>{{ text }}</slot>
            </div>
            <div v-if="$slots['actions']" class="ori-alert__actions">
                <slot name="actions"></slot>
            </div>
        </div>

        <button v-if="closable" type="button" class="ori-alert__close" :aria-label="closeLabel" @click="emit('close')">
            <ori-icon :icon="CLOSE_ICON" size="sm" />
        </button>
    </div>
</template>

<style>
.ori-alert {
    display: flex;
    flex-direction: row;
    align-items: flex-start;
    gap: calc(var(--ori-size-gap) * 1.5);

    padding: calc(var(--ori-size-gap) * 1.5) calc(var(--ori-size-gap) * 2);

    border: 1px solid var(--ori-variant-border-color);
    border-radius: var(--ori-size-radius);

    opacity: var(--ori-variant-opacity);

    background-color: var(--ori-variant-bg-color);
    color: var(--ori-variant-text-color);

    font-size: var(--ori-font-size);
    line-height: 1.45;
    overflow-wrap: break-word;
}

.ori-alert .ori-alert__icon {
    display: flex;
    flex-shrink: 0;
    align-items: center;

    margin-top: 0.05em;
}

.ori-alert .ori-alert__content {
    display: flex;
    flex-direction: column;
    flex-grow: 1;
    gap: calc(var(--ori-size-gap) / 2);

    min-width: 0;
}

.ori-alert .ori-alert__title {
    font-weight: bolder;
}

.ori-alert .ori-alert__actions {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--ori-size-gap);

    margin-top: var(--ori-size-gap);
}

.ori-alert .ori-alert__close {
    display: inline-flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;

    margin: -0.25em -0.25em -0.25em 0;
    padding: 0;

    border: 0;
    border-radius: var(--ori-size-radius);

    background-color: transparent;
    color: currentcolor;

    cursor: pointer;
}

.ori-alert .ori-alert__close:focus-visible {
    outline: 2px solid currentcolor;
    outline-offset: 2px;
}

@media (hover: hover) {
    .ori-alert .ori-alert__close:hover {
        background-color: color-mix(in srgb, currentcolor, transparent 88%);
    }
}
</style>
