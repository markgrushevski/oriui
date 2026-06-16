<script lang="ts" setup>
import type { ActionSize, Variant, ThemeColor, CenteredPosition, RadiusSize } from '../../types';
import { OriSpinner } from '../spinner';
import { OriIcon } from '../icon';

const {
    as = 'button',
    color = 'primary',
    iconPosition = 'left',
    radius = 'rounded',
    size = 'md',
    variant = 'fill'
} = defineProps<{
    active?: boolean;
    /** An HTML tag name, a Component name or Component class reference. */
    as?: string | object;
    color?: ThemeColor;
    disabled?: boolean;
    fluid?: boolean;
    icon?: string;
    iconPosition?: CenteredPosition;
    loading?: boolean;
    radius?: RadiusSize;
    size?: ActionSize;
    text?: string;
    variant?: Variant;
}>();
</script>

<template>
    <component
        :is="as"
        :class="[
            'ori-button',
            {
                'ori-button_icon': !text,
                'ori-button_fluid': fluid,
                [`ori-button_icon-position_${iconPosition}`]: iconPosition,
                [`ori-size-action ori-size-action_${size}`]: size,
                [`ori-size-radius ori-size-radius_${radius}`]: radius,
                [`ori-font-size ori-font-size_${size}`]: size,
                [`ori-variant ori-variant_${variant}`]: variant,
                [`ori-color ori-color_${color}`]: color
            }
        ]"
        :type="as === 'button' ? 'button' : undefined"
        :disabled="as === 'button' && (disabled || loading) ? true : undefined"
        :aria-disabled="disabled ? 'true' : undefined"
        :aria-busy="loading ? 'true' : undefined"
        :data-active="active ? '' : undefined"
        :tabindex="disabled && as !== 'button' ? -1 : undefined"
    >
        <slot>
            <ori-icon v-if="icon && !loading" :icon="icon" class="ori-button__icon" />
            <ori-spinner v-else-if="loading" aria-hidden="true" class="ori-button__icon" />

            <span v-if="text" class="ori-button__text">{{ text }}</span>
        </slot>
    </component>
</template>

<style>
.ori-button {
    --ori-font-size-step_inc: 4px;

    display: inline-flex;
    flex-direction: row;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;

    height: max(calc(2em + 0.5em), var(--ori-size-action));

    padding-inline: 1em;

    transition:
        opacity 0.15s ease-out,
        background-color 0.15s ease-out,
        color 0.15s ease-out,
        border-color 0.15s ease-out;

    border: 1px solid var(--ori-variant-border-color);
    border-radius: var(--ori-size-radius);

    opacity: var(--ori-variant-opacity);

    background-color: var(--ori-variant-bg-color);
    color: var(--ori-variant-text-color);

    font-size: var(--ori-font-size);
    line-height: 1;

    cursor: pointer;
    user-select: none;
    gap: 0.125em 0.375em;
}

.ori-button:focus-visible {
    outline: 2px solid var(--ori-color-primary);
    outline-offset: 2px;
}

.ori-button:disabled,
.ori-button[aria-disabled='true'] {
    opacity: 0.45;
    pointer-events: none;
}

.ori-button[aria-busy='true'] {
    pointer-events: none;
}

.ori-button.ori-button_fluid {
    display: flex;
    width: 100%;
}

.ori-button.ori-button_icon {
    width: var(--ori-size-action);
    height: var(--ori-size-action);

    padding: 0;

    font-size: calc(var(--ori-size-action) / 2);
}

.ori-button.ori-button_icon-position_top {
    flex-direction: column;

    /* font-size: calc(var(--ori-font-size) - var(--ori-font-size-step_dec) * 1); */
}

.ori-button.ori-button_icon-position_right {
    flex-direction: row-reverse;
}

.ori-button.ori-button_icon-position_bottom {
    flex-direction: column-reverse;

    /* font-size: calc(var(--ori-font-size) - var(--ori-font-size-step_dec) * 1); */
}

.ori-button.ori-button_icon-position_left {
    flex-direction: row;
}

.ori-button:not(.ori-button_icon) .ori-button__icon {
    font-size: calc(var(--ori-font-size) + 2px);
}
</style>
