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
                'ori-button_icon': Boolean(icon) && !text,
                'ori-button_fluid': fluid,
                [`ori-button_icon-position_${iconPosition}`]: iconPosition,
                [`ori-button_${size}`]: size,
                [`ori-size-radius_${radius}`]: radius,
                [`ori-font-size_${size}`]: size,
                [`ori-variant_${variant}`]: variant,
                [`ori-color_${color}`]: color
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
