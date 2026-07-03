import { derived, get, readable } from 'svelte/store';
import { menu, type MenuItem } from '../core';
import { uid } from './id';
import { normalizeProps } from './normalize-props';
import { connectStore } from './use-store';

export interface UseMenuOptions {
    /** Stable base id; auto-generated when omitted (pass one for SSR). */
    id?: string;
    /** The menu items, in render order. Read once at creation — see the reactivity note below. */
    items: MenuItem[];
    disabled?: boolean;
    /** Fired when an item is activated (click / Enter / Space). The menu then closes. */
    onSelect?: (value: string) => void;
}

/**
 * Headless menu (WAI-ARIA menu-button + roving tabindex) on the shared `@oriui/headless` core — the
 * Svelte twin of the Vue `useMenu`. Returns Svelte stores of the prop bags plus `open` /
 * `highlightedValue` (the UI watches these to move real DOM focus — roving requires it — and to wire
 * click-outside / focus-return, which a framework-agnostic projection can't do itself). Item
 * prop-getters are stores of a function (`$getItemProps(item, i)`).
 *
 * Reactivity note: `items` / `disabled` are read once at creation; the interactive open/highlight state
 * is fully reactive through the stores. Build any UI on top, or use the styled `OriMenu`.
 */
export function useMenu(options: UseMenuOptions) {
    const service = menu.machine({
        id: options.id ?? uid('menu'),
        disabled: options.disabled
    });
    const items = options.items;

    const api = connectStore(service, () => menu.connect(service, normalizeProps, items, options.onSelect));

    return {
        open: derived(api, (a) => a.open),
        highlightedValue: derived(api, (a) => a.highlightedValue),
        items: readable(items),
        triggerProps: derived(api, (a) => a.getTriggerProps()),
        contentProps: derived(api, (a) => a.getContentProps()),
        separatorProps: derived(api, (a) => a.getSeparatorProps()),
        getItemProps: derived(api, (a) => (item: MenuItem, index: number) => a.getItemProps(item, index)),
        getItemState: derived(api, (a) => (item: MenuItem) => a.getItemState(item)),
        setOpen: (open: boolean) => get(api).setOpen(open),
        highlight: (value: string | null) => get(api).highlight(value),
        highlightFirst: () => get(api).highlightFirst(),
        highlightLast: () => get(api).highlightLast()
    };
}
