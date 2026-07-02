/** A single menu item. `value` is the stable identity; `label` is optional (display / typeahead). */
export interface MenuItem {
    value: string;
    label?: string;
    disabled?: boolean;
}

export interface MenuContext {
    /** Whether the menu is open. */
    open: boolean;
    /** The highlighted (roving-focused) item value, or null when none is active. */
    highlightedValue: string | null;
    disabled: boolean;
}

export type MenuEvent =
    | { type: 'OPEN' }
    | { type: 'CLOSE' }
    | { type: 'HIGHLIGHT'; value: string | null }
    | { type: 'SET_DISABLED'; disabled: boolean };

export interface MenuProps {
    /** Stable, SSR-safe base id (from the adapter: Vue `useId()`, Svelte `$props.id()`). */
    id: string;
    disabled?: boolean;
}
