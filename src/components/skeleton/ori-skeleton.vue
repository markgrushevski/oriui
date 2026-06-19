<script lang="ts" setup>
import type { RadiusSize } from '../../types';

const { as = 'div', radius = 'sm' } = defineProps<{
    /** An HTML tag name (default `'div'`), a Component name, or a Component class reference. */
    as?: string | object;
    radius?: RadiusSize;
}>();
</script>

<template>
    <component :is="as" :class="['ori-skeleton', { [`ori-size-radius_${radius}`]: radius }]" aria-hidden="true" />
</template>
