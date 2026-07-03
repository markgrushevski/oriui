import type { Readable } from 'svelte/store';

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

export interface HeadlessAdapters {
    disclosure?: DisclosureAdapter;
    dialog?: DialogAdapter;
}

/** Context key the resolver reads; set by `provideHeadless()`. */
export const ORI_HEADLESS = Symbol('ori-headless');
