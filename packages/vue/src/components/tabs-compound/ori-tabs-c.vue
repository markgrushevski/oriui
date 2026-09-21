<script lang="ts" setup>
import { computed, reactive, toRef, useId } from 'vue'
import type { ThemeColor } from '../../types'
import { provideCompoundTabs } from './context'

// PROTOTYPE (poc/compound-tabs) — the compound root. Named OriTabsC so it can live beside the shipped
// array-driven OriTabs while both are measured.
//
// What the root can no longer do, and why: the array API resolves the selection synchronously from
// `tabs`, which is what makes "works without v-model" correct on the SERVER. Here the root learns its
// children only as they register, in render order. So the rule is: a bound value WINS unconditionally
// (it is not validated against a registry that is still filling), and only when there is no bound value
// does the first registered enabled tab become the selection. Validating a bound value during SSR would
// mean the first tab renders `aria-selected="true"` whenever the bound value belongs to a later tab that
// has not registered yet — a guaranteed hydration mismatch.
const {
    color = 'primary',
    defaultValue,
    label,
    orientation = 'horizontal'
} = defineProps<{
    color?: ThemeColor
    /** Compound-only: the array API derived this from the list; a root cannot. */
    defaultValue?: string | number
    label?: string
    orientation?: 'horizontal' | 'vertical'
}>()

const model = defineModel<string | number>()

const uid = useId() ?? 'ori-tabs-c'
const registry = reactive(new Map<string | number, boolean>())

const firstEnabled = computed(() => {
    for (const [value, disabled] of registry) if (!disabled) return value
    return undefined
})

const selected = computed(() => model.value ?? defaultValue ?? firstEnabled.value)

const slug = (value: string | number) => String(value).replace(/[^\w-]/g, '_')

provideCompoundTabs({
    register: (value, disabled) => void registry.set(value, disabled),
    unregister: (value) => void registry.delete(value),
    selected,
    select: (value) => (model.value = value),
    tabId: (value) => `${uid}-tab-${slug(value)}`,
    panelId: (value) => `${uid}-panel-${slug(value)}`,
    orientation: toRef(() => orientation),
    color: toRef(() => color),
    label: toRef(() => label)
})
</script>

<template>
    <div :class="['ori-tabs', `ori-color_${color}`, { 'ori-tabs_vertical': orientation === 'vertical' }]">
        <slot />
    </div>
</template>
