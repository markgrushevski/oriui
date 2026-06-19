import { onMounted, onUnmounted, shallowRef, type ShallowRef } from 'vue';
import type { Service } from '../core';

/**
 * Bridge a core Service's `subscribe()` to Vue reactivity. Returns a version ref that bumps on
 * every machine change; read it inside a `computed(() => connect(service, normalizeProps))` so the
 * computed re-evaluates and the template re-binds. Subscription starts on mount (SSR-safe — the
 * server render uses the machine's initial state, which matches the first client render).
 */
export function useService<Context, Event>(service: Service<Context, Event>): ShallowRef<number> {
    const version = shallowRef(0);
    let unsubscribe: (() => void) | undefined;

    onMounted(() => {
        unsubscribe = service.subscribe(() => {
            version.value++;
        });
    });

    onUnmounted(() => unsubscribe?.());

    return version;
}
