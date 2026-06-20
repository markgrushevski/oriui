<script lang="ts" setup>
import { computed } from 'vue';
import type { RadiusSize, ThemeColor, Variant } from '../../types';

// OriBadge — a small status / count indicator. Two modes: standalone inline (no default slot), or
// floating over wrapped content (default slot + `floating`). The badge surface rides the shared
// ori-variant + ori-color + ori-size-radius utilities, so it reads the resolved aliases
// (--ori-variant-*, --ori-size-radius) like the rest of the library. `dot` collapses it to a tiny
// circle; `content` + `max` renders a capped count (e.g. 99+). `label` becomes the accessible name;
// a bare dot — or an empty non-dot badge — with no label is decorative.
//
// Consumer attrs (id / class / data-* / handlers) always land on the inner .ori-badge element via
// inheritAttrs:false + v-bind="$attrs", so the attr target stays the same whether or not a default
// slot (the anchor wrapper) is present. The badge element is intentionally rendered in both branches
// (wrapped / unwrapped) — Vue has no native optional-wrapper, and <component :is="null"> renders
// nothing rather than a fragment; the two copies are kept identical apart from the floating modifier.
defineOptions({ inheritAttrs: false });

const {
    color = 'primary',
    content,
    dot = false,
    label,
    max,
    radius = 'rounded',
    variant = 'fill'
} = defineProps<{
    color?: ThemeColor;
    content?: string | number;
    dot?: boolean;
    floating?: boolean;
    label?: string;
    max?: number;
    radius?: RadiusSize;
    variant?: Variant;
}>();

// Capped display value: only numbers with a numeric `max` are capped; everything else passes through.
const displayValue = computed(() => {
    if (typeof content === 'number' && typeof max === 'number' && content > max) {
        return `${max}+`;
    }

    return content;
});

// A pure dot with no label carries no information for assistive tech — hide it. An empty non-dot
// badge (no label and nothing to render) is likewise an unnamed empty element, so hide it too.
// Anything else is either named (label) or has visible text content.
const decorative = computed(() => !label && (dot || displayValue.value === undefined || displayValue.value === ''));
</script>

<template>
    <span v-if="$slots.default" class="ori-badge-anchor">
        <slot />
        <span
            :class="[
                'ori-badge',
                {
                    'ori-badge_dot': dot,
                    'ori-badge_floating': floating,
                    [`ori-size-radius_${radius}`]: radius,
                    [`ori-variant_${variant}`]: variant,
                    [`ori-color_${color}`]: color
                }
            ]"
            v-bind="$attrs"
            :aria-label="label || undefined"
            :aria-hidden="decorative ? 'true' : undefined"
        >
            <template v-if="!dot">{{ displayValue }}</template>
        </span>
    </span>

    <span
        v-else
        :class="[
            'ori-badge',
            {
                'ori-badge_dot': dot,
                [`ori-size-radius_${radius}`]: radius,
                [`ori-variant_${variant}`]: variant,
                [`ori-color_${color}`]: color
            }
        ]"
        v-bind="$attrs"
        :aria-label="label || undefined"
        :aria-hidden="decorative ? 'true' : undefined"
    >
        <template v-if="!dot">{{ displayValue }}</template>
    </span>
</template>
