<script setup lang="ts">
defineProps<{ text?: string }>();
</script>

<template>
    <header :class="$style.header">
        <slot name="prepend" />
        <span>{{ text }}</span>
        <slot></slot>
    </header>
</template>

<style module>
.header {
    display: flex;
    align-items: center;

    height: 1.75em;
    color: var(--text-primary);

    font-weight: bolder;
}
</style>
