import { computed, toValue, useId, type MaybeRefOrGetter } from 'vue';
import * as dialog from '@zag-js/dialog';
import { normalizeProps, useMachine } from '@zag-js/vue';
import type { DialogAdapter, DialogControl, UseDialogOptions } from '@oriui/vue';

/**
 * Zag-backed Dialog adapter (@zag-js/dialog) — the hard-behavior case: focus trap, focus return,
 * Escape, scroll lock, aria-modal. Exactly what we delegate rather than reinvent. Prototyped here
 * in the docs consumer; promote to an @oriui/zag package when published.
 */
export const zagDialog: DialogAdapter = (options: MaybeRefOrGetter<UseDialogOptions> = () => ({})): DialogControl => {
    const initial = toValue(options);

    const service = useMachine(dialog.machine, {
        id: initial.id ?? useId(),
        defaultOpen: initial.defaultOpen,
        modal: initial.modal,
        closeOnEscape: initial.closeOnEscape,
        closeOnInteractOutside: initial.closeOnInteractOutside,
        onOpenChange: initial.onOpenChange ? (details) => initial.onOpenChange?.(details.open) : undefined
    });

    const api = computed(() => dialog.connect(service, normalizeProps));

    return {
        open: computed(() => api.value.open),
        setOpen: (open: boolean) => api.value.setOpen(open),
        triggerProps: computed(() => api.value.getTriggerProps() as Record<string, unknown>),
        backdropProps: computed(() => api.value.getBackdropProps() as Record<string, unknown>),
        positionerProps: computed(() => api.value.getPositionerProps() as Record<string, unknown>),
        contentProps: computed(() => api.value.getContentProps() as Record<string, unknown>),
        titleProps: computed(() => api.value.getTitleProps() as Record<string, unknown>),
        descriptionProps: computed(() => api.value.getDescriptionProps() as Record<string, unknown>),
        closeTriggerProps: computed(() => api.value.getCloseTriggerProps() as Record<string, unknown>)
    };
};
