/**
 * Framework-agnostic roving-focus helpers, shared by the Vue and Svelte `useToolbar` adapters (and
 * reusable by any roving-tabindex widget). Pure functions — no DOM, no reactivity — so they unit-test
 * in isolation and behave identically across frameworks. The adapters own the DOM (real focus,
 * `querySelectorAll` in document order) and the reactive state; this module owns only the index math
 * and the orientation/direction → key mapping that the WAI-ARIA Toolbar pattern prescribes.
 */

export type RovingOrientation = 'horizontal' | 'vertical';
export type RovingDirection = 'ltr' | 'rtl';

/** A navigation intent resolved from a keyboard event, independent of orientation/direction. */
export type RovingIntent = 'next' | 'prev' | 'first' | 'last';

/**
 * Map a keyboard key to a roving intent for the given orientation + text direction, or `null` when the
 * key is not a navigation key. Horizontal toolbars navigate with Left/Right (swapped under RTL);
 * vertical toolbars with Up/Down (direction-independent). Home/End jump to the ends in both.
 */
export function rovingIntent(
    key: string,
    orientation: RovingOrientation = 'horizontal',
    dir: RovingDirection = 'ltr'
): RovingIntent | null {
    if (key === 'Home') return 'first';
    if (key === 'End') return 'last';

    if (orientation === 'vertical') {
        if (key === 'ArrowDown') return 'next';
        if (key === 'ArrowUp') return 'prev';
        return null;
    }

    // Horizontal: RTL swaps the visual meaning of Left/Right.
    const forward = dir === 'rtl' ? 'ArrowLeft' : 'ArrowRight';
    const backward = dir === 'rtl' ? 'ArrowRight' : 'ArrowLeft';
    if (key === forward) return 'next';
    if (key === backward) return 'prev';
    return null;
}

/**
 * Resolve the target index for a roving intent from the current index over `count` items. `loop` wraps
 * next/prev around the ends (the WAI-ARIA reference example wraps; opt out for strict-minimal). Returns
 * `-1` when there is nothing to move to (empty set). `from` may be `-1` (nothing focused yet) — `next`
 * then lands on the first item, `prev` on the last.
 */
export function resolveRovingIndex(intent: RovingIntent, from: number, count: number, loop = true): number {
    if (count <= 0) return -1;
    if (intent === 'first') return 0;
    if (intent === 'last') return count - 1;

    const step = intent === 'next' ? 1 : -1;
    let next = from + step;

    if (from < 0) next = intent === 'next' ? 0 : count - 1;

    if (next < 0) return loop ? count - 1 : 0;
    if (next >= count) return loop ? 0 : count - 1;
    return next;
}
