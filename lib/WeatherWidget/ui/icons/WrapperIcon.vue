<script setup lang="ts"></script>

<template>
    <span :class="$style.wrapper"><slot /></span>
</template>

<style module>
.wrapper {
    display: inline-block;
    width: 1.25em;
    height: 1.25em;
}

.wrapper > * {
    width: 100%;
    height: 100%;
}
</style>
