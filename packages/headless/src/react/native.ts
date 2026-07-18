import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { combobox, disclosure, menu, type ComboboxItem } from '../core';
import { normalizeProps } from './normalize-props';
import { useService } from './use-machine';
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

// A stable SSR-safe base id from React's `useId`, with the colons React wraps ids in (`:r0:`) stripped so
// the derived `ori-<id>-<part>` ids stay valid CSS selectors, matching the Vue (`useId`) / Svelte (`uid`)
// bases. `options.id` wins when provided.
function useBaseId(explicit: string | undefined): string {
    const autoId = useId().replace(/:/g, '');
    return explicit ?? autoId;
}

/**
 * Native oriUI Disclosure adapter (React) — built on the shared `../core` machine, the same engine the Vue
 * and Svelte adapters use; only the reactive wrapper differs (a `useSyncExternalStore` subscription vs. a
 * Vue `computed` / a Svelte store). Default behind `useDisclosure`; the contract still lets an app swap in a
 * custom (e.g. Zag-backed) adapter.
 */
export const nativeDisclosure = (options: UseDisclosureOptions = {}): DisclosureControl => {
    const id = useBaseId(options.id);

    // The machine must survive re-renders (its state is the source of truth), so create it once, lazily.
    // Options are read at creation and are init-only thereafter — parity with the Vue/Svelte native adapters
    // (disclosure has no SET_DISABLED event; only combobox/menu re-sync `disabled`).
    const serviceRef = useRef<ReturnType<typeof disclosure.machine> | null>(null);
    const service = (serviceRef.current ??= disclosure.machine({
        id,
        defaultOpen: options.defaultOpen,
        disabled: options.disabled
    }));

    useService(service); // re-render on every machine change; the prop bags below re-project from fresh state
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

/**
 * Native oriUI Dialog adapter (React) — zero dependencies, built on the platform `<dialog>` element. It owns
 * only the open state and the ARIA prop bags; the consuming component renders the `<dialog>` and calls
 * `showModal()` / `close()` from `open`, so the focus trap, `Esc`, `::backdrop`, top-layer and `inert`-on-rest
 * come from the browser. Default behind `useDialog`; still swappable via the contract.
 */
export const nativeDialog = (options: UseDialogOptions = {}): DialogControl => {
    const baseId = useBaseId(options.id);
    const titleId = `${baseId}-title`;
    const descriptionId = `${baseId}-description`;

    // Latest options via a ref so the stable `setOpen` always calls the current `onOpenChange` without
    // re-creating (options is a fresh object each render). `openRef` mirrors state so `toggle` / the no-op
    // guard read the current value without a stale closure; `onOpenChange` fires from the event handler
    // (never inside a state updater — updaters must stay pure / StrictMode-double-invoke-safe).
    const optionsRef = useRef(options);
    optionsRef.current = options;
    const openRef = useRef(options.defaultOpen ?? false);
    const [open, setOpenState] = useState(openRef.current);

    const setOpen = useCallback((value: boolean): void => {
        if (openRef.current === value) return;
        openRef.current = value;
        setOpenState(value);
        optionsRef.current.onOpenChange?.(value);
    }, []);
    const toggle = useCallback(() => setOpen(!openRef.current), [setOpen]);

    return {
        open,
        setOpen,
        toggle,
        triggerProps: {
            'aria-haspopup': 'dialog',
            'aria-expanded': open,
            onClick: () => setOpen(true)
        },
        dialogProps: {
            role: 'dialog',
            'aria-modal': options.modal === false ? undefined : 'true',
            'aria-labelledby': titleId,
            // The browser fires `close` whenever the <dialog> closes (Esc, form method=dialog, close());
            // mirror it back into reactive state so `open` never drifts from the element.
            onClose: () => setOpen(false),
            // `cancel` precedes the Esc-driven close; block it to keep the dialog open.
            onCancel:
                options.closeOnEscape === false
                    ? (event: { preventDefault(): void }) => event.preventDefault()
                    : undefined,
            // Light dismiss: a click that lands on the <dialog> itself (its ::backdrop area, not the content)
            // closes it. currentTarget is the <dialog>, so no element ref is needed.
            onClick:
                options.closeOnInteractOutside === false
                    ? undefined
                    : (event: { currentTarget: EventTarget; target: EventTarget }) => {
                          if (event.currentTarget === event.target) setOpen(false);
                      }
        },
        titleProps: { id: titleId },
        descriptionProps: { id: descriptionId },
        closeTriggerProps: { onClick: () => setOpen(false) }
    };
};

const defaultComboboxFilter = (item: ComboboxItem, query: string): boolean =>
    item.label.toLowerCase().includes(query.trim().toLowerCase());

/**
 * Native oriUI Combobox adapter (React) — the WAI-ARIA listbox-combobox on the shared `../core` state
 * machine, same engine as the Vue/Svelte adapters; only the reactive wrapper (`useSyncExternalStore`)
 * differs. Default behind `useCombobox`; the OriHeadless contract lets an app swap a custom / Zag-backed one.
 */
export const nativeCombobox = (options: UseComboboxOptions): ComboboxControl => {
    const id = useBaseId(options.id);

    const serviceRef = useRef<ReturnType<typeof combobox.machine> | null>(null);
    const service = (serviceRef.current ??= combobox.machine({
        id,
        defaultValue: options.value ?? null,
        defaultInputValue: options.inputValue ?? '',
        disabled: options.disabled
    }));

    useService(service);

    // Keep `disabled` reactive past creation (sending the same value is a no-op — the reducer returns the
    // same state, so no extra render).
    useEffect(() => {
        service.send({ type: 'SET_DISABLED', disabled: options.disabled ?? false });
    }, [service, options.disabled]);

    // Visible items: filter by the current input — but show the whole list when the input is empty or still
    // equals the committed selection's label (so picking an option doesn't collapse the list to one). The
    // collection drives both navigation and the active-descendant id.
    const state = service.getState();
    const items = useMemo<ComboboxItem[]>(() => {
        const all = options.options;
        const selectedLabel =
            state.value !== null ? all.find((option) => option.value === state.value)?.label : undefined;
        if (state.inputValue.trim() === '' || state.inputValue === selectedLabel) return all;
        const filter = options.filter ?? defaultComboboxFilter;
        return all.filter((item) => filter(item, state.inputValue));
    }, [options.options, options.filter, state.inputValue, state.value]);

    const api = combobox.connect(service, normalizeProps, items);

    return {
        open: api.open,
        value: api.value,
        inputValue: api.inputValue,
        highlightedValue: api.highlightedValue,
        items,
        rootProps: api.getRootProps(),
        labelProps: api.getLabelProps(),
        controlProps: api.getControlProps(),
        inputProps: api.getInputProps(),
        triggerProps: api.getTriggerProps(),
        clearTriggerProps: api.getClearTriggerProps(),
        listboxProps: api.getListboxProps(),
        getOptionProps: (item, index) => api.getOptionProps(item, index),
        getOptionState: (item) => api.getOptionState(item),
        setOpen: (open: boolean) => api.setOpen(open),
        setInputValue: (next: string) => api.setInputValue(next),
        select: (item: ComboboxItem) => api.select(item),
        clear: () => api.clear()
    };
};

/**
 * Native oriUI Menu adapter (React) — the WAI-ARIA menu-button + roving tabindex on `../core`. Default
 * behind `useMenu`; swappable through the OriHeadless contract like the others.
 */
export const nativeMenu = (options: UseMenuOptions): MenuControl => {
    const id = useBaseId(options.id);

    const serviceRef = useRef<ReturnType<typeof menu.machine> | null>(null);
    const service = (serviceRef.current ??= menu.machine({ id, disabled: options.disabled }));

    useService(service);

    useEffect(() => {
        service.send({ type: 'SET_DISABLED', disabled: options.disabled ?? false });
    }, [service, options.disabled]);

    const items = options.items;
    const api = menu.connect(service, normalizeProps, items, options.onSelect);

    return {
        open: api.open,
        highlightedValue: api.highlightedValue,
        items,
        triggerProps: api.getTriggerProps(),
        contentProps: api.getContentProps(),
        separatorProps: api.getSeparatorProps(),
        getItemProps: (item, index) => api.getItemProps(item, index),
        getItemState: (item) => api.getItemState(item),
        setOpen: (open: boolean) => api.setOpen(open),
        highlight: (value: string | null) => api.highlight(value),
        highlightFirst: () => api.highlightFirst(),
        highlightLast: () => api.highlightLast()
    };
};
