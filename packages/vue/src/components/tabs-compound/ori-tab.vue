<script lang="ts" setup>
import { computed, onUnmounted, watch } from 'vue'
import { useCompoundTabs } from './context'

// PROTOTYPE (poc/compound-tabs) — one tab. It registers itself DURING SETUP, which is what makes the
// server output correct: setup runs in render order on the server too, so by the time this button
// serializes, every earlier sibling is already in the registry and this one is in it as well.
const { disabled = false, value } = defineProps<{ disabled?: boolean; value: string | number }>()

const ctx = useCompoundTabs('OriTab')
// `immediate` is load-bearing twice over: it is the initial registration (which must happen during
// setup, in render order, or the server output loses this tab), and reading the props through the
// getter is what keeps it reactive — a bare `ctx.register(value, disabled)` at root scope is the
// `vue/no-setup-props-reactivity-loss` footgun the lint rule names.
watch(
    () => [value, disabled] as const,
    ([v, d], old) => {
        if (old && old[0] !== v) ctx.unregister(old[0])
        ctx.register(v, d)
    },
    { immediate: true }
)
onUnmounted(() => ctx.unregister(value))

const selected = computed(() => ctx.selected.value === value)
</script>

<template>
    <button
        :id="ctx.tabId(value)"
        type="button"
        role="tab"
        class="ori-tabs__tab"
        :aria-selected="selected ? 'true' : 'false'"
        :aria-controls="ctx.panelId(value)"
        :tabindex="selected ? 0 : -1"
        :disabled="disabled || undefined"
        @click="ctx.select(value)"
    >
        <slot />
    </button>
</template>
