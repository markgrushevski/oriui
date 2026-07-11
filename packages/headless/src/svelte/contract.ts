import type { Readable } from 'svelte/store';
import type { ComboboxItem, ComboboxOptionState, MenuItem, MenuItemState } from '../core';
import type { MaybeReactive } from './use-store';

// The Svelte adapter mirrors the Vue contract (packages/headless/src/vue/contract.ts) but returns
// Svelte stores (`Readable`) instead of Vue `ComputedRef`s, and takes plain options (no
// `MaybeRefOrGetter`). The behaviour lives in the shared `../core` engine — only the reactive wrapper
// differs per framework.

export interface UseDisclosureOptions {
    id?: string;
    defaultOpen?: boolean;
    disabled?: boolean;
}

/** The shape a Svelte component consumes, regardless of which engine produced it. */
export interface DisclosureControl {
    open: Readable<boolean>;
    rootProps: Readable<Record<string, unknown>>;
    triggerProps: Readable<Record<string, unknown>>;
    contentProps: Readable<Record<string, unknown>>;
    setOpen(open: boolean): void;
    toggle(): void;
}

/**
 * A headless behavior implementation. Swap freely: our native `../core` one, a Zag-backed one, or a
 * user-supplied one — the component markup never changes.
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
 * prop bags — `dialogProps` carries the `<dialog>`'s own attributes plus the `close` / `cancel` /
 * backdrop-click handlers that keep `open` in sync.
 */
export interface DialogControl {
    open: Readable<boolean>;
    setOpen(open: boolean): void;
    toggle(): void;
    triggerProps: Readable<Record<string, unknown>>;
    dialogProps: Readable<Record<string, unknown>>;
    titleProps: Readable<Record<string, unknown>>;
    descriptionProps: Readable<Record<string, unknown>>;
    closeTriggerProps: Readable<Record<string, unknown>>;
}

export type DialogAdapter = (options?: UseDialogOptions) => DialogControl;

export interface UseComboboxOptions {
    /** Stable base id; auto-generated when omitted (pass one for SSR). */
    id?: string;
    /** The full option list. Reactive when the whole options object is passed as a store. */
    options: ComboboxItem[];
    /** Initial selected value. */
    value?: string | null;
    /** Initial input text. */
    inputValue?: string;
    disabled?: boolean;
    /** Filter predicate; default = case-insensitive substring on the label. */
    filter?: (item: ComboboxItem, query: string) => boolean;
}

/** The shape a Svelte combobox UI consumes, regardless of which engine produced it. Item prop-getters
 *  are stores OF a function (`$getOptionProps(item, i)`) — the Svelte idiom. */
export interface ComboboxControl {
    open: Readable<boolean>;
    value: Readable<string | null>;
    inputValue: Readable<string>;
    highlightedValue: Readable<string | null>;
    items: Readable<ComboboxItem[]>;
    rootProps: Readable<Record<string, unknown>>;
    labelProps: Readable<Record<string, unknown>>;
    controlProps: Readable<Record<string, unknown>>;
    inputProps: Readable<Record<string, unknown>>;
    triggerProps: Readable<Record<string, unknown>>;
    clearTriggerProps: Readable<Record<string, unknown>>;
    listboxProps: Readable<Record<string, unknown>>;
    getOptionProps: Readable<(item: ComboboxItem, index: number) => Record<string, unknown>>;
    getOptionState: Readable<(item: ComboboxItem) => ComboboxOptionState>;
    setOpen(open: boolean): void;
    setInputValue(next: string): void;
    select(item: ComboboxItem): void;
    clear(): void;
}

export type ComboboxAdapter = (options: MaybeReactive<UseComboboxOptions>) => ComboboxControl;

export interface UseMenuOptions {
    /** Stable base id; auto-generated when omitted (pass one for SSR). */
    id?: string;
    /** The menu items, in render order. Reactive when the whole options object is passed as a store. */
    items: MenuItem[];
    disabled?: boolean;
    /** Fired when an item is activated (click / Enter / Space). The menu then closes. */
    onSelect?: (value: string) => void;
}

/** The shape a Svelte menu UI consumes, regardless of which engine produced it. */
export interface MenuControl {
    open: Readable<boolean>;
    highlightedValue: Readable<string | null>;
    items: Readable<MenuItem[]>;
    triggerProps: Readable<Record<string, unknown>>;
    contentProps: Readable<Record<string, unknown>>;
    separatorProps: Readable<Record<string, unknown>>;
    getItemProps: Readable<(item: MenuItem, index: number) => Record<string, unknown>>;
    getItemState: Readable<(item: MenuItem) => MenuItemState>;
    setOpen(open: boolean): void;
    highlight(value: string | null): void;
    highlightFirst(): void;
    highlightLast(): void;
}

export type MenuAdapter = (options: MaybeReactive<UseMenuOptions>) => MenuControl;

/**
 * The set of behaviors an app can swap (mirrors the Vue contract). Every entry is optional — an omitted
 * one falls back to the built-in native (`../core`) adapter, so a component works with no configuration.
 */
export interface HeadlessAdapters {
    disclosure?: DisclosureAdapter;
    dialog?: DialogAdapter;
    combobox?: ComboboxAdapter;
    menu?: MenuAdapter;
}

/** Context key the resolver reads; set by `provideHeadless()`. */
export const ORI_HEADLESS = Symbol('ori-headless');
