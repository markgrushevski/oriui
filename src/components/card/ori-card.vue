<script lang="ts" setup>
import type { RadiusSize, ThemeColor, Variant } from '../../types';
import { OriAvatar } from '../avatar';
import { OriIcon } from '../icon';

withDefaults(
    defineProps<{
        appendAvatar?: string;
        appendIcon?: string;
        /** @default "primary" */
        color?: ThemeColor;
        disabled?: boolean;
        fluid?: boolean;
        icon?: string;
        image?: string;
        loading?: boolean;
        prependAvatar?: string;
        prependIcon?: string;
        /** @default "rounded" */
        radius?: RadiusSize;
        reverseAppendedActions?: boolean;
        reversePrependedActions?: boolean;
        subtitle?: string;
        text?: string;
        title?: string;
        /** @default "fill" */
        variant?: Variant;
        row?: boolean;
    }>(),
    {
        color: 'surface',
        radius: 'lg',
        variant: 'fill'
    }
);
</script>

<template>
    <div
        :class="[
            'ori-card',
            {
                'ori-card_icon': !text,
                'ori-card_fluid': fluid,
                'ori-card_row': row,
                [`ori-size-radius ori-size-radius_${radius}`]: radius,
                [`ori-variant ori-variant_${variant}`]: variant,
                [`ori-color ori-color_${color}`]: color,
                'ori-loading': loading,
                'ori-disabled': disabled
            }
        ]"
    >
        <slot>
            <div
                v-if="$slots['actions-prepend']"
                :class="{ 'ori-card__actions_reverse': reversePrependedActions }"
                class="ori-card__actions"
            >
                <slot name="actions-prepend"></slot>
            </div>
            <div class="ori-card__header">
                <div class="ori-card__header-prepend">
                    <slot name="header-prepend">
                        <ori-avatar v-if="prependAvatar" :src="prependAvatar" />
                        <ori-icon v-if="prependIcon" :icon="prependIcon" size="sm" />
                    </slot>
                </div>
                <div class="ori-card__headline">
                    <div class="ori-card__title">
                        <slot name="title">{{ title }}</slot>
                    </div>
                    <div class="ori-card__subtitle">
                        <slot name="subtitle">{{ subtitle }}</slot>
                    </div>
                </div>
                <div class="ori-card__header-append">
                    <slot name="header-append">
                        <ori-avatar v-if="appendAvatar" :src="appendAvatar" />
                        <ori-icon v-if="appendIcon" :icon="appendIcon" size="sm" />
                    </slot>
                </div>
            </div>
            <div v-if="$slots['body'] || text" class="ori-card__body">
                <slot name="body">{{ text }}</slot>
            </div>
            <div
                v-if="$slots['actions-append']"
                :class="{ 'ori-card__actions_reverse': reverseAppendedActions }"
                class="ori-card__actions"
            >
                <slot name="actions-append"></slot>
            </div>
        </slot>
    </div>
</template>

<style>
.ori-card {
    min-width: min-content;

    padding: var(--ori-size-gap_xl);

    overflow: hidden;

    transition:
        opacity 0.15s ease-out,
        background-color 0.15s ease-out,
        color 0.15s ease-out,
        border-color 0.15s ease-out;

    border: 1px solid var(--ori-variant-border-color);
    border-radius: var(--ori-size-radius);

    opacity: var(--ori-variant-opacity);

    background-color: var(--ori-variant-bg-color);
    color: currentcolor;

    font-size: 1rem;
    overflow-wrap: break-word;
}

.ori-card.ori-card_fluid {
    width: 100%;
}

.ori-card.ori-card_row {
    display: flex;
    gap: calc(var(--ori-size-gap) * 2);
}

.ori-card .ori-card__header {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: stretch;
    gap: calc(var(--ori-size-gap) * 1.5);
}

.ori-card .ori-card__headline {
    flex-grow: 1;
}

.ori-card .ori-card__title {
    font-size: 1.25rem;
    font-weight: bolder;
}

.ori-card .ori-card__subtitle {
    opacity: 0.8;
    font-size: 0.875rem;
}

.ori-card .ori-card__actions {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    gap: var(--ori-size-gap);
}

.ori-card .ori-card__actions.ori-card__actions_reverse {
    flex-direction: row-reverse;
}

.ori-card:not(.ori-card_row) > .ori-card__actions:not(:last-child),
.ori-card:not(.ori-card_row) > .ori-card__header:not(:last-child),
.ori-card:not(.ori-card_row) > .ori-card__body:not(:last-child) {
    margin-bottom: var(--ori-size-gap);
}
</style>
