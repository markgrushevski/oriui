import { derived, get, readable, writable } from 'svelte/store';
import { combobox, disclosure, menu, type ComboboxItem, type MenuItem } from '../core';
import { uid } from './id';
import { normalizeProps } from './normalize-props';
import { connectStore, safeOnDestroy, serviceVersion, toReadable, type MaybeReactive } from './use-store';
import type {
    ComboboxControl,
    DialogControl,
    DisclosureControl,
    MenuControl,
    UseComboboxOptions,
    UseDialogOptions,
    UseDisclosureOptions,
    UseMenuOptions
} from './contract';

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

const defaultComboboxFilter = (item: ComboboxItem, query: string): boolean =>
    item.label.toLowerCase().includes(query.trim().toLowerCase());

/**
 * Native oriUI Combobox adapter (Svelte) — the WAI-ARIA listbox-combobox on the shared `../core` state
 * machine, same engine as the Vue adapter; only the reactive wrapper (Svelte stores) differs. Default
 * behind `useCombobox`; the OriHeadless contract lets an app swap a custom / Zag-backed one.
 */
export const nativeCombobox = (options: MaybeReactive<UseComboboxOptions>): ComboboxControl => {
    const opts$ = toReadable(options);
    const initial = get(opts$);

    const service = combobox.machine({
        id: initial.id ?? uid('combobox'),
        defaultValue: initial.value ?? null,
        defaultInputValue: initial.inputValue ?? '',
        disabled: initial.disabled
    });

    // Keep `disabled` in sync past creation. A store input drives it; a plain object emits once → no-op.
    let lastDisabled = initial.disabled ?? false;
    safeOnDestroy(
        opts$.subscribe((o) => {
            const next = o.disabled ?? false;
            if (next === lastDisabled) return;
            lastDisabled = next;
            service.send({ type: 'SET_DISABLED', disabled: next });
        })
    );

    const version$ = serviceVersion(service);

    // Visible items: filter by the current input — but show the whole list when the input is empty or
    // still equals the committed selection's label (so picking an option doesn't collapse the list).
    const visibleItems = (o: UseComboboxOptions): ComboboxItem[] => {
        const { inputValue, value } = service.getState();
        const all = o.options;
        const selectedLabel = value !== null ? all.find((option) => option.value === value)?.label : undefined;
        if (inputValue.trim() === '' || inputValue === selectedLabel) return all;
        const filter = o.filter ?? defaultComboboxFilter;
        return all.filter((item) => filter(item, inputValue));
    };

    const api = derived([version$, opts$], ([, o]) => combobox.connect(service, normalizeProps, visibleItems(o)));

    return {
        open: derived(api, (a) => a.open),
        value: derived(api, (a) => a.value),
        inputValue: derived(api, (a) => a.inputValue),
        highlightedValue: derived(api, (a) => a.highlightedValue),
        items: derived([version$, opts$], ([, o]) => visibleItems(o)),
        rootProps: derived(api, (a) => a.getRootProps()),
        labelProps: derived(api, (a) => a.getLabelProps()),
        controlProps: derived(api, (a) => a.getControlProps()),
        inputProps: derived(api, (a) => a.getInputProps()),
        triggerProps: derived(api, (a) => a.getTriggerProps()),
        clearTriggerProps: derived(api, (a) => a.getClearTriggerProps()),
        listboxProps: derived(api, (a) => a.getListboxProps()),
        getOptionProps: derived(api, (a) => (item: ComboboxItem, index: number) => a.getOptionProps(item, index)),
        getOptionState: derived(api, (a) => (item: ComboboxItem) => a.getOptionState(item)),
        setOpen: (open: boolean) => get(api).setOpen(open),
        setInputValue: (next: string) => get(api).setInputValue(next),
        select: (item: ComboboxItem) => get(api).select(item),
        clear: () => get(api).clear()
    };
};

/**
 * Native oriUI Menu adapter (Svelte) — the WAI-ARIA menu-button + roving tabindex on `../core`. Default
 * behind `useMenu`; swappable through the OriHeadless contract like the others.
 */
export const nativeMenu = (options: MaybeReactive<UseMenuOptions>): MenuControl => {
    const opts$ = toReadable(options);
    const initial = get(opts$);

    const service = menu.machine({
        id: initial.id ?? uid('menu'),
        disabled: initial.disabled
    });

    let lastDisabled = initial.disabled ?? false;
    safeOnDestroy(
        opts$.subscribe((o) => {
            const next = o.disabled ?? false;
            if (next === lastDisabled) return;
            lastDisabled = next;
            service.send({ type: 'SET_DISABLED', disabled: next });
        })
    );

    const version$ = serviceVersion(service);

    const api = derived([version$, opts$], ([, o]) => menu.connect(service, normalizeProps, o.items, o.onSelect));

    return {
        open: derived(api, (a) => a.open),
        highlightedValue: derived(api, (a) => a.highlightedValue),
        items: derived(opts$, (o) => o.items),
        triggerProps: derived(api, (a) => a.getTriggerProps()),
        contentProps: derived(api, (a) => a.getContentProps()),
        separatorProps: derived(api, (a) => a.getSeparatorProps()),
        getItemProps: derived(api, (a) => (item: MenuItem, index: number) => a.getItemProps(item, index)),
        getItemState: derived(api, (a) => (item: MenuItem) => a.getItemState(item)),
        setOpen: (open: boolean) => get(api).setOpen(open),
        highlight: (value: string | null) => get(api).highlight(value),
        highlightFirst: () => get(api).highlightFirst(),
        highlightLast: () => get(api).highlightLast()
    };
};
