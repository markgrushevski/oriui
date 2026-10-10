/** A single combobox option. `value` is the stable identity; `label` is what the input shows. */
export interface ComboboxItem {
    value: string
    label: string
    disabled?: boolean
}

/** The accessible names of the combobox's own buttons. Each one defaults to English. */
export interface ComboboxLabels {
    /** The clear button (default `'Clear selection'`). */
    clear: string
    /** The trigger while the list is open (default `'Close suggestions'`). */
    close: string
    /** The trigger while the list is closed (default `'Open suggestions'`). */
    open: string
}

export interface ComboboxContext {
    /** Whether the listbox is open. */
    open: boolean
    /** The selected option value (single-select), or null. */
    value: string | null
    /** The current text in the input. */
    inputValue: string
    /** The highlighted (active) option value for keyboard navigation, or null. */
    highlightedValue: string | null
    disabled: boolean
}

export type ComboboxEvent =
    | { type: 'OPEN' }
    | { type: 'CLOSE' }
    | { type: 'SET_INPUT'; value: string }
    | { type: 'HIGHLIGHT'; value: string | null }
    | { type: 'SELECT'; value: string; label: string }
    | { type: 'CLEAR' }
    | { type: 'SET_DISABLED'; disabled: boolean }

export interface ComboboxProps {
    /** Stable, SSR-safe base id (from the adapter: Vue `useId()`, Svelte `$props.id()`). */
    id: string
    /** Uncontrolled initial selected value. */
    defaultValue?: string | null
    /** Uncontrolled initial input text. */
    defaultInputValue?: string
    disabled?: boolean
}
