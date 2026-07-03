import { derived, get, readable, writable } from 'svelte/store';
import { disclosure } from '../core';
import { uid } from './id';
import { normalizeProps } from './normalize-props';
import { connectStore } from './use-store';
import type { DialogControl, DisclosureControl, UseDialogOptions, UseDisclosureOptions } from './contract';

/**
 * Native oriUI Disclosure adapter — built on the in-house `../core` machine, the same one the Vue
 * adapter uses; only the reactive wrapper (a Svelte store vs. a Vue `computed`) differs. Default behind
 * `useDisclosure`; the contract still lets an app swap in a custom (e.g. Zag-backed) adapter.
 */
export const nativeDisclosure = (options: UseDisclosureOptions = {}): DisclosureControl => {
    const props: disclosure.DisclosureProps = {
        id: options.id ?? uid('disclosure'),
        defaultOpen: options.defaultOpen,
        disabled: options.disabled
    };

    const service = disclosure.machine(props);
    const api = connectStore(service, () => disclosure.connect(service, normalizeProps));

    return {
        open: derived(api, (a) => a.open),
        rootProps: derived(api, (a) => a.getRootProps()),
        triggerProps: derived(api, (a) => a.getTriggerProps()),
        contentProps: derived(api, (a) => a.getContentProps()),
        setOpen: (open: boolean) => service.send({ type: 'SET', open }),
        toggle: () => service.send({ type: 'TOGGLE' })
    };
};

/**
 * Native oriUI Dialog adapter — zero dependencies, built on the platform `<dialog>` element. It owns
 * only the open state and the ARIA prop bags; the consuming component renders the `<dialog>` and calls
 * `showModal()` / `close()` from `open`, so the focus trap, `Esc`, `::backdrop`, top-layer and
 * `inert`-on-rest come from the browser. Event keys are lowercased (`onclose`, `oncancel`, `onclick`) so
 * a `{...props}` spread wires real Svelte handlers. Default behind `useDialog`; still swappable.
 */
export const nativeDialog = (options: UseDialogOptions = {}): DialogControl => {
    const baseId = options.id ?? uid('ori-dialog');
    const titleId = `${baseId}-title`;
    const descriptionId = `${baseId}-description`;

    const open = writable(options.defaultOpen ?? false);

    function setOpen(value: boolean): void {
        open.update((current) => {
            if (current === value) return current;
            options.onOpenChange?.(value);
            return value;
        });
    }

    return {
        open: { subscribe: open.subscribe },
        setOpen,
        toggle: () => setOpen(!get(open)),
        triggerProps: derived(open, (o) => ({
            'aria-haspopup': 'dialog',
            'aria-expanded': o,
            onclick: () => setOpen(true)
        })),
        dialogProps: readable({
            role: 'dialog',
            'aria-modal': options.modal === false ? undefined : 'true',
            'aria-labelledby': titleId,
            // The browser fires `close` whenever the <dialog> closes (Esc, form method=dialog, close());
            // mirror it back into reactive state so `open` never drifts from the element.
            onclose: () => setOpen(false),
            // `cancel` precedes the Esc-driven close; block it to keep the dialog open.
            oncancel: options.closeOnEscape === false ? (event: Event) => event.preventDefault() : undefined,
            // Light dismiss: a click that lands on the <dialog> itself (its ::backdrop area, not the
            // content) closes it. currentTarget is the <dialog>, so no element ref is needed.
            onclick:
                options.closeOnInteractOutside === false
                    ? undefined
                    : (event: MouseEvent) => {
                          if (event.currentTarget === event.target) setOpen(false);
                      }
        }),
        titleProps: readable({ id: titleId }),
        descriptionProps: readable({ id: descriptionId }),
        closeTriggerProps: readable({ onclick: () => setOpen(false) })
    };
};
