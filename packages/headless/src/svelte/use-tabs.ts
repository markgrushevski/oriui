import { derived, get, type Readable } from 'svelte/store';
import { resolveRovingIndex, rovingIntent, type RovingOrientation } from '../core';
import { uid } from './id';
import { toReadable, type MaybeReactive } from './use-store';

/**
 * Headless WAI-ARIA Tabs (https://www.w3.org/WAI/ARIA/apg/patterns/tabs/, **automatic activation**) — the
 * Svelte twin of the Vue `useTabs`, sharing the pure index/key math in `../core/roving`. Data-driven (the
 * styled component renders a `tabs` array), so — unlike the compositional `useToolbar` — there is no Svelte
 * context; options are a `MaybeReactive<T>` (a snapshot object OR a store) and the prop bags are `Readable`
 * stores. The item / panel getters are **stores of functions** (`$getTabProps(tab, i)`), re-emitting when
 * the selection changes. Automatic activation = arrows move focus AND select; the tablist owns one keydown
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
    /** SSR-stable id base for the derived tab/panel ids; defaults to a module-unique id. */
    idBase?: string;
    /** Commit the next selected value (wire to your bound value). */
    onChange?: (value: string | number) => void;
}

export function useTabs(options: MaybeReactive<UseTabsOptions>) {
    const opts$ = toReadable(options);
    const fallback = uid('ori-tabs');
    const base = (): string => get(opts$).idBase ?? fallback;
    const tabId = (index: number): string => `${base()}-tab-${index}`;
    const panelId = (index: number): string => `${base()}-panel-${index}`;

    // The effective selection: the bound value when it points at a real, enabled tab; otherwise recover to
    // the first enabled tab (so the panel is always valid without forcing the caller to seed the value).
    const selectedValue = derived(opts$, (o) => {
        const first = o.tabs.find((t) => !t.disabled)?.value;
        const current = o.value != null ? o.tabs.find((t) => t.value === o.value) : undefined;
        return current && !current.disabled ? o.value : first;
    });

    function select(tab: TabItem): void {
        if (tab.disabled) return;
        get(opts$).onChange?.(tab.value);
    }

    // Bound once on the tablist → currentTarget IS the tablist; the focused tab is event.target. Resolve the
    // target by live DOM order, skip disabled, wrap, then select + focus it (automatic activation).
    function onkeydown(event: KeyboardEvent): void {
        const o = get(opts$);
        const intent = rovingIntent(event.key, o.orientation ?? 'horizontal');
        if (!intent) return;

        const root = event.currentTarget as HTMLElement | null;
        const target = event.target as HTMLElement | null;
        if (!root || !target) return;

        const buttons = Array.from(root.querySelectorAll<HTMLElement>('[role="tab"]'));
        const current = target.closest<HTMLElement>('[role="tab"]');
        const from = current ? buttons.indexOf(current) : -1;
        const to = resolveRovingIndex(intent, from, o.tabs.length, true, (i) => !o.tabs[i]?.disabled);
        const tab = to >= 0 ? o.tabs[to] : undefined;
        if (!tab) return;

        event.preventDefault();
        select(tab);
        buttons[to]?.focus();
    }

    const tablistProps = derived(opts$, (o) => ({
        role: 'tablist' as const,
        'aria-orientation': o.orientation ?? 'horizontal',
        onkeydown
    }));

    const getTabProps: Readable<(tab: TabItem, index: number) => Record<string, unknown>> = derived(
        selectedValue,
        (sel) => (tab: TabItem, index: number) => {
            const selected = tab.value === sel;
            return {
                id: tabId(index),
                type: 'button' as const,
                role: 'tab' as const,
                'aria-selected': selected ? ('true' as const) : ('false' as const),
                'aria-controls': panelId(index),
                tabindex: selected ? 0 : -1,
                disabled: tab.disabled,
                onclick: () => select(tab)
            };
        }
    );

    const getPanelProps: Readable<(tab: TabItem, index: number) => Record<string, unknown>> = derived(
        selectedValue,
        (sel) => (tab: TabItem, index: number) => ({
            id: panelId(index),
            role: 'tabpanel' as const,
            'aria-labelledby': tabId(index),
            hidden: tab.value !== sel,
            tabindex: 0
        })
    );

    return { selectedValue, select, tablistProps, getTabProps, getPanelProps };
}
