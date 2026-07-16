import { useSyncExternalStore } from 'react';
import { createToastActions, createToastQueue, type ToastItem } from '../core/toast';

export type { ToastColor, ToastItem, ToastOptions } from '../core/toast';

// One module-level queue — the client-side singleton — projected into React with `useSyncExternalStore`.
// Every useToast() caller, in any component, shares this one queue (and its one renderer), so a push from
// anywhere reaches it: parity with the Vue reactive mirror / the Svelte readable store. The core owns the
// array + the auto-dismiss timers (see core/toast/queue.ts).
const queue = createToastQueue();

// FOOTGUN: queue.getToasts() returns a FRESH array on every call. Returning it straight from getSnapshot
// would hand `useSyncExternalStore` a new reference on every read and spin an infinite render loop. So keep
// one cached array and refresh it ONLY when the queue changes, from a single permanent module-level
// subscription established here (before any component mounts, so it always runs before React's own
// subscribers and the new array is ready by the time React re-reads getSnapshot). Between changes the
// reference is stable — exactly what `useSyncExternalStore` needs — and, like the Vue mirror, the cache
// stays in sync with the queue regardless of which components are mounted.
let snapshot: readonly ToastItem[] = queue.getToasts();
queue.subscribe(() => {
    snapshot = queue.getToasts();
});

// The server never populates the queue — toasts only ever come from client interaction (see NOTES.md) — so
// the server snapshot is a stable, shared empty array (a fresh `[]` per call would defeat the caching).
const EMPTY: readonly ToastItem[] = [];

// Module-level (stable identities) so `useSyncExternalStore` never re-subscribes. `subscribe` forwards to
// `queue.subscribe` as a method call to keep its `this` binding; getSnapshot returns the cache above.
const subscribe = (onStoreChange: () => void): (() => void) => queue.subscribe(onStoreChange);
const getSnapshot = (): readonly ToastItem[] => snapshot;
const getServerSnapshot = (): readonly ToastItem[] => EMPTY;

/**
 * Imperative toast queue (React) — the twin of the Vue / Svelte `useToast`, sharing the one module-level
 * queue. Call `toast()` (or a severity shortcut) to push a notification, and render `toasts` once near the
 * app root; each push returns the toast id, which can be passed to `dismiss(id)`. `toasts` is a plain array
 * re-projected through `useSyncExternalStore` on every change (no ref / store — the component re-renders).
 */
export function useToast() {
    const toasts = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
    return {
        /** The live queue to render — a plain array, re-projected on every change. */
        toasts,
        ...createToastActions(queue)
    };
}
