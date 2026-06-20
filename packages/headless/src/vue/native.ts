import { computed, ref, toValue, useId, type MaybeRefOrGetter } from 'vue';
import { disclosure } from '../core';
import { normalizeProps } from './normalize-props';
import { useService } from './use-machine';
import type { DialogControl, DisclosureControl, UseDialogOptions, UseDisclosureOptions } from './contract';

/**
 * Native oriUI Disclosure adapter — built on the in-house `../core` machine. The default behind
 * `useDisclosure`; the contract still lets an app swap in a custom (e.g. Zag-backed) adapter.
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

/**
 * Native oriUI Dialog adapter — zero dependencies, built on the platform `<dialog>` element. It owns
 * only the open state and the ARIA prop bags; the consuming component renders the `<dialog>` and calls
 * `showModal()` / `close()` from `open` (see `OriDialog`), so the focus trap, `Esc`, `::backdrop`,
 * top-layer and `inert`-on-rest come from the browser — the hard behaviour that previously justified a
 * Zag adapter. This is the default behind `useDialog`; the `OriHeadless` contract still lets an app
 * swap in a custom (e.g. Zag-backed) dialog adapter per project.
 */
export const nativeDialog = (options: MaybeRefOrGetter<UseDialogOptions> = () => ({})): DialogControl => {
    const opts = computed(() => toValue(options) ?? {});
    const baseId = opts.value.id ?? useId() ?? 'ori-dialog';
    const titleId = `${baseId}-title`;
    const descriptionId = `${baseId}-description`;

    const open = ref(opts.value.defaultOpen ?? false);

    function setOpen(value: boolean): void {
        if (open.value === value) return;
        open.value = value;
        opts.value.onOpenChange?.(value);
    }

    return {
        open: computed(() => open.value),
        setOpen,
        toggle: () => setOpen(!open.value),
        triggerProps: computed(() => ({
            'aria-haspopup': 'dialog',
            'aria-expanded': open.value,
            onClick: () => setOpen(true)
        })),
        dialogProps: computed(() => ({
            role: 'dialog',
            'aria-modal': opts.value.modal === false ? undefined : 'true',
            'aria-labelledby': titleId,
            // The browser fires `close` whenever the <dialog> closes (Esc, form method=dialog,
            // close()); mirror it back into reactive state so `open` never drifts from the element.
            onClose: () => setOpen(false),
            // `cancel` precedes the Esc-driven close; block it to keep the dialog open.
            onCancel: opts.value.closeOnEscape === false ? (event: Event) => event.preventDefault() : undefined,
            // Light dismiss: a click that lands on the <dialog> itself (its ::backdrop area, not the
            // content) closes it. currentTarget is the <dialog>, so no element ref is needed.
            onClick:
                opts.value.closeOnInteractOutside === false
                    ? undefined
                    : (event: MouseEvent) => {
                          if (event.currentTarget === event.target) setOpen(false);
                      }
        })),
        titleProps: computed(() => ({ id: titleId })),
        descriptionProps: computed(() => ({ id: descriptionId })),
        closeTriggerProps: computed(() => ({ onClick: () => setOpen(false) }))
    };
};
