export interface DisclosureContext {
    open: boolean;
    disabled: boolean;
}

export type DisclosureEvent =
    | { type: 'TOGGLE' }
    | { type: 'OPEN' }
    | { type: 'CLOSE' }
    | { type: 'SET'; open: boolean };

export interface DisclosureProps {
    /** Stable, SSR-safe base id (from the adapter: Vue `useId()`, Svelte `$props.id()`). */
    id: string;
    /** Uncontrolled initial open state. */
    defaultOpen?: boolean;
    disabled?: boolean;
}
