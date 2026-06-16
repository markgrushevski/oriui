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

export interface HeadlessAdapters {
    disclosure?: DisclosureAdapter;
}

/** Injection key the resolver reads; set by the OriHeadless plugin / provideHeadless(). */
export const ORI_HEADLESS: InjectionKey<HeadlessAdapters> = Symbol('ori-headless');
