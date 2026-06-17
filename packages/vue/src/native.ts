import { computed, toValue, useId, type MaybeRefOrGetter } from 'vue';
import { disclosure } from '@oriui/core';
import { normalizeProps } from './normalize-props';
import { useService } from './use-machine';
import type { DisclosureControl, UseDisclosureOptions } from './contract';

/**
 * Native oriUI Disclosure adapter — built on the in-house `@oriui/core` machine. Kept as the
 * default and reference implementation behind the contract; Zag is the recommended swap-in for
 * the full behavior surface.
 */
export const nativeDisclosure = (options: MaybeRefOrGetter<UseDisclosureOptions> = () => ({})): DisclosureControl => {
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
};
