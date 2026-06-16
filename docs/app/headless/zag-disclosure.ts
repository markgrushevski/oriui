import { computed, toValue, useId, type MaybeRefOrGetter } from 'vue';
import * as collapsible from '@zag-js/collapsible';
import { normalizeProps, useMachine } from '@zag-js/vue';
import type { DisclosureAdapter, DisclosureControl, UseDisclosureOptions } from '@oriui/vue';

/**
 * Zag-backed Disclosure adapter (uses @zag-js/collapsible). Demonstrates the swappable headless
 * contract: the same oriUI components run on Zag's tested behavior instead of the native engine,
 * with no markup change. Prototyped here in the consumer; promote to an @oriui/zag package later.
 */
export const zagDisclosure: DisclosureAdapter = (
    options: MaybeRefOrGetter<UseDisclosureOptions> = () => ({})
): DisclosureControl => {
    const initial = toValue(options);

    const service = useMachine(collapsible.machine, {
        id: initial.id ?? useId(),
        defaultOpen: initial.defaultOpen,
        disabled: initial.disabled
    });

    const api = computed(() => collapsible.connect(service, normalizeProps));

    return {
        open: computed(() => api.value.open),
        rootProps: computed(() => api.value.getRootProps() as Record<string, unknown>),
        triggerProps: computed(() => api.value.getTriggerProps() as Record<string, unknown>),
        contentProps: computed(() => api.value.getContentProps() as Record<string, unknown>),
        setOpen: (open: boolean) => api.value.setOpen(open),
        toggle: () => api.value.setOpen(!api.value.open)
    };
};
