import { derived, get } from 'svelte/store';
import { menu, type MenuItem } from '../core';
import { uid } from './id';
import { normalizeProps } from './normalize-props';
import { safeOnDestroy, serviceVersion, toReadable, type MaybeReactive } from './use-store';

export interface UseMenuOptions {
    /** Stable base id; auto-generated when omitted (pass one for SSR). */
    id?: string;
    /** The menu items, in render order. Reactive when the whole options object is passed as a store. */
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
 * Options are a `MaybeReactive<UseMenuOptions>`: pass a plain object for a fixed menu, or a Svelte store
 * to react to external changes — `items` and `onSelect` are re-read on change and `disabled` is pushed
 * into the machine. Build any UI on top, or use the styled `OriMenu`.
 */
export function useMenu(options: MaybeReactive<UseMenuOptions>) {
    const opts$ = toReadable(options);
    const initial = get(opts$);

    const service = menu.machine({
        id: initial.id ?? uid('menu'),
        disabled: initial.disabled
    });

    // Keep `disabled` in sync past creation. A store input drives it; a plain object emits once → no-op.
    let lastDisabled = initial.disabled ?? false;
    safeOnDestroy(
        opts$.subscribe((o) => {
            const next = o.disabled ?? false;
            if (next === lastDisabled) return;
            lastDisabled = next;
            service.send({ type: 'SET_DISABLED', disabled: next });
        })
    );

    const version$ = serviceVersion(service);

    // Recompute on machine changes (version$) AND option changes (opts$ — items / onSelect).
    const api = derived([version$, opts$], ([, o]) => menu.connect(service, normalizeProps, o.items, o.onSelect));

    return {
        open: derived(api, (a) => a.open),
        highlightedValue: derived(api, (a) => a.highlightedValue),
        items: derived(opts$, (o) => o.items),
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
