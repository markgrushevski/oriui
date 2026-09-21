/** A single menu item. `value` is the stable identity; `label` is optional (display text). */
export interface MenuItem {
    value: string
    label?: string
    disabled?: boolean
    /**
     * Renders a `role="separator"` rule in this position instead of an item. A separator is not
     * navigable and not selectable — roving skips it exactly as it skips a `disabled` item, and
     * `label` is ignored. `value` still applies, as the list key. The array is the model here, so a
     * separator is an entry in it (PrimeVue's `{ separator: true }` shape), not a slotted child.
     */
    separator?: boolean
}

export interface MenuContext {
    /** Whether the menu is open. */
    open: boolean
    /** The highlighted (roving-focused) item value, or null when none is active. */
    highlightedValue: string | null
    disabled: boolean
}

export type MenuEvent =
    | { type: 'OPEN' }
    | { type: 'CLOSE' }
    | { type: 'HIGHLIGHT'; value: string | null }
    | { type: 'SET_DISABLED'; disabled: boolean }

export interface MenuProps {
    /** Stable, SSR-safe base id (from the adapter: Vue `useId()`, Svelte `$props.id()`). */
    id: string
    disabled?: boolean
}
