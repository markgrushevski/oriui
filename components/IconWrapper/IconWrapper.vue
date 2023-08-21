<script lang="ts" setup>
withDefaults(
    defineProps<{
        width?: string;
        height?: string;
        widthIcon?: string;
        heightIcon?: string;
    }>(),
    {
        width: '1.5rem',
        height: '1.5rem',
        widthIcon: '100%',
        heightIcon: '100%'
    }
);
</script>

<template>
    <span :class="IconWrapper.wrapper"><slot /></span>
</template>

<style module="IconWrapper">
.wrapper {
    width: v-bind('width');
    height: v-bind('height');
    display: inline-block;
}

.wrapper svg {
    width: v-bind('widthIcon');
    height: v-bind('heightIcon');
}
</style>
