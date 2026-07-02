import { computed, toValue, useId, watch, type MaybeRefOrGetter } from 'vue';
import { menu, type MenuItem } from '../core';
import { normalizeProps } from './normalize-props';
import { useService } from './use-machine';

export interface UseMenuOptions {
    /** Stable base id; auto-generated via `useId` when omitted. */
    id?: string;
    /** The menu items, in render order. Reactive — navigation re-syncs when it changes. */
    items: MenuItem[];
    disabled?: boolean;
    /** Fired when an item is activated (click / Enter / Space). The menu then closes. */
    onSelect?: (value: string) => void;
}

/**
 * Headless menu (WAI-ARIA menu-button + roving tabindex) on the `@oriui/headless` core. Returns
 * ready-to-`v-bind` prop bags plus `open` / `highlightedValue`, which the UI watches to move real DOM
 * focus (roving requires it) and to wire click-outside / focus-return — a framework-agnostic projection
 * can't touch the DOM itself. Build any UI on top, or use the styled `OriMenu`.
 */
export function useMenu(options: MaybeRefOrGetter<UseMenuOptions>) {
    const opts = computed(() => toValue(options));
    const init = opts.value;

    const service = menu.machine({
        id: init.id ?? useId() ?? 'menu',
        disabled: init.disabled
    });
    const version = useService(service);

    // Keep `disabled` reactive past the initial render.
    watch(
        () => opts.value.disabled ?? false,
        (disabled) => service.send({ type: 'SET_DISABLED', disabled })
    );

    const items = computed<MenuItem[]>(() => opts.value.items);

    const api = computed(() => {
        void version.value;
        return menu.connect(service, normalizeProps, items.value, opts.value.onSelect);
    });

    return {
        open: computed(() => api.value.open),
        highlightedValue: computed(() => api.value.highlightedValue),
        items,
        triggerProps: computed(() => api.value.getTriggerProps()),
        contentProps: computed(() => api.value.getContentProps()),
        separatorProps: computed(() => api.value.getSeparatorProps()),
        getItemProps: (item: MenuItem, index: number) => api.value.getItemProps(item, index),
        getItemState: (item: MenuItem) => api.value.getItemState(item),
        setOpen: (open: boolean) => api.value.setOpen(open),
        highlight: (value: string | null) => api.value.highlight(value),
        highlightFirst: () => api.value.highlightFirst(),
        highlightLast: () => api.value.highlightLast()
    };
}
