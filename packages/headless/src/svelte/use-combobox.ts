import { derived, get } from 'svelte/store';
import { combobox, type ComboboxItem } from '../core';
import { uid } from './id';
import { normalizeProps } from './normalize-props';
import { connectStore } from './use-store';

export interface UseComboboxOptions {
    /** Stable base id; auto-generated when omitted (pass one for SSR). */
    id?: string;
    /** The full option list. Read once at creation — see the reactivity note below. */
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
 * Reactivity note: the interactive state (input text, highlight, open, selection) lives in the machine
 * and is fully reactive through these stores — typing filters live. The external `options` / `disabled`
 * are read once at creation; to change them, re-create the composable (reactive external props are a
 * follow-up). Build any UI on top, or use the styled `OriCombobox`.
 */
export function useCombobox(options: UseComboboxOptions) {
    const service = combobox.machine({
        id: options.id ?? uid('combobox'),
        defaultValue: options.value ?? null,
        defaultInputValue: options.inputValue ?? '',
        disabled: options.disabled
    });
    const filter = options.filter ?? defaultFilter;

    // Visible items: filter by the current input — but show the whole list when the input is empty or
    // still equals the committed selection's label (so picking an option doesn't collapse the list).
    const visibleItems = (): ComboboxItem[] => {
        const { inputValue, value } = service.getState();
        const all = options.options;
        const selectedLabel = value !== null ? all.find((option) => option.value === value)?.label : undefined;
        if (inputValue.trim() === '' || inputValue === selectedLabel) return all;
        return all.filter((item) => filter(item, inputValue));
    };

    const api = connectStore(service, () => combobox.connect(service, normalizeProps, visibleItems()));

    return {
        open: derived(api, (a) => a.open),
        value: derived(api, (a) => a.value),
        inputValue: derived(api, (a) => a.inputValue),
        highlightedValue: derived(api, (a) => a.highlightedValue),
        items: derived(api, () => visibleItems()),
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
