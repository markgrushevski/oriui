import { computed, ref, toValue, useId, watch, type MaybeRefOrGetter } from 'vue';
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

const defaultComboboxFilter = (item: ComboboxItem, query: string): boolean =>
    item.label.toLowerCase().includes(query.trim().toLowerCase());

/**
 * Native oriUI Combobox adapter — the WAI-ARIA listbox-combobox on the in-house `../core` state machine
 * (prop-getters + the full keyboard contract). The default behind `useCombobox`; the OriHeadless contract
 * lets an app swap a custom / Zag-backed one per project without touching the component markup.
 */
export const nativeCombobox = (options: MaybeRefOrGetter<UseComboboxOptions>): ComboboxControl => {
    const opts = computed(() => toValue(options));
    const init = opts.value;

    const service = combobox.machine({
        id: init.id ?? useId() ?? 'combobox',
        defaultValue: init.value ?? null,
        defaultInputValue: init.inputValue ?? '',
        disabled: init.disabled
    });
    const version = useService(service);

    // Keep `disabled` reactive past the initial render.
    watch(
        () => opts.value.disabled ?? false,
        (disabled) => service.send({ type: 'SET_DISABLED', disabled })
    );

    // Visible items: filter by the current input — but show the whole list when the input is empty or
    // still equals the committed selection's label (so picking an option doesn't collapse the list to
    // one). The collection drives both navigation and the active-descendant id.
    const items = computed<ComboboxItem[]>(() => {
        void version.value;
        const { inputValue, value } = service.getState();
        const all = opts.value.options;
        const selectedLabel = value !== null ? all.find((option) => option.value === value)?.label : undefined;
        if (inputValue.trim() === '' || inputValue === selectedLabel) return all;
        const filter = opts.value.filter ?? defaultComboboxFilter;
        return all.filter((item) => filter(item, inputValue));
    });

    const api = computed(() => {
        void version.value;
        return combobox.connect(service, normalizeProps, items.value);
    });

    return {
        open: computed(() => api.value.open),
        value: computed(() => api.value.value),
        inputValue: computed(() => api.value.inputValue),
        highlightedValue: computed(() => api.value.highlightedValue),
        items,
        rootProps: computed(() => api.value.getRootProps()),
        labelProps: computed(() => api.value.getLabelProps()),
        controlProps: computed(() => api.value.getControlProps()),
        inputProps: computed(() => api.value.getInputProps()),
        triggerProps: computed(() => api.value.getTriggerProps()),
        clearTriggerProps: computed(() => api.value.getClearTriggerProps()),
        listboxProps: computed(() => api.value.getListboxProps()),
        getOptionProps: (item: ComboboxItem, index: number) => api.value.getOptionProps(item, index),
        getOptionState: (item: ComboboxItem) => api.value.getOptionState(item),
        setOpen: (open: boolean) => api.value.setOpen(open),
        setInputValue: (next: string) => api.value.setInputValue(next),
        select: (item: ComboboxItem) => api.value.select(item),
        clear: () => api.value.clear()
    };
};

/**
 * Native oriUI Menu adapter — the WAI-ARIA menu-button + roving tabindex on the `../core` machine. The
 * default behind `useMenu`; swappable via the OriHeadless contract like the others.
 */
export const nativeMenu = (options: MaybeRefOrGetter<UseMenuOptions>): MenuControl => {
    const opts = computed(() => toValue(options));
    const init = opts.value;

    const service = menu.machine({
        id: init.id ?? useId() ?? 'menu',
        disabled: init.disabled
    });
    const version = useService(service);

    // Keep `disabled` reactive past the initial render.
    watch(
        () => opts.value.disabled ?? false,
        (disabled) => service.send({ type: 'SET_DISABLED', disabled })
    );

    const items = computed(() => opts.value.items);

    const api = computed(() => {
        void version.value;
        return menu.connect(service, normalizeProps, items.value, opts.value.onSelect);
    });

    return {
        open: computed(() => api.value.open),
        highlightedValue: computed(() => api.value.highlightedValue),
        items,
        triggerProps: computed(() => api.value.getTriggerProps()),
        contentProps: computed(() => api.value.getContentProps()),
        separatorProps: computed(() => api.value.getSeparatorProps()),
        getItemProps: (item, index) => api.value.getItemProps(item, index),
        getItemState: (item) => api.value.getItemState(item),
        setOpen: (open: boolean) => api.value.setOpen(open),
        highlight: (value: string | null) => api.value.highlight(value),
        highlightFirst: () => api.value.highlightFirst(),
        highlightLast: () => api.value.highlightLast()
    };
};
