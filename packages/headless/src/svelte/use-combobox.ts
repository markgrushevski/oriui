import { derived, get } from 'svelte/store';
import { combobox, type ComboboxItem } from '../core';
import { uid } from './id';
import { normalizeProps } from './normalize-props';
import { safeOnDestroy, serviceVersion, toReadable, type MaybeReactive } from './use-store';

export interface UseComboboxOptions {
    /** Stable base id; auto-generated when omitted (pass one for SSR). */
    id?: string;
    /** The full option list. Reactive when the whole options object is passed as a store. */
    options: ComboboxItem[];
    /** Initial selected value. */
    value?: string | null;
    /** Initial input text. */
    inputValue?: string;
    disabled?: boolean;
    /** Filter predicate; default = case-insensitive substring on the label. */
    filter?: (item: ComboboxItem, query: string) => boolean;
}

const defaultFilter = (item: ComboboxItem, query: string): boolean =>
    item.label.toLowerCase().includes(query.trim().toLowerCase());

/**
 * Headless single-select combobox on the shared `@oriui/headless` core (state machine + prop-getters +
 * WAI-ARIA listbox keyboard) — the Svelte twin of the Vue `useCombobox`. Returns Svelte stores of the
 * ready-to-spread prop bags plus the visible (filtered) items; the item prop-getters are stores of a
 * function (`$getOptionProps(item, i)`). Drive interaction through the returned methods.
 *
 * Options are a `MaybeReactive<UseComboboxOptions>`: pass a plain object for a fixed config, or a Svelte
 * store to react to external changes — the visible items re-filter when `options` changes and `disabled`
 * is pushed into the machine (which closes the listbox). `id` / initial `value` / initial `inputValue`
 * are read once. Build any UI on top, or use the styled `OriCombobox`.
 */
export function useCombobox(options: MaybeReactive<UseComboboxOptions>) {
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
        const filter = o.filter ?? defaultFilter;
        return all.filter((item) => filter(item, inputValue));
    };

    // Recompute on machine changes (version$) AND option changes (opts$).
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
}
