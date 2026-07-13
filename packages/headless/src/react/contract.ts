export interface UseDisclosureOptions {
    id?: string;
    defaultOpen?: boolean;
    disabled?: boolean;
}

/**
 * The shape a React component consumes, regardless of which engine produced it. Unlike the Vue
 * (`ComputedRef`) / Svelte (`Readable`) controls, the React control is plain values recomputed each
 * render — the component re-renders on machine changes via `useSyncExternalStore` (see use-machine).
 */
export interface DisclosureControl {
    open: boolean;
    rootProps: Record<string, unknown>;
    triggerProps: Record<string, unknown>;
    contentProps: Record<string, unknown>;
    setOpen(open: boolean): void;
    toggle(): void;
}

/**
 * A headless behaviour implementation. Swap the engine — our native `../core` one, a Zag-backed one, or a
 * user-supplied one — without changing component markup. Choose it ONCE at the app root: in React the
 * resolved adapter runs hooks, so it must be stable for a component's lifetime, not a per-render toggle
 * (see plugin.ts + DECISIONS.md).
 */
export type DisclosureAdapter = (options?: UseDisclosureOptions) => DisclosureControl;

/**
 * The set of behaviours a React app can swap. Only `disclosure` ships in this first adapter slice; dialog
 * / combobox / menu land in the fan-out (mirroring their Vue/Svelte contracts the same way). An omitted
 * entry falls back to the built-in native (`../core`) adapter, so a component works with no configuration.
 */
export interface HeadlessAdapters {
    disclosure?: DisclosureAdapter;
}
