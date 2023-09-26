<script setup lang="ts">
defineProps<{ title: string }>();
</script>

<template>
    <h4>{{ title }}</h4>
    <section>
        <slot></slot>
    </section>
</template>
