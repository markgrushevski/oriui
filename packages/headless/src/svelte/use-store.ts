import { onDestroy } from 'svelte';
import { readable, type Readable } from 'svelte/store';
import type { Service } from '../core';

/**
 * Bridge a core Service's `subscribe()` to Svelte reactivity — the Svelte twin of the Vue adapter's
 * `useService` (which bumps a `shallowRef`). Returns a readable store that re-emits the value produced
 * by `select()` on every machine change; `select` typically calls `connect(service, normalizeProps)`
 * to project state into prop-getters. The store seeds with the current value (SSR-safe — the server
 * render uses the machine's initial state, which matches the first client render) and unsubscribes from
 * the machine automatically when its last subscriber leaves.
 */
export function connectStore<Context, Event, T>(service: Service<Context, Event>, select: () => T): Readable<T> {
    return readable(select(), (set) => {
        set(select());
        return service.subscribe(() => set(select()));
    });
}

/** Either a plain value (snapshot) or a Svelte store (reactive) — the Svelte twin of Vue's `MaybeRefOrGetter`. */
export type MaybeReactive<T> = T | Readable<T>;

function isReadable<T>(input: MaybeReactive<T>): input is Readable<T> {
    return input != null && typeof (input as { subscribe?: unknown }).subscribe === 'function';
}

/**
 * Normalize a `MaybeReactive<T>` to a store. A plain value becomes a constant store (emits once), so the
 * snapshot and reactive call styles share one code path — pass an object for a fixed config, or a Svelte
 * store to have the composable react to external changes (option list, disabled, …).
 */
export function toReadable<T>(input: MaybeReactive<T>): Readable<T> {
    return isReadable(input) ? input : readable(input);
}

/**
 * A store that emits a fresh, strictly-increasing number on every machine change — a change *ticker* to
 * fold into a `derived([version, opts$], …)` so a projection recomputes on machine OR option changes
 * (a plain `connectStore` only tracks the machine). Distinct values each tick so `derived` always re-runs.
 */
export function serviceVersion<Context, Event>(service: Service<Context, Event>): Readable<number> {
    let n = 0;
    return readable(0, (set) => service.subscribe(() => set((n += 1))));
}

/**
 * `onDestroy` that no-ops outside component init (e.g. a unit test), mirroring `getHeadless`'s guard. Use
 * to tear down an eager store subscription; when there is no component the subscription simply lives with
 * the composable and is GC'd when it goes out of scope.
 */
export function safeOnDestroy(teardown: () => void): void {
    try {
        onDestroy(teardown);
    } catch {
        // not in a component — nothing to hook.
    }
}
