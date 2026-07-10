<script lang="ts" setup>
import { computed, ref, useId, watch } from 'vue';
import type { ThemeColor } from '../../types';

interface TabItem {
    value: string | number;
    label: string;
    disabled?: boolean;
}

// OriTabs — an accessible tabs widget with a hand-rolled roving-tabindex + WAI-ARIA keyboard model
// (no behaviour engine; this is in-scope hand-rolling, not a primitive). The tablist owns
// role="tablist" + aria-orientation; each tab is a real <button role="tab"> carrying id,
// aria-selected, aria-controls and a roving tabindex (active = 0, the rest = -1); only the active
// panel (role="tabpanel", aria-labelledby its tab, tabindex 0) renders. Activation is automatic —
// arrows move focus AND select. v-model holds the active tab value and defaults to the first
// non-disabled tab. The active indicator (underline / pill) is driven by the aria-selected attribute
// selector, not a class, matching the rest of oriUI.
//
// Panel content: a per-value named slot (`#<value>`) is the primary mechanism — distinct markup per
// tab; a scoped `#default="{ tab }"` slot is the fallback (shared template that reads the active tab).
// `tabs` is the one required prop — the component is meaningless without its set of tabs.
const {
    color = 'primary',
    orientation = 'horizontal',
    tabs
} = defineProps<{
    /** Active-tab accent (indicator + focus ring). */
    color?: ThemeColor;
    orientation?: 'horizontal' | 'vertical';
    tabs: TabItem[];
}>();

const model = defineModel<string | number>();

// SSR-safe id base (Vue 3.5); tab/panel ids are derived per index so each pair is stable + unique.
const uid = useId();
const tabId = (index: number) => `${uid}-tab-${index}`;
const panelId = (index: number) => `${uid}-panel-${index}`;

// The tablist element; arrow keys resolve the target tab by live DOM order from here, rather than a
// v-for ref array (Vue does not guarantee a v-for ref array matches the source order, and it isn't
// reset between renders — both would misfocus after a runtime reorder/removal).
const tablistRef = ref<HTMLElement>();
const focusTab = (index: number) => {
    tablistRef.value?.querySelectorAll<HTMLButtonElement>('[role="tab"]')[index]?.focus();
};

const firstEnabledValue = computed(() => tabs.find((tab) => !tab.disabled)?.value);
const selectedValue = computed(() => model.value ?? firstEnabledValue.value);

// Default the model to the first non-disabled tab, and recover if the bound value points at a missing
// or disabled tab — keeping a valid selection without forcing the caller to seed v-model.
watch(
    [() => tabs, () => model.value],
    () => {
        const current = tabs.find((tab) => tab.value === model.value);
        if (model.value === undefined || !current || current.disabled) {
            if (firstEnabledValue.value !== undefined) {
                model.value = firstEnabledValue.value;
            }
        }
    },
    { immediate: true }
);

const select = (tab: TabItem) => {
    if (tab.disabled) return;
    model.value = tab.value;
};

// Move selection (automatic activation) to the next non-disabled tab in `direction`, wrapping around,
// then focus it. `from` is the index to start scanning from.
const moveTo = (from: number, direction: 1 | -1) => {
    const count = tabs.length;
    if (count === 0) return;

    for (let step = 1; step <= count; step += 1) {
        const index = (from + direction * step + count * step) % count;
        const tab = tabs[index];
        if (tab && !tab.disabled) {
            select(tab);
            focusTab(index);
            return;
        }
    }
};

// Jump to the first / last non-disabled tab (Home / End).
const moveToEdge = (edge: 'first' | 'last') => {
    const start = edge === 'first' ? 0 : tabs.length - 1;
    const direction = edge === 'first' ? 1 : -1;

    for (let index = start; index >= 0 && index < tabs.length; index += direction) {
        const tab = tabs[index];
        if (tab && !tab.disabled) {
            select(tab);
            focusTab(index);
            return;
        }
    }
};

const onKeydown = (event: KeyboardEvent, index: number) => {
    const next = orientation === 'vertical' ? 'ArrowDown' : 'ArrowRight';
    const prev = orientation === 'vertical' ? 'ArrowUp' : 'ArrowLeft';

    switch (event.key) {
        case next:
            event.preventDefault();
            moveTo(index, 1);
            break;
        case prev:
            event.preventDefault();
            moveTo(index, -1);
            break;
        case 'Home':
            event.preventDefault();
            moveToEdge('first');
            break;
        case 'End':
            event.preventDefault();
            moveToEdge('last');
            break;
    }
};
</script>

<template>
    <div :class="['ori-tabs', `ori-color_${color}`, { 'ori-tabs_vertical': orientation === 'vertical' }]">
        <div ref="tablistRef" class="ori-tabs__list" role="tablist" :aria-orientation="orientation">
            <button
                v-for="(tab, index) in tabs"
                :id="tabId(index)"
                :key="tab.value"
                class="ori-tabs__tab"
                type="button"
                role="tab"
                :disabled="tab.disabled"
                :aria-selected="tab.value === selectedValue ? 'true' : 'false'"
                :aria-controls="panelId(index)"
                :tabindex="tab.value === selectedValue ? 0 : -1"
                @click="select(tab)"
                @keydown="onKeydown($event, index)"
            >
                <slot name="tab" :tab="tab">{{ tab.label }}</slot>
            </button>
        </div>

        <div
            v-for="(tab, index) in tabs"
            :id="panelId(index)"
            :key="tab.value"
            class="ori-tabs__panel"
            role="tabpanel"
            :aria-labelledby="tabId(index)"
            :hidden="tab.value !== selectedValue"
            tabindex="0"
        >
            <slot :name="String(tab.value)" :tab="tab">
                <slot :tab="tab" />
            </slot>
        </div>
    </div>
</template>
