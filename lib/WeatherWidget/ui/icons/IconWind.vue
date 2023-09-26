<script setup lang="ts">
import WrapperIcon from './WrapperIcon.vue';
defineProps<{ angle: number }>();
</script>

<template>
    <WrapperIcon>
        <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" viewBox="0 0 24 24">
            <path
                :transform="`rotate(${angle - 180} 12 12)`"
                d="M12,2L4.5,20.29L5.21,21L12,18L18.79,21L19.5,20.29L12,2Z"
            />
        </svg>
    </WrapperIcon>
</template>
