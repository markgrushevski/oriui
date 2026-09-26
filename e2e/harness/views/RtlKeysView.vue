<script lang="ts" setup>
import { ref } from 'vue'
import { OriColorPicker, OriTabs, OriToolbar, OriToolbarButton } from '@oriui/vue'

// Roving widgets inside `dir="rtl"`, with no `dir` passed to any of them: the arrow mapping has to come
// from the direction the browser resolved, which happy-dom cannot compute.
const tab = ref<string | number>('one')
const color = ref('#ff0000')
</script>

<template>
    <div dir="rtl" style="padding: 40px; display: grid; gap: 40px">
        <OriTabs
            v-model="tab"
            :tabs="[
                { value: 'one', label: 'One' },
                { value: 'two', label: 'Two' },
                { value: 'three', label: 'Three' }
            ]"
        >
            <template #default="{ tab: t }">{{ t.label }} panel</template>
        </OriTabs>
        <p data-testid="tab-value">{{ tab }}</p>

        <OriToolbar label="Actions">
            <OriToolbarButton aria-label="First" icon="x" />
            <OriToolbarButton aria-label="Second" icon="x" />
            <OriToolbarButton aria-label="Third" icon="x" />
        </OriToolbar>

        <OriColorPicker v-model="color" label="Color" :presets="['#ff0000', '#00ff00', '#0000ff']" />
    </div>
</template>
