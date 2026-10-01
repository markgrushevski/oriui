<script lang="ts" setup>
// OriList — a vertical list of OriListItem rows. A <ul>, with role="list" stated because Safari drops list
// semantics from a <ul> styled `list-style: none`. Wrap it in <nav aria-label> for navigation.
const { divided = false } = defineProps<{
    /** A hairline between rows. */
    divided?: boolean
}>()
</script>

<template>
    <ul :class="['ori-list', { 'ori-list_divided': divided }]" role="list">
        <slot></slot>
    </ul>
</template>
