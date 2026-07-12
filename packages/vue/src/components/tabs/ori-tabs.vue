<script lang="ts" setup>
import { watch } from 'vue';
import { useTabs } from '@oriui/headless/vue';
import type { ThemeColor } from '../../types';

interface TabItem {
    value: string | number;
    label: string;
    disabled?: boolean;
}

// OriTabs — an accessible tabs widget driven by the headless `useTabs` (WAI-ARIA tabs, automatic
// activation). The composable owns selection + the roving-tabindex keyboard model + the ARIA prop bags
// (tablist / tab / tabpanel ids, aria-selected, aria-controls, aria-labelledby, roving tabindex, disabled
// skip); this SFC renders the styled shell and spreads the bags. The active indicator (underline / pill)
// is driven by the `aria-selected` attribute selector, not a class, matching the rest of oriUI.
//
// Panel content: a per-value named slot (`#<value>`) is the primary mechanism — distinct markup per tab;
// a scoped `#default="{ tab }"` slot is the fallback (shared template that reads the active tab). `tabs`
// is the one required prop — the component is meaningless without its set of tabs.
const {
    color = 'primary',
    label,
    orientation = 'horizontal',
    tabs
} = defineProps<{
    /** Active-tab accent (indicator + focus ring). */
    color?: ThemeColor;
    /** Accessible name for the tablist (→ `aria-label`; WAI-ARIA recommends naming a tablist). */
    label?: string;
    orientation?: 'horizontal' | 'vertical';
    tabs: TabItem[];
}>();

const model = defineModel<string | number>();

const { selectedValue, tablistProps, getTabProps, getPanelProps } = useTabs(() => ({
    tabs,
    value: model.value,
    orientation,
    label,
    onChange: (value) => {
        model.value = value;
    }
}));

// Seed / recover the caller's v-model to the resolved selection (a component policy — keeps the parent's
// bound value valid without forcing them to seed it). `selectedValue` collapses an invalid bound value
// (unset / missing / disabled) to the first enabled tab; reconcile on EITHER it OR the bound value
// changing, so a v-model set to a disabled/missing tab is healed back even when the displayed tab (and
// thus `selectedValue`) does not change.
watch(
    [selectedValue, () => model.value],
    ([resolved, current]) => {
        if (resolved !== undefined && resolved !== current) model.value = resolved;
    },
    { immediate: true }
);
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
            <slot :name="String(tab.value)" :tab="tab">
                <slot :tab="tab" />
            </slot>
        </div>
    </div>
</template>
