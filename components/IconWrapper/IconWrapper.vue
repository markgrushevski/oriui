<script lang="ts" setup></script>

<template>
    <div :class="$style.wrapper"><slot /></div>
</template>

<style module>
.wrapper {
    display: inline-block;
    width: 1.5rem;
    height: 1.5rem;
}

.wrapper svg {
    width: 100%;
    height: 100%;
}
</style>
