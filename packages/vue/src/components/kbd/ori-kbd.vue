<script lang="ts" setup>
const { as = 'kbd' } = defineProps<{
    /** An HTML tag name (default `'kbd'`), a Component name, or a Component class reference. */
    as?: string | object;
    text?: string;
}>();
</script>

<template>
    <component :is="as" class="ori-kbd">
        <slot>{{ text }}</slot>
    </component>
</template>
