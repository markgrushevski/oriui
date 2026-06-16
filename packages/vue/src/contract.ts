import type { ComputedRef, InjectionKey, MaybeRefOrGetter } from 'vue';

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
 * A headless behavior implementation. Swap freely: our native `@oriui/core` one, a Zag-backed
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

/** A modal/dialog control — the hard-behavior case (focus trap, scroll lock) we delegate to Zag. */
export interface DialogControl {
    open: ComputedRef<boolean>;
    setOpen(open: boolean): void;
    triggerProps: ComputedRef<Record<string, unknown>>;
    backdropProps: ComputedRef<Record<string, unknown>>;
    positionerProps: ComputedRef<Record<string, unknown>>;
    contentProps: ComputedRef<Record<string, unknown>>;
    titleProps: ComputedRef<Record<string, unknown>>;
    descriptionProps: ComputedRef<Record<string, unknown>>;
    closeTriggerProps: ComputedRef<Record<string, unknown>>;
}

export type DialogAdapter = (options?: MaybeRefOrGetter<UseDialogOptions>) => DialogControl;

export interface HeadlessAdapters {
    disclosure?: DisclosureAdapter;
    dialog?: DialogAdapter;
}

/** Injection key the resolver reads; set by the OriHeadless plugin / provideHeadless(). */
export const ORI_HEADLESS: InjectionKey<HeadlessAdapters> = Symbol('ori-headless');
