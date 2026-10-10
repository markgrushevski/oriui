<script lang="ts" setup>
import { useSlots, watch, watchEffect } from 'vue'
import { useTabs, type TabItem as HeadlessTabItem } from '@oriui/headless/vue'
import type { Orientation, ThemeColor } from '../../types'

// Supplied by the app's bundler (see NOTES.md, Build / tests).
declare const process: { env: { NODE_ENV?: string } }

/**
 * A tab in `<OriTabs>` — the headless `TabItem` (behavior: identity + disabled) plus the display
 * string this styled shell renders. Deriving rather than redeclaring keeps the two layers one type:
 * `tabs` is handed straight to `useTabs` below, so the assignability was always load-bearing.
 */
export interface TabItem extends HeadlessTabItem {
    label: string
}

// OriTabs — an accessible tabs widget driven by the headless `useTabs` (WAI-ARIA tabs, automatic
// activation). The composable owns selection + the roving-tabindex keyboard model + the ARIA prop bags
// (tablist / tab / tabpanel ids, aria-selected, aria-controls, aria-labelledby, roving tabindex, disabled
// skip); this SFC renders the styled shell and spreads the bags. The active indicator (underline / pill)
// is driven by the `aria-selected` attribute selector, not a class, matching the rest of oriUI.
//
// Panel content: `#panel-<value>` gives a tab its own markup; the scoped `#default="{ tab }"` slot is a
// shared template rendered into the ACTIVE panel only, so ids inside it never repeat (state inside it
// does not survive a tab switch — use `#panel-<value>` for that). The `panel-` prefix keeps
// caller-derived slot names from colliding with reserved ones like `#tab`. `tabs` is required.
const {
    color = 'primary',
    label,
    orientation = 'horizontal',
    tabs
} = defineProps<{
    /** Active-tab accent (indicator + focus ring). */
    color?: ThemeColor
    /** Accessible name for the tablist (→ `aria-label`; WAI-ARIA recommends naming a tablist). */
    label?: string
    orientation?: Orientation
    tabs: TabItem[]
}>()

const model = defineModel<string | number>()

const { selectedValue, tablistProps, getTabProps, getPanelProps } = useTabs(() => ({
    tabs,
    value: model.value,
    orientation,
    label,
    onChange: (value) => {
        model.value = value
    }
}))

// Seed / recover the caller's v-model to the resolved selection (a component policy — keeps the parent's
// bound value valid without forcing them to seed it). `selectedValue` collapses an invalid bound value
// (unset / missing / disabled) to the first enabled tab; reconcile on EITHER it OR the bound value
// changing, so a v-model set to a disabled/missing tab is healed back even when the displayed tab (and
// thus `selectedValue`) does not change.
watch(
    [selectedValue, () => model.value],
    ([resolved, current]) => {
        if (resolved !== undefined && resolved !== current) model.value = resolved
    },
    { immediate: true }
)

// A `#panel-<value>` slot whose value is a typo, or whose tab was removed, consumes nothing and Vue says
// nothing, so the panel renders the `#default` fallback (or empty) and the caller sees a blank tab. Exact
// match against the tab values — with one guard: an EMPTY `tabs` is how a caller spells "not loaded yet",
// and every declared panel slot is an orphan against an empty set, so the check would cry on correct code
// on every render until the fetch resolved. Development builds only.
if (process.env.NODE_ENV !== 'production') {
    const slots = useSlots()
    watchEffect(() => {
        if (tabs.length === 0) return
        const values = new Set(tabs.map((tab) => `panel-${tab.value}`))
        const orphans = Object.keys(slots).filter((name) => name.startsWith('panel-') && !values.has(name))
        if (orphans.length)
            console.warn(
                `[OriTabs] panel slot(s) #${orphans.join(', #')} match no tab value — check the spelling ` +
                    `against \`tabs\` (${tabs.map((tab) => tab.value).join(', ')}).`
            )
    })
}
</script>

<template>
    <div :class="['ori-tabs', `ori-color_${color}`, { 'ori-tabs_vertical': orientation === 'vertical' }]">
        <div v-bind="tablistProps" class="ori-tabs__list">
            <button
                v-for="(tab, index) in tabs"
                :key="tab.value"
                v-bind="getTabProps(tab, index)"
                class="ori-tabs__tab"
            >
                <slot name="tab" :tab="tab">{{ tab.label }}</slot>
            </button>
        </div>

        <div v-for="(tab, index) in tabs" :key="tab.value" v-bind="getPanelProps(tab, index)" class="ori-tabs__panel">
            <slot :name="`panel-${tab.value}`" :tab="tab">
                <slot v-if="tab.value === selectedValue" :tab="tab" />
            </slot>
        </div>
    </div>
</template>
