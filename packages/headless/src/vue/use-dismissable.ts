import { onScopeDispose, watch } from 'vue';
import { isTargetOutside } from '../core';

/**
 * Headless dismiss layer (Vue) — the shared "close the overlay on an outside interaction" glue for
 * non-platform overlays (Menu, Combobox), the pattern Radix `DismissableLayer` / Floating-UI `useDismiss`
 * standardise. (Popover / Dialog get this free from the native `[popover]` / `<dialog>` top-layer; Escape
 * already lives in the core connects.) While `enabled`, it attaches `document` listeners — `pointerdown`
 * (if `pointerDownOutside`) and/or `focusin` (if `focusOutside`) — and calls `onDismiss()` when the event
 * lands OUTSIDE every element in `elements()` (via `isTargetOutside`). Each overlay picks the strategy that
 * fits it: a menu (no single focus anchor) uses pointerdown-outside; a combobox (focus on its input) uses
 * focus-out. Listeners are removed when `enabled` flips false or the scope disposes.
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

export function useDismissable(options: () => UseDismissableOptions): void {
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
        // Capture phase (like Radix DismissableLayer / Floating-UI useDismiss) so an outside handler that
        // `stopPropagation()`s the event before it bubbles can't defeat the dismiss.
        types.forEach((type) => document.addEventListener(type, handler, true));
        teardown = () => types.forEach((type) => document.removeEventListener(type, handler, true));
    };

    // Attach after the flush (flush: 'post') so the overlay has rendered and the interaction that opened it
    // has finished propagating — otherwise that same pointerdown could immediately dismiss it.
    watch(
        () => options().enabled,
        (enabled) => {
            stop();
            if (enabled) start(options());
        },
        { immediate: true, flush: 'post' }
    );

    onScopeDispose(stop);
}
