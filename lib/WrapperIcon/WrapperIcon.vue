<script lang="ts" setup>
withDefaults(defineProps<{ width?: string; height?: string }>(), { width: '1.5em', height: '1.5em' });
</script>

<template>
    <div :class="$style.wrapper"><slot /></div>
</template>

<style module>
.wrapper {
    display: inline-block;
    width: v-bind(width);
    height: v-bind(height);
}

.wrapper svg {
    width: 100%;
    height: 100%;
}
</style>
