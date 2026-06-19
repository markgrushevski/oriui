<script lang="ts" setup>
import type { GapSize } from '../../types';

const { as = 'div', gap } = defineProps<{
    /** CSS `align-items` value (cross-axis alignment). */
    align?: string;
    /** An HTML tag name, a Component name or Component class reference. */
    as?: string | object;
    /** Wrapping row (cluster) instead of a column stack. */
    cluster?: boolean;
    gap?: GapSize;
    /** CSS `justify-content` value (main-axis distribution). */
    justify?: string;
}>();
</script>

<template>
    <component
        :is="as"
        :class="[cluster ? 'ori-cluster' : 'ori-stack', { [`ori-size-gap_${gap}`]: gap }]"
        :style="{ alignItems: align, justifyContent: justify }"
    >
        <slot />
    </component>
</template>
