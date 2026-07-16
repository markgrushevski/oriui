import { useCallback, useId, useRef } from 'react';
import { disclosure } from '../core';
import { normalizeProps } from './normalize-props';
import { useService } from './use-machine';
import type { DisclosureControl, UseDisclosureOptions } from './contract';

/**
 * Native oriUI Disclosure adapter (React) — built on the shared `../core` machine, the same engine the
 * Vue and Svelte adapters use; only the reactive wrapper differs (a `useSyncExternalStore` subscription
 * vs. a Vue `computed` / a Svelte store). Default behind `useDisclosure`; the contract still lets an app
 * swap in a custom (e.g. Zag-backed) adapter.
 */
export const nativeDisclosure = (options: UseDisclosureOptions = {}): DisclosureControl => {
    // `useId()` is SSR-stable; strip the colons React wraps ids in (`:r0:`) so the derived `ori-<id>-<part>`
    // ids stay valid CSS selectors, matching the Vue (`useId`) / Svelte (`uid`) bases.
    const autoId = useId().replace(/:/g, '');

    // The machine must survive re-renders (its state is the source of truth), so create it once, lazily.
    // `??=` only evaluates the machine factory when the ref is still empty. Options are read at creation
    // and are init-only thereafter — parity with the Vue/Svelte native adapters (disclosure has no
    // SET_DISABLED event; only combobox/menu re-sync `disabled`).
    const serviceRef = useRef<ReturnType<typeof disclosure.machine> | null>(null);
    const service = (serviceRef.current ??= disclosure.machine({
        id: options.id ?? autoId,
        defaultOpen: options.defaultOpen,
        disabled: options.disabled
    }));

    // Subscribe so the component re-renders on every machine change; the prop bags below then re-project
    // from fresh state (`connect` is a cheap pure projection, recomputed each render like the Vue computed).
    useService(service);
    const api = disclosure.connect(service, normalizeProps);

    return {
        open: api.open,
        rootProps: api.getRootProps(),
        triggerProps: api.getTriggerProps(),
        contentProps: api.getContentProps(),
        setOpen: useCallback((open: boolean) => service.send({ type: 'SET', open }), [service]),
        toggle: useCallback(() => service.send({ type: 'TOGGLE' }), [service])
    };
};
