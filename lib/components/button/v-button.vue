<script lang="ts" setup>
import {
    type BlockSize,
    type Variant,
    type ThemeColor,
    type CenteredPosition,
    type RadiusSize,
    VSpinner,
    VIcon
} from '../../';

withDefaults(
    defineProps<{
        active?: boolean;
        /**
         * @description An HTML tag name, a Component name or Component class reference.
         * @default "button"
         * */
        as?: string | object;
        /** @default "primary" */
        color?: ThemeColor;
        disabled?: boolean;
        fluid?: boolean;
        icon?: string;
        /** @default "left" */
        iconPosition?: CenteredPosition;
        loading?: boolean;
        /** @default "rounded" */
        radius?: RadiusSize;
        /** @default "md" */
        size?: BlockSize;
        text?: string;
        /** @default "fill" */
        variant?: Variant;
    }>(),
    {
        as: 'button',
        color: 'primary',
        iconPosition: 'left',
        radius: 'rounded',
        size: 'md',
        variant: 'fill'
    }
);
</script>

<template>
    <component
        :is="as"
        :class="[
            'v-button',
            {
                'v-button_icon': !text,
                'v-button_fluid': fluid,
                [`v-button_icon-position_${iconPosition}`]: iconPosition,
                [`v-size-action v-size-action_${size}`]: size,
                [`v-size-radius v-size-radius_${radius}`]: radius,
                [`v-font-size v-font-size_${size}`]: size,
                [`v-variant v-variant_${variant}`]: variant,
                [`v-color v-color_${color}`]: color,
                'v-active': active,
                'v-loading': loading,
                'v-disabled': disabled
            }
        ]"
    >
        <slot>
            <v-icon v-if="icon && !loading" :icon="icon" class="v-button__icon" />
            <v-spinner v-else-if="loading" class="v-button__icon" />

            <span v-if="text" class="v-button__text">{{ text }}</span>
        </slot>
    </component>
</template>

<style>
.v-button {
    --v-font-size-step_inc: 4px;

    display: inline-flex;
    flex-direction: row;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;

    height: max(calc(2em + 0.5em), var(--v-size-action));

    padding-inline: 1em;

    transition:
        opacity 0.15s ease-out,
        background-color 0.15s ease-out,
        color 0.15s ease-out,
        border-color 0.15s ease-out;

    border: 1px solid var(--v-variant-border-color);
    border-radius: var(--v-size-radius);

    opacity: var(--v-variant-opacity);

    background-color: var(--v-variant-bg-color);
    color: var(--v-variant-text-color);

    font-size: var(--v-font-size);
    line-height: 1;

    cursor: pointer;
    user-select: none;
    gap: 0.125em 0.375em;
}

.v-button.v-button_fluid {
    display: flex;
    width: 100%;
}

.v-button.v-button_icon {
    width: var(--v-size-action);
    height: var(--v-size-action);

    padding: 0;

    font-size: calc(var(--v-size-action) / 2);
}

.v-button.v-button_icon-position_top {
    flex-direction: column;

    /* font-size: calc(var(--v-font-size) - var(--v-font-size-step_dec) * 1); */
}

.v-button.v-button_icon-position_right {
    flex-direction: row-reverse;
}

.v-button.v-button_icon-position_bottom {
    flex-direction: column-reverse;

    /* font-size: calc(var(--v-font-size) - var(--v-font-size-step_dec) * 1); */
}

.v-button.v-button_icon-position_left {
    flex-direction: row;
}

.v-button:not(.v-button_icon) .v-button__icon {
    font-size: calc(var(--v-font-size) + 2px);
}
</style>
