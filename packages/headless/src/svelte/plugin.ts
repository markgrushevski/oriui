import { getContext, setContext } from 'svelte';
import { ORI_HEADLESS, type HeadlessAdapters } from './contract';

/**
 * Provide headless adapters to a Svelte component subtree — the Svelte twin of the Vue
 * `provideHeadless()` / `OriHeadless` plugin. Call during component init (in `<script>`):
 * `provideHeadless({ disclosure: zagDisclosure })`. With no adapter the native one is used.
 */
export function provideHeadless(adapters: HeadlessAdapters): void {
    setContext(ORI_HEADLESS, adapters);
}

/**
 * Resolve the adapters set for the current subtree, or `null` when none were provided. Wrapped so it
 * degrades to the native default when called outside Svelte component init (e.g. in a unit test),
 * where `getContext` would otherwise throw.
 */
export function getHeadless(): HeadlessAdapters | null {
    try {
        return getContext<HeadlessAdapters>(ORI_HEADLESS) ?? null;
    } catch {
        return null;
    }
}
