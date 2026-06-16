import type { Scope } from './scope';

/**
 * A deliberately tiny state container: a pure `reducer` over a context value, plus a subscribe
 * seam. The framework adapters bridge `subscribe()` to their reactivity (Vue `shallowRef`,
 * Svelte `$state`) — that is the ONLY place per-framework code touches state.
 *
 * For the primitives we ship (disclosure / toggle / tabs) a reducer is enough; a full statechart
 * would be overkill. The shape mirrors Zag.js's service so a real `@zag-js/<x>` machine can later
 * be dropped behind the same `connect()` seam for genuinely complex widgets.
 */
export interface MachineConfig<Context, Event> {
    initial: Context;
    /** Pure transition. Return the SAME reference when nothing changes to skip a notification. */
    reducer(context: Context, event: Event): Context;
}

export interface Service<Context, Event> {
    scope: Scope;
    getState(): Context;
    send(event: Event): void;
    subscribe(listener: () => void): () => void;
}

export function createMachine<Context, Event>(
    config: MachineConfig<Context, Event>,
    scope: Scope
): Service<Context, Event> {
    let state = config.initial;
    const listeners = new Set<() => void>();

    return {
        scope,
        getState: () => state,
        send(event) {
            const next = config.reducer(state, event);
            if (next === state) return;
            state = next;
            for (const listener of listeners) listener();
        },
        subscribe(listener) {
            listeners.add(listener);
            return () => {
                listeners.delete(listener);
            };
        }
    };
}
