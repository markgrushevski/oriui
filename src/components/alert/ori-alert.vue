<script lang="ts" setup>
import { computed } from 'vue';
import type { ActionSize, RadiusSize, ThemeColor, Variant } from '../../types';
import { OriIcon } from '../icon';

const {
    closeLabel = 'Dismiss',
    color = 'info',
    live,
    radius = 'md',
    size = 'md',
    variant = 'tonal'
} = defineProps<{
    closable?: boolean;
    closeLabel?: string;
    color?: ThemeColor;
    icon?: string;
    /**
     * Live-region politeness. Defaults to `assertive` (role="alert") for urgent colors (danger / warn)
     * and `polite` (role="status") otherwise — so a static info/success banner is not announced
     * assertively on load. `off` opts out of the live region entirely.
     */
    live?: 'assertive' | 'polite' | 'off';
    radius?: RadiusSize;
    size?: ActionSize;
    text?: string;
    title?: string;
    variant?: Variant;
}>();

const emit = defineEmits<{
    close: [];
}>();

// role=alert is assertive (interrupts the screen reader) — correct only for urgent messages. Derive the
// politeness from the color unless the caller sets `live` explicitly: danger/warn → assertive (alert),
// everything else → polite (status). `off` → no live region.
const politeness = computed(() => live ?? (color === 'danger' || color === 'warn' ? 'assertive' : 'polite'));
const ariaRole = computed(() => {
    if (politeness.value === 'assertive') return 'alert';
    if (politeness.value === 'polite') return 'status';
    return undefined;
});

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
        :role="ariaRole"
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
