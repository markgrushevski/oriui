import { derived, get } from 'svelte/store';
import { isTargetOutside } from '../core';
import { safeOnDestroy, toReadable, type MaybeReactive } from './use-store';

/**
 * Headless dismiss layer (Svelte) — the store twin of the Vue `useDismissable`, sharing the pure
 * `isTargetOutside` predicate. While `enabled`, it attaches `document` listeners — `pointerdown` (if
 * `pointerDownOutside`) and/or `focusin` (if `focusOutside`) — and calls `onDismiss()` when the event lands
 * OUTSIDE every element in `elements()`. Options may be a plain object or a store; listeners are removed when
 * `enabled` flips false or the component is destroyed.
 */
export interface UseDismissableOptions {
    /** Attach the dismiss listeners only while this is true (typically the overlay's `open`). */
    enabled: boolean;
    /** The overlay's own elements — an interaction inside ANY of them does NOT dismiss. */
    elements: () => (HTMLElement | null | undefined)[];
    /** Called to dismiss — typically `() => setOpen(false)`. */
    onDismiss: () => void;
    /** Close on a `pointerdown` outside `elements` (default false). */
    pointerDownOutside?: boolean;
    /** Close when focus lands outside `elements` (default false). */
    focusOutside?: boolean;
}

export function useDismissable(options: MaybeReactive<UseDismissableOptions>): void {
    const opts$ = toReadable(options);
    let teardown: (() => void) | undefined;

    const stop = (): void => {
        teardown?.();
        teardown = undefined;
    };

    const start = (o: UseDismissableOptions): void => {
        const handler = (event: Event): void => {
            if (isTargetOutside(event.target as Node | null, o.elements())) o.onDismiss();
        };
        const types: string[] = [];
        if (o.pointerDownOutside) types.push('pointerdown');
        if (o.focusOutside) types.push('focusin');
        types.forEach((type) => document.addEventListener(type, handler));
        teardown = () => types.forEach((type) => document.removeEventListener(type, handler));
    };

    // React to `enabled` only (derived dedupes the primitive), reading the full current options on attach.
    const stopSub = derived(opts$, (o) => o.enabled).subscribe((enabled) => {
        stop();
        if (enabled) start(get(opts$));
    });

    safeOnDestroy(() => {
        stopSub();
        stop();
    });
}
