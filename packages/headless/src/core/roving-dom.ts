/**
 * DOM-reading roving helpers shared by the adapters. Kept out of `roving.ts` (pure index/key math) because
 * they inspect a real element, but still framework-agnostic: they read a PASSED element, never `document`.
 */

import type { RovingDirection } from './roving'

/**
 * The direction `el` is laid out in, as the browser resolved it: `dir` on the element or any ancestor, or
 * CSS `direction`. Read at keydown, so a direction that changes at runtime is followed.
 */
export function textDirection(el: Element): RovingDirection {
    return getComputedStyle(el).direction === 'rtl' ? 'rtl' : 'ltr'
}

/**
 * Whether a focused element OWNS the arrow keys a toolbar would otherwise use for navigation, so the
 * toolbar must not steal them (WAI-ARIA APG: include at most one arrow-consuming control, place it last).
 * Covers text/number/range/date inputs, textarea, select, native RADIO (navigated with arrows as a
 * group), spin buttons, and composite widgets whose role sits on the focused element OR an ancestor (a
 * native `<input type=radio>` inside a `[role=radiogroup]`, a cell inside a `[role=grid]`, etc.).
 * `checkbox` / `button` inputs are excluded — they act on Space/Enter, not arrows.
 */
export function ownsArrowKeys(el: HTMLElement): boolean {
    const tag = el.tagName
    if (tag === 'TEXTAREA' || tag === 'SELECT') return true
    if (tag === 'INPUT') {
        const type = (el as HTMLInputElement).type
        // Everything but checkbox/button uses arrows — text/number/date to edit, range to change, radio
        // to move within its group.
        if (type !== 'checkbox' && type !== 'button') return true
    }
    if (el.isContentEditable) return true

    const role = el.getAttribute('role')
    if (
        role === 'slider' ||
        role === 'spinbutton' ||
        role === 'radiogroup' ||
        role === 'menu' ||
        role === 'listbox' ||
        role === 'combobox' ||
        role === 'textbox'
    ) {
        return true
    }

    // A composite widget can expose its role on an ANCESTOR while focus sits on a descendant control.
    return el.closest('[role="radiogroup"], [role="menu"], [role="listbox"], [role="grid"], [role="tree"]') !== null
}
