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
