import { useCallback, useId, type KeyboardEvent } from 'react';
import { resolveRovingIndex, rovingIntent, type RovingOrientation } from '../core';

/**
 * Headless WAI-ARIA Tabs (https://www.w3.org/WAI/ARIA/apg/patterns/tabs/, **automatic activation**) — the
 * React twin of the Vue / Svelte `useTabs`, sharing the pure index/key math in `../core/roving`.
 * Data-driven (you pass the `tabs` array plus the selected value), so — unlike the compositional
 * `useToolbar` — there is no context and no machine, just React state/ids over the shared roving helpers.
 * Prop bags carry React-native casing directly (`onClick` / `onKeyDown` / `tabIndex`), so they need no
 * `normalizeProps` pass. Automatic activation = arrows move focus AND select; the tablist owns one keydown
 * handler that resolves the target tab by live DOM order, skipping disabled tabs.
 */
export interface TabItem {
    value: string | number;
    disabled?: boolean;
}

export interface UseTabsOptions {
    /** The set of tabs, in order. */
    tabs: TabItem[];
    /** The controlled selection (bind to your value); resolves to the first enabled tab when unset. */
    value: string | number | undefined;
    /** 'horizontal' (default) navigates Left/Right; 'vertical' navigates Up/Down. */
    orientation?: RovingOrientation;
    /** Accessible name for the tablist → `aria-label` (WAI-ARIA recommends naming the tablist). */
    label?: string;
    /** Accessible name by element id → `aria-labelledby` (use instead of `label`). */
    labelledby?: string;
    /** SSR-stable id base for the derived tab/panel ids; defaults to `useId()`. */
    idBase?: string;
    /** Commit the next selected value (wire to your controlled value). */
    onChange?: (value: string | number) => void;
}

export function useTabs(options: UseTabsOptions) {
    const { tabs, value, orientation = 'horizontal', label, labelledby, idBase, onChange } = options;

    // `useId()` is SSR-stable; strip the colons React wraps ids in so the derived ids stay valid selectors.
    const autoId = useId().replace(/:/g, '');
    const base = idBase ?? autoId;

    // The effective selection: the bound value when it points at a real, enabled tab; otherwise recover to
    // the first enabled tab (so a panel is always valid without forcing the caller to seed the value).
    const firstEnabled = tabs.find((tab) => !tab.disabled)?.value;
    const current = value != null ? tabs.find((tab) => tab.value === value) : undefined;
    const selectedValue = current && !current.disabled ? value : firstEnabled;

    const select = useCallback(
        (tab: TabItem): void => {
            if (!tab.disabled) onChange?.(tab.value);
        },
        [onChange]
    );

    // Bound once on the tablist → currentTarget IS the tablist; the focused tab is event.target. Resolve
    // the target by live DOM order, skip disabled, wrap, then select + focus it (automatic activation).
    const onKeyDown = useCallback(
        (event: KeyboardEvent<HTMLElement>): void => {
            const intent = rovingIntent(event.key, orientation);
            if (!intent) return;

            const root = event.currentTarget;
            const target = event.target as HTMLElement;
            const buttons = Array.from(root.querySelectorAll<HTMLElement>('[role="tab"]'));
            const currentTab = target.closest<HTMLElement>('[role="tab"]');
            const from = currentTab ? buttons.indexOf(currentTab) : -1;
            const to = resolveRovingIndex(intent, from, tabs.length, true, (i) => !tabs[i]?.disabled);
            const tab = to >= 0 ? tabs[to] : undefined;
            if (!tab) return;

            event.preventDefault();
            select(tab); // automatic activation
            buttons[to]?.focus();
        },
        [orientation, tabs, select]
    );

    const tablistProps = {
        role: 'tablist' as const,
        'aria-orientation': orientation,
        'aria-label': label,
        'aria-labelledby': labelledby,
        onKeyDown
    };

    /** Props for one tab `<button>`: id, role, aria-selected, aria-controls, roving tabIndex, disabled, click. */
    const getTabProps = (tab: TabItem, index: number) => {
        const selected = tab.value === selectedValue;
        return {
            id: `${base}-tab-${index}`,
            type: 'button' as const,
            role: 'tab' as const,
            'aria-selected': selected ? ('true' as const) : ('false' as const),
            'aria-controls': `${base}-panel-${index}`,
            tabIndex: selected ? 0 : -1,
            disabled: tab.disabled,
            onClick: () => select(tab)
        };
    };

    /** Props for one panel: id, role, aria-labelledby (its tab), hidden when not selected, focusable. */
    const getPanelProps = (tab: TabItem, index: number) => ({
        id: `${base}-panel-${index}`,
        role: 'tabpanel' as const,
        'aria-labelledby': `${base}-tab-${index}`,
        hidden: tab.value !== selectedValue,
        tabIndex: 0
    });

    return { selectedValue, select, tablistProps, getTabProps, getPanelProps };
}
