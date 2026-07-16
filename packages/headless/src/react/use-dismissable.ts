import { useEffect, useRef } from 'react';
import { isTargetOutside } from '../core';

/**
 * Headless dismiss layer (React) — the shared "close the overlay on an outside interaction" glue for
 * non-platform overlays (Menu, Combobox), the pattern Radix `DismissableLayer` / Floating-UI `useDismiss`
 * standardise; the React twin of the Vue / Svelte `useDismissable`, sharing the pure `isTargetOutside`
 * predicate in `../core/dismiss`. (Popover / Dialog get this free from the native `[popover]` / `<dialog>`
 * top-layer; Escape already lives in the core connects.) While `enabled`, it attaches `document` listeners
 * — `pointerdown` (if `pointerDownOutside`) and/or `focusin` (if `focusOutside`) — and calls `onDismiss()`
 * when the event lands OUTSIDE every element in `elements()`. Each overlay picks the strategy that fits it:
 * a menu (no single focus anchor) uses pointerdown-outside; a combobox (focus on its input) uses focus-out.
 * Listeners are removed when `enabled` flips false or the component unmounts.
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

export function useDismissable(options: UseDismissableOptions): void {
    const { enabled, pointerDownOutside = false, focusOutside = false } = options;

    // Mirror the newest options into a ref every render so the (rarely re-subscribed) document listener
    // reads the current `elements()` / `onDismiss` — never a stale closure — while the subscribe effect below
    // re-runs only when the listener *set* changes (enabled / which strategies), not on every options change.
    const latest = useRef(options);
    useEffect(() => {
        latest.current = options;
    });

    useEffect(() => {
        if (!enabled) return;

        const handler = (event: Event): void => {
            const o = latest.current;
            if (isTargetOutside(event.target as Node | null, o.elements())) o.onDismiss();
        };
        const types: string[] = [];
        if (pointerDownOutside) types.push('pointerdown');
        if (focusOutside) types.push('focusin');
        // Capture phase (like Radix DismissableLayer / Floating-UI useDismiss) so an outside handler that
        // `stopPropagation()`s the event before it bubbles can't defeat the dismiss. The effect runs after
        // commit — the React parity for the Vue twin's `flush: 'post'` / the Svelte microtask defer — so the
        // interaction that opened the overlay has finished dispatching and can't immediately self-dismiss it.
        types.forEach((type) => document.addEventListener(type, handler, true));
        return () => types.forEach((type) => document.removeEventListener(type, handler, true));
    }, [enabled, pointerDownOutside, focusOutside]);
}
