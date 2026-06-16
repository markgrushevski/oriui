import { computed, toValue, useId, type ComputedRef, type MaybeRefOrGetter } from 'vue';
import { disclosure } from '@oriui/core';
import { normalizeProps } from './normalize-props';
import { useService } from './use-machine';

export interface UseDisclosureOptions {
    id?: string;
    defaultOpen?: boolean;
    disabled?: boolean;
}

export interface UseDisclosureReturn {
    open: ComputedRef<boolean>;
    rootProps: ComputedRef<Record<string, unknown>>;
    triggerProps: ComputedRef<Record<string, unknown>>;
    contentProps: ComputedRef<Record<string, unknown>>;
    setOpen(open: boolean): void;
    toggle(): void;
}

/**
 * Headless Disclosure (WAI-ARIA collapsible) for Vue. Wraps the framework-agnostic
 * `@oriui/core` disclosure machine; returns reactive prop-getters to spread with `v-bind`.
 */
export function useDisclosure(options: MaybeRefOrGetter<UseDisclosureOptions> = () => ({})): UseDisclosureReturn {
    const initial = toValue(options);
    const props: disclosure.DisclosureProps = {
        id: initial.id ?? useId() ?? 'disclosure',
        defaultOpen: initial.defaultOpen,
        disabled: initial.disabled
    };

    const service = disclosure.machine(props);
    const version = useService(service);

    const api = computed(() => {
        void version.value; // track machine changes
        return disclosure.connect(service, normalizeProps);
    });

    return {
        open: computed(() => api.value.open),
        rootProps: computed(() => api.value.getRootProps()),
        triggerProps: computed(() => api.value.getTriggerProps()),
        contentProps: computed(() => api.value.getContentProps()),
        setOpen: (open: boolean) => service.send({ type: 'SET', open }),
        toggle: () => service.send({ type: 'TOGGLE' })
    };
}
