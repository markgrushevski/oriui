<script setup lang="ts">
import { ref } from 'vue';

const volume = ref(60);
const brightness = ref(40);
</script>

<template>
    <div style="display: flex; flex-direction: column; gap: 1.5rem; width: 100%; max-width: 24rem">
        <OriSlider v-model="volume" label="Volume" :show-value="true" />
        <OriSlider v-model="brightness" label="Brightness" color="warn" :show-value="true" :max="200" />
    </div>
</template>
