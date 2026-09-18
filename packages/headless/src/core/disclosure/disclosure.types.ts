export interface DisclosureContext {
    open: boolean
    disabled: boolean
}

export type DisclosureEvent =
    | { type: 'TOGGLE' }
    | { type: 'OPEN' }
    | { type: 'CLOSE' }
    | { type: 'SET'; open: boolean }
    | { type: 'SET_DISABLED'; disabled: boolean }

export interface DisclosureProps {
    /** Stable, SSR-safe base id (from the adapter: Vue `useId()`, Svelte `$props.id()`). */
    id: string
    /** Uncontrolled initial open state. */
    defaultOpen?: boolean
    /** Seeds `context.disabled`; the adapters keep it in sync afterwards with `SET_DISABLED`. */
    disabled?: boolean
}
