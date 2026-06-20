import { computed, toValue, useId, watch, type MaybeRefOrGetter } from 'vue';
import { combobox, type ComboboxItem } from '../core';
import { normalizeProps } from './normalize-props';
import { useService } from './use-machine';

export interface UseComboboxOptions {
    /** Stable base id; auto-generated via `useId` when omitted. */
    id?: string;
    /** The full option list. Reactive — filtering re-runs when it changes. */
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
 * Headless single-select combobox — the first behavior to fully exercise the `@oriui/headless` core
 * (state machine + prop-getters + WAI-ARIA listbox keyboard). Consumes the core engine directly and
 * returns ready-to-`v-bind` prop bags plus the visible (filtered) items. Build any UI on top, or use
 * the styled `OriCombobox`.
 */
export function useCombobox(options: MaybeRefOrGetter<UseComboboxOptions>) {
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
        const filter = opts.value.filter ?? defaultFilter;
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
}
