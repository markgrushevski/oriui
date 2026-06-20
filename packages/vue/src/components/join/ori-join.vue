<script lang="ts" setup>
const { as = 'div' } = defineProps<{
    /** An HTML tag name, a Component name or Component class reference. */
    as?: string | object;
    vertical?: boolean;
}>();
</script>

<template>
    <component :is="as" :class="['ori-join', { 'ori-join_vertical': vertical }]" role="group">
        <slot />
    </component>
</template>
