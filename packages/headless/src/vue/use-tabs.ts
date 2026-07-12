import { computed, useId } from 'vue';
import { resolveRovingIndex, rovingIntent, type RovingOrientation } from '../core';

// Fallback id source when `useId()` is unavailable (called outside an app context); the composable is
// intended for component setup, where useId() always resolves.
let fallbackId = 0;

/**
 * Headless WAI-ARIA Tabs (https://www.w3.org/WAI/ARIA/apg/patterns/tabs/, **automatic activation**).
 * Unlike the compositional `useToolbar` (arbitrary slotted items behind provide/inject), Tabs is
 * **data-driven** — the styled component renders a `tabs` array — so this mirrors `useColorPicker` /
 * `useCombobox`: pass the array + the selected value as a getter, get back a `tablist` prop bag plus
 * per-tab / per-panel prop-getters. The tablist owns a single roving keydown handler that resolves the
 * target tab by live DOM order (`querySelectorAll`, robust to reorders) via the shared `../core/roving`
 * index math, **skipping disabled tabs** (the `isEnabled` predicate that core docs call "the Tabs model").
 * Automatic activation = arrows move focus AND select. Real DOM focus, not `aria-activedescendant`.
 */
export interface TabItem {
    value: string | number;
    disabled?: boolean;
}

export interface UseTabsOptions {
    /** The set of tabs, in order. */
    tabs: TabItem[];
    /** The controlled selection (bind to `v-model`); resolves to the first enabled tab when unset. */
    value: string | number | undefined;
    /** 'horizontal' (default) navigates Left/Right; 'vertical' navigates Up/Down. */
    orientation?: RovingOrientation;
    /** Accessible name for the tablist → `aria-label` (WAI-ARIA recommends naming the tablist). */
    label?: string;
    /** Accessible name by element id → `aria-labelledby` (use instead of `label`). */
    labelledby?: string;
    /** SSR-stable id base for the derived tab/panel ids; defaults to `useId()`. */
    idBase?: string;
    /** Commit the next selected value (wire to your `v-model`). */
    onChange?: (value: string | number) => void;
}

export function useTabs(options: () => UseTabsOptions) {
    const opts = () => options();
    const tabs = () => opts().tabs;
    const orientation = (): RovingOrientation => opts().orientation ?? 'horizontal';

    const uid = useId() ?? `ori-tabs-${(fallbackId += 1)}`;
    const base = () => opts().idBase ?? uid;
    const tabId = (index: number) => `${base()}-tab-${index}`;
    const panelId = (index: number) => `${base()}-panel-${index}`;

    const firstEnabledValue = computed(() => tabs().find((tab) => !tab.disabled)?.value);
    // The effective selection: the bound value when it points at a real, enabled tab; otherwise recover to
    // the first enabled tab (so the panel is always valid without forcing the caller to seed v-model).
    const selectedValue = computed(() => {
        const v = opts().value;
        const current = v != null ? tabs().find((tab) => tab.value === v) : undefined;
        return current && !current.disabled ? v : firstEnabledValue.value;
    });

    function select(tab: TabItem): void {
        if (tab.disabled) return;
        opts().onChange?.(tab.value);
    }

    // Bound once on the tablist (tablistProps.onKeydown) → currentTarget IS the tablist; the focused tab is
    // event.target. Resolve the target by live DOM order, skip disabled, wrap, then select + focus it.
    function onKeydown(event: KeyboardEvent): void {
        const intent = rovingIntent(event.key, orientation());
        if (!intent) return;

        const root = event.currentTarget as HTMLElement | null;
        const target = event.target as HTMLElement | null;
        if (!root || !target) return;

        const list = tabs();
        const buttons = Array.from(root.querySelectorAll<HTMLElement>('[role="tab"]'));
        const current = target.closest<HTMLElement>('[role="tab"]');
        const from = current ? buttons.indexOf(current) : -1;
        const to = resolveRovingIndex(intent, from, list.length, true, (i) => !list[i]?.disabled);
        const tab = to >= 0 ? list[to] : undefined;
        if (!tab) return;

        event.preventDefault();
        select(tab); // automatic activation
        buttons[to]?.focus();
    }

    const tablistProps = computed(() => ({
        role: 'tablist' as const,
        'aria-orientation': orientation(),
        'aria-label': opts().label,
        'aria-labelledby': opts().labelledby,
        onKeydown
    }));

    /** Props for one tab `<button>`: id, role, aria-selected, aria-controls, roving tabindex, disabled, click. */
    function getTabProps(tab: TabItem, index: number) {
        const selected = tab.value === selectedValue.value;
        return {
            id: tabId(index),
            type: 'button' as const,
            role: 'tab' as const,
            'aria-selected': selected ? ('true' as const) : ('false' as const),
            'aria-controls': panelId(index),
            tabindex: selected ? 0 : -1,
            disabled: tab.disabled,
            onClick: () => select(tab)
        };
    }

    /** Props for one panel: id, role, aria-labelledby (its tab), hidden when not selected, focusable. */
    function getPanelProps(tab: TabItem, index: number) {
        return {
            id: panelId(index),
            role: 'tabpanel' as const,
            'aria-labelledby': tabId(index),
            hidden: tab.value !== selectedValue.value,
            tabindex: 0
        };
    }

    return { selectedValue, select, tablistProps, getTabProps, getPanelProps };
}
