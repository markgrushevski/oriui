import { useSyncExternalStore } from 'react';
import type { Service } from '../core';

/**
 * Bridge a core Service's `subscribe()` to React — the React twin of the Vue adapter's `useService`
 * (which bumps a `shallowRef`) and the Svelte adapter's `connectStore`. `useSyncExternalStore` is React's
 * built-in, concurrent-safe, SSR-safe primitive for reading an external store: it subscribes for the
 * component's lifetime and re-renders on every machine change. The snapshot is the machine's context
 * object, whose reference is stable between changes (the reducer returns the SAME object when nothing
 * changes) and fresh on a real change — exactly what `useSyncExternalStore` needs to avoid tearing or an
 * infinite render loop. The server snapshot is the same `getState` (the machine's initial state, which
 * matches the first client render).
 */
export function useService<Context, Event>(service: Service<Context, Event>): Context {
    return useSyncExternalStore(service.subscribe, service.getState, service.getState);
}
