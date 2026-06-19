<script lang="ts" setup>
import type { RadiusSize, ThemeColor, Variant } from '../../types';
import { OriAvatar } from '../avatar';
import { OriIcon } from '../icon';

const {
    color = 'surface',
    radius = 'lg',
    variant = 'fill'
} = defineProps<{
    appendAvatar?: string;
    appendIcon?: string;
    color?: ThemeColor;
    disabled?: boolean;
    fluid?: boolean;
    image?: string;
    loading?: boolean;
    prependAvatar?: string;
    prependIcon?: string;
    radius?: RadiusSize;
    reverseAppendedActions?: boolean;
    reversePrependedActions?: boolean;
    subtitle?: string;
    text?: string;
    title?: string;
    variant?: Variant;
    row?: boolean;
}>();
</script>

<template>
    <div
        :class="[
            'ori-card',
            {
                'ori-card_icon': !text,
                'ori-card_fluid': fluid,
                'ori-card_row': row,
                [`ori-size-radius_${radius}`]: radius,
                [`ori-variant_${variant}`]: variant,
                [`ori-color_${color}`]: color
            }
        ]"
        :aria-disabled="disabled ? 'true' : undefined"
        :aria-busy="loading ? 'true' : undefined"
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
