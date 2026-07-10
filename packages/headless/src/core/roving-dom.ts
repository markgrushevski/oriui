/**
 * DOM-reading roving helper shared by the Vue and Svelte `useToolbar` adapters. Kept out of `roving.ts`
 * (which is pure index/key math) because it inspects a real element — but it stays framework-agnostic: a
 * pure predicate over a PASSED element and its ancestors (`closest`), never querying `document` or
 * mutating. One source of truth for the WAI-ARIA "yield arrows to a composite child" rule.
 */

/**
 * Whether a focused element OWNS the arrow keys a toolbar would otherwise use for navigation, so the
 * toolbar must not steal them (WAI-ARIA APG: include at most one arrow-consuming control, place it last).
 * Covers text/number/range/date inputs, textarea, select, native RADIO (navigated with arrows as a
 * group), spin buttons, and composite widgets whose role sits on the focused element OR an ancestor (a
 * native `<input type=radio>` inside a `[role=radiogroup]`, a cell inside a `[role=grid]`, etc.).
 * `checkbox` / `button` inputs are excluded — they act on Space/Enter, not arrows.
 */
export function ownsArrowKeys(el: HTMLElement): boolean {
    const tag = el.tagName;
    if (tag === 'TEXTAREA' || tag === 'SELECT') return true;
    if (tag === 'INPUT') {
        const type = (el as HTMLInputElement).type;
        // Everything but checkbox/button uses arrows — text/number/date to edit, range to change, radio
        // to move within its group.
        if (type !== 'checkbox' && type !== 'button') return true;
    }
    if (el.isContentEditable) return true;

    const role = el.getAttribute('role');
    if (
        role === 'slider' ||
        role === 'spinbutton' ||
        role === 'radiogroup' ||
        role === 'menu' ||
        role === 'listbox' ||
        role === 'combobox' ||
        role === 'textbox'
    ) {
        return true;
    }

    // A composite widget can expose its role on an ANCESTOR while focus sits on a descendant control.
    return el.closest('[role="radiogroup"], [role="menu"], [role="listbox"], [role="grid"], [role="tree"]') !== null;
}
