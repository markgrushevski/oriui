import type { ComputedRef, InjectionKey, MaybeRefOrGetter } from 'vue';
import type { ComboboxItem, ComboboxOptionState, MenuItem, MenuItemState } from '../core';

export interface UseDisclosureOptions {
    id?: string;
    defaultOpen?: boolean;
    disabled?: boolean;
}

/** The shape a component consumes, regardless of which engine produced it. */
export interface DisclosureControl {
    open: ComputedRef<boolean>;
    rootProps: ComputedRef<Record<string, unknown>>;
    triggerProps: ComputedRef<Record<string, unknown>>;
    contentProps: ComputedRef<Record<string, unknown>>;
    setOpen(open: boolean): void;
    toggle(): void;
}

/**
 * A headless behavior implementation. Swap freely: our native `../core` one, a Zag-backed
 * one, or a user-supplied one — the component markup never changes.
 */
export type DisclosureAdapter = (options?: MaybeRefOrGetter<UseDisclosureOptions>) => DisclosureControl;

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
 * `<dialog>` and drives `showModal()` / `close()` from `open`, so the platform supplies the focus
 * trap, `Esc`, `::backdrop`, top-layer and `inert`-on-rest. The adapter owns only the open state and
 * the ARIA prop bags — `dialogProps` carries the `<dialog>`'s own attributes plus the `close` /
 * `cancel` / backdrop-click handlers that keep `open` in sync.
 */
export interface DialogControl {
    open: ComputedRef<boolean>;
    setOpen(open: boolean): void;
    toggle(): void;
    triggerProps: ComputedRef<Record<string, unknown>>;
    dialogProps: ComputedRef<Record<string, unknown>>;
    titleProps: ComputedRef<Record<string, unknown>>;
    descriptionProps: ComputedRef<Record<string, unknown>>;
    closeTriggerProps: ComputedRef<Record<string, unknown>>;
}

export type DialogAdapter = (options?: MaybeRefOrGetter<UseDialogOptions>) => DialogControl;

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
    open: ComputedRef<boolean>;
    value: ComputedRef<string | null>;
    inputValue: ComputedRef<string>;
    highlightedValue: ComputedRef<string | null>;
    /** The currently visible (filtered) items — drives navigation + the active-descendant id. */
    items: ComputedRef<ComboboxItem[]>;
    rootProps: ComputedRef<Record<string, unknown>>;
    labelProps: ComputedRef<Record<string, unknown>>;
    controlProps: ComputedRef<Record<string, unknown>>;
    inputProps: ComputedRef<Record<string, unknown>>;
    triggerProps: ComputedRef<Record<string, unknown>>;
    clearTriggerProps: ComputedRef<Record<string, unknown>>;
    listboxProps: ComputedRef<Record<string, unknown>>;
    getOptionProps(item: ComboboxItem, index: number): Record<string, unknown>;
    getOptionState(item: ComboboxItem): ComboboxOptionState;
    setOpen(open: boolean): void;
    setInputValue(next: string): void;
    select(item: ComboboxItem): void;
    clear(): void;
}

export type ComboboxAdapter = (options: MaybeRefOrGetter<UseComboboxOptions>) => ComboboxControl;

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
    open: ComputedRef<boolean>;
    highlightedValue: ComputedRef<string | null>;
    items: ComputedRef<MenuItem[]>;
    triggerProps: ComputedRef<Record<string, unknown>>;
    contentProps: ComputedRef<Record<string, unknown>>;
    separatorProps: ComputedRef<Record<string, unknown>>;
    getItemProps(item: MenuItem, index: number): Record<string, unknown>;
    getItemState(item: MenuItem): MenuItemState;
    setOpen(open: boolean): void;
    highlight(value: string | null): void;
    highlightFirst(): void;
    highlightLast(): void;
}

export type MenuAdapter = (options: MaybeRefOrGetter<UseMenuOptions>) => MenuControl;

/**
 * The set of behaviors an app can swap. Every entry is optional — an omitted one falls back to the
 * built-in native (`../core`) adapter, so a component works with no configuration and an app can
 * replace one behavior (a Zag-backed or custom engine) without touching component markup.
 */
export interface HeadlessAdapters {
    disclosure?: DisclosureAdapter;
    dialog?: DialogAdapter;
    combobox?: ComboboxAdapter;
    menu?: MenuAdapter;
}

/** Injection key the resolver reads; set by the OriHeadless plugin / provideHeadless(). */
export const ORI_HEADLESS: InjectionKey<HeadlessAdapters> = Symbol('ori-headless');
