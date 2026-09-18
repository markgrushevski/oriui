/**
 * Pure toggle-group selection math for the WAI-ARIA toolbar — the selection half of what `./roving` is
 * for navigation. The three `use-toolbar.ts` adapters each hand-wrote the same two rules, so a fix
 * applied to one and forgotten in the others was invisible (ISSUES-INNER ORI-I-07); the rules live here
 * once and each adapter supplies only its own reactivity.
 */

/** 'single' keeps at most one value; 'multiple' keeps a set. */
export type ToolbarToggleType = 'single' | 'multiple'

/** A toggle group's committed selection: a string (or nothing) for 'single', a `string[]` for 'multiple'. */
export type ToolbarToggleValue = string | string[] | undefined

/** Whether `value` is part of the current selection, under either selection type. */
export function isToolbarTogglePressed(type: ToolbarToggleType, current: ToolbarToggleValue, value: string): boolean {
    return type === 'multiple' ? Array.isArray(current) && current.includes(value) : current === value
}

/**
 * The selection after `value` is activated (clicked / Entered).
 *
 * `deselectable` (default `true`, matching Radix's `type="single"`) decides what activating the ALREADY
 * selected value does: clear it, or keep it. `false` is what a tool picker needs — a paint app's
 * brush/eraser bar must always have exactly one tool — and it means the same thing under 'multiple':
 * the last remaining value cannot be removed, so the selection never becomes empty.
 *
 * Returns `current` ITSELF (same reference) when the activation changes nothing, so an adapter can skip
 * the commit with `if (next !== current)` rather than firing an `onChange` that re-sets the same value —
 * under 'multiple' a real change always allocates a fresh array, so the identity test is exact.
 */
export function resolveToolbarToggle(
    type: ToolbarToggleType,
    current: ToolbarToggleValue,
    value: string,
    deselectable = true
): ToolbarToggleValue {
    if (type === 'multiple') {
        const set = new Set(Array.isArray(current) ? current : [])
        if (!set.has(value)) {
            set.add(value)
        } else {
            if (!deselectable && set.size === 1) return current
            set.delete(value)
        }
        return [...set]
    }

    if (current !== value) return value
    return deselectable ? undefined : current
}
