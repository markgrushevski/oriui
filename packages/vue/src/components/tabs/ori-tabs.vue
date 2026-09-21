<script lang="ts" setup>
import { useSlots, watch, watchEffect } from 'vue'
import { useTabs, type TabItem as HeadlessTabItem } from '@oriui/headless/vue'
import type { ThemeColor } from '../../types'

/**
 * A tab in `<OriTabs>` — the headless `TabItem` (behaviour: identity + disabled) plus the display
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
// Panel content: a per-value named slot (`#panel-<value>`) is the primary mechanism — distinct markup
// per tab; a scoped `#default="{ tab }"` slot is the fallback (shared template that reads the active
// tab). The fallback renders into the ACTIVE panel ONLY (ORI-I-84). It used to render into every one,
// which multiplied a template that ignored its scope: a login form in `#default` produced two copies of
// every `id`, and `getElementById` — so `<label for>` — resolved to the copy in the HIDDEN panel
// whenever the active tab was not the first. One panel, one content is now the rule for every slot in
// this component, the fallback included, and the scope it hands out is always the active tab. The cost
// is that uncontrolled DOM state inside a shared template (an unsent draft) does not survive a tab
// switch — that is what `#panel-<value>` is for. The `panel-` prefix is load-bearing, not decoration:
// panel slot names are caller DATA (a tab's
// `value`), and named slots are one flat namespace, so an unprefixed `#<value>` let a tab valued "tab"
// resolve its panel to this component's own reserved `#tab` (the label renderer) — rendering that
// template into the panel AND leaving the panel's real content unreachable. Prefixing moves the
// data-derived names into their own namespace, where no caller value can ever collide with a reserved
// one. `tabs` is the one required prop — the component is meaningless without its set of tabs.
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
    orientation?: 'horizontal' | 'vertical'
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

// Panel slots gained their `panel-` prefix before 1.0 (see the note above). A caller still passing the
// old bare `#<value>` gets a SILENT miss — Vue never warns about an unconsumed slot — so the panel
// would fall back to `#default`, or render empty. Name the rename instead. `tab` and `default` are
// this component's own reserved slots, so a tab valued "tab" must not be reported: that template is
// legitimately the label renderer, which is the very collision the prefix removed. DEV-only; the
// `import.meta.env.DEV` constant drops the block from the production bundle.
if (import.meta.env.DEV) {
    const slots = useSlots()
    const reserved = ['tab', 'default']
    watchEffect(() => {
        const stale = tabs
            .map((tab) => String(tab.value))
            .filter((value) => !reserved.includes(value) && slots[value] && !slots[`panel-${value}`])
        if (stale.length)
            console.warn(
                `[OriTabs] panel slot(s) #${stale.join(', #')} are unused — per-value panel slots are now ` +
                    `named \`#panel-<value>\` (e.g. #panel-${stale[0]}), so a tab's value can never collide ` +
                    'with the reserved #tab / #default slots.'
            )

        // The other half of the same silence: a correctly PREFIXED slot whose value is a typo, or
        // whose tab was removed. It consumes nothing and Vue says nothing, so the panel renders the
        // `#default` fallback (or empty) and the caller sees a blank tab. Exact match against the
        // tab values — with one guard: an EMPTY `tabs` is how a caller spells "not loaded yet", and
        // every declared panel slot is an orphan against an empty set, so the check would cry on
        // correct code on every render until the fetch resolved.
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
