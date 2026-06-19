<script lang="ts" setup>
import type { ThemeColor } from '../../types';

const { as = 'a' } = defineProps<{
    /** An HTML tag name (default `'a'`), a Component name, or a Component class reference. */
    as?: string | object;
    color?: ThemeColor;
    /** Opens in a new tab (`target="_blank"`) with `rel="noopener noreferrer"`. */
    external?: boolean;
    /** Underline only on hover (instead of always). */
    hover?: boolean;
    href?: string;
}>();
</script>

<template>
    <component
        :is="as"
        :class="['ori-link', { 'ori-link_hover': hover, [`ori-color_${color}`]: color }]"
        :href="href"
        :target="external ? '_blank' : undefined"
        :rel="external ? 'noopener noreferrer' : undefined"
    >
        <slot />
    </component>
</template>
