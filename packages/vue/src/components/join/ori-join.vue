<script lang="ts" setup>
import type { Orientation } from '../../types'

const { as = 'div', orientation = 'horizontal' } = defineProps<{
    /** An HTML tag name, a Component name or Component class reference. */
    as?: string | object
    orientation?: Orientation
}>()
</script>

<template>
    <component :is="as" :class="['ori-join', { 'ori-join_vertical': orientation === 'vertical' }]" role="group">
        <slot />
    </component>
</template>
