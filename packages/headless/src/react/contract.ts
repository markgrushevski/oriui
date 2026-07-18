import type { ComboboxItem, ComboboxOptionState, MenuItem, MenuItemState } from '../core';

// The React controls mirror the Vue (`ComputedRef`) / Svelte (`Readable`) contracts member-for-member, but
// expose PLAIN values recomputed each render — the component re-renders on machine changes via
// `useSyncExternalStore` (see use-machine). Prop bags are `Record<string, unknown>`, spread onto the markup.

export interface UseDisclosureOptions {
    id?: string;
    defaultOpen?: boolean;
    disabled?: boolean;
}

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

export interface UseDialogOptions {
    id?: string;
    defaultOpen?: boolean;
    modal?: boolean;
    closeOnEscape?: boolean;
    closeOnInteractOutside?: boolean;
    onOpenChange?: (open: boolean) => void;
}

/**
 * A modal/dialog control built around the native `<dialog>` element: the component renders a real
 * `<dialog>` and drives `showModal()` / `close()` from `open`, so the platform supplies the focus trap,
 * `Esc`, `::backdrop`, top-layer and `inert`-on-rest. The adapter owns only the open state and the ARIA
 * prop bags — `dialogProps` carries the `<dialog>`'s own attributes plus the close / cancel / backdrop-click
 * handlers that keep `open` in sync.
 */
export interface DialogControl {
    open: boolean;
    setOpen(open: boolean): void;
    toggle(): void;
    triggerProps: Record<string, unknown>;
    dialogProps: Record<string, unknown>;
    titleProps: Record<string, unknown>;
    descriptionProps: Record<string, unknown>;
    closeTriggerProps: Record<string, unknown>;
}

export type DialogAdapter = (options?: UseDialogOptions) => DialogControl;

export interface UseComboboxOptions {
    /** Stable base id; auto-generated via `useId` when omitted. */
    id?: string;
    /** The full option list. Reactive — filtering re-runs when it changes. */
    options: ComboboxItem[];
    /** Initial selected value. */
    value?: string | null;
    /** Initial input text. */
    inputValue?: string;
    disabled?: boolean;
    /** Filter predicate; default = case-insensitive substring on the label. */
    filter?: (item: ComboboxItem, query: string) => boolean;
}

/** The shape a combobox UI consumes, regardless of which engine (native core / Zag / custom) produced it. */
export interface ComboboxControl {
    open: boolean;
    value: string | null;
    inputValue: string;
    highlightedValue: string | null;
    /** The currently visible (filtered) items — drives navigation + the active-descendant id. */
    items: ComboboxItem[];
    rootProps: Record<string, unknown>;
    labelProps: Record<string, unknown>;
    controlProps: Record<string, unknown>;
    inputProps: Record<string, unknown>;
    triggerProps: Record<string, unknown>;
    clearTriggerProps: Record<string, unknown>;
    listboxProps: Record<string, unknown>;
    getOptionProps(item: ComboboxItem, index: number): Record<string, unknown>;
    getOptionState(item: ComboboxItem): ComboboxOptionState;
    setOpen(open: boolean): void;
    setInputValue(next: string): void;
    select(item: ComboboxItem): void;
    clear(): void;
}

export type ComboboxAdapter = (options: UseComboboxOptions) => ComboboxControl;

export interface UseMenuOptions {
    /** Stable base id; auto-generated via `useId` when omitted. */
    id?: string;
    /** The menu items, in render order. Reactive — navigation re-syncs when it changes. */
    items: MenuItem[];
    disabled?: boolean;
    /** Fired when an item is activated (click / Enter / Space). The menu then closes. */
    onSelect?: (value: string) => void;
}

/** The shape a menu UI consumes, regardless of which engine produced it. */
export interface MenuControl {
    open: boolean;
    highlightedValue: string | null;
    items: MenuItem[];
    triggerProps: Record<string, unknown>;
    contentProps: Record<string, unknown>;
    separatorProps: Record<string, unknown>;
    getItemProps(item: MenuItem, index: number): Record<string, unknown>;
    getItemState(item: MenuItem): MenuItemState;
    setOpen(open: boolean): void;
    highlight(value: string | null): void;
    highlightFirst(): void;
    highlightLast(): void;
}

export type MenuAdapter = (options: UseMenuOptions) => MenuControl;

/**
 * The set of behaviours a React app can swap. Every entry is optional — an omitted one falls back to the
 * built-in native (`../core`) adapter, so a component works with no configuration and an app can replace one
 * behaviour (a Zag-backed or custom engine) without touching component markup. (React constraint: the
 * chosen adapter is resolved once and must be stable for a component's lifetime — see DECISIONS.md.)
 */
export interface HeadlessAdapters {
    disclosure?: DisclosureAdapter;
    dialog?: DialogAdapter;
    combobox?: ComboboxAdapter;
    menu?: MenuAdapter;
}
