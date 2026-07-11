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
 *
 * `isEnabled` is optional: when omitted, every index is a valid stop — the toolbar VISITS disabled items
 * (single-step, unchanged). When supplied, the resolver SKIPS indices it rejects and scans on in the
 * intent's direction — the Tabs / RadioGroup model, where disabled items are stepped over — returning the
 * nearest enabled index (or `-1` if none is reachable).
 */
export function resolveRovingIndex(
    intent: RovingIntent,
    from: number,
    count: number,
    loop = true,
    isEnabled?: (index: number) => boolean
): number {
    if (count <= 0) return -1;

    if (!isEnabled) {
        // No skip predicate: the original single-step behavior (the toolbar visits disabled items).
        if (intent === 'first') return 0;
        if (intent === 'last') return count - 1;

        const step = intent === 'next' ? 1 : -1;
        let next = from + step;

        if (from < 0) next = intent === 'next' ? 0 : count - 1;

        if (next < 0) return loop ? count - 1 : 0;
        if (next >= count) return loop ? 0 : count - 1;
        return next;
    }

    // Skip-disabled scan: walk in the intent's direction to the nearest ENABLED index (up to a full pass).
    const scan = (start: number, step: 1 | -1): number => {
        for (let i = 0; i < count; i += 1) {
            let index = start + step * i;
            if (loop) index = ((index % count) + count) % count;
            else if (index < 0 || index >= count) return -1;
            if (isEnabled(index)) return index;
        }
        return -1;
    };

    if (intent === 'first') return scan(0, 1);
    if (intent === 'last') return scan(count - 1, -1);

    const step = intent === 'next' ? 1 : -1;
    const start = from < 0 ? (intent === 'next' ? 0 : count - 1) : from + step;
    return scan(start, step);
}
