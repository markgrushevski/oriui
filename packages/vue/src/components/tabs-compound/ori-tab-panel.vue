<script lang="ts" setup>
import { computed } from 'vue'
import { useCompoundTabs } from './context'

// PROTOTYPE (poc/compound-tabs) — one panel. Panels render after the tablist, so every tab is already
// registered by the time one of these resolves its `hidden`.
const { value } = defineProps<{ value: string | number }>()

const ctx = useCompoundTabs('OriTabPanel')
const selected = computed(() => ctx.selected.value === value)
</script>

<template>
    <div
        :id="ctx.panelId(value)"
        role="tabpanel"
        class="ori-tabs__panel"
        :aria-labelledby="ctx.tabId(value)"
        :hidden="!selected"
        :tabindex="0"
    >
        <slot />
    </div>
</template>
