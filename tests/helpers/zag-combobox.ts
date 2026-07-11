import { computed, ref, toValue, useId, type MaybeRefOrGetter } from 'vue';
import * as combobox from '@zag-js/combobox';
import { normalizeProps, useMachine } from '@zag-js/vue';
import type { ComboboxItem } from '@oriui/headless';
import type { ComboboxControl, UseComboboxOptions } from '@oriui/headless/vue';

// A **Zag-backed** ComboboxAdapter — the proof that oriUI's `OriHeadless` swap seam accepts a real,
// third-party behaviour engine with the OriCombobox SFC completely unchanged. It wraps the actual
// `@zag-js/combobox` state machine + `connect()` in oriUI's `ComboboxControl` contract shape. This
// lives in tests/ (Zag is a devDependency) — the shipped packages carry no Zag dependency.
//
// The interesting seams this exercises:
//  - Zag's `value` is `string[]` (multi-capable) → the contract's `string | null` (single-select).
//  - Zag splits the popup into positioner ▸ content; our SFC renders ONE <ul>. We map `getContentProps`
//    onto it and deliberately drop `getPositionerProps` — oriUI positions with CSS Anchor Positioning,
//    so Zag's popper positioner is unused (the machine/keyboard/ARIA still drive everything).
//  - Zag keys items by the item object (`getItemProps({ item })`), ignoring our `index`.
//  - External filtering is Zag's documented pattern: keep a `collection` of the *visible* items and
//    refilter on `onInputValueChange`.

const defaultFilter = (item: ComboboxItem, query: string) => item.label.toLowerCase().includes(query.toLowerCase());

// Finding: Zag's Vue `normalizeProps` returns Vue-typed prop bags (`HTMLAttributes & ReservedProps`)
// with no index signature, so they aren't structurally assignable to the contract's
// `Record<string, unknown>`. Runtime is fine; a bridging cast is the one type-level seam. (The contract
// could instead widen to `Record<string, unknown> | HTMLAttributes`, but a cast keeps the seam local.)
const asRecord = (o: unknown) => o as Record<string, unknown>;

export function zagCombobox(options: MaybeRefOrGetter<UseComboboxOptions>): ComboboxControl {
    const initial = toValue(options);
    const all = () => toValue(options).options;
    const filterFn = () => toValue(options).filter ?? defaultFilter;

    // Zag owns a collection of the *visible* (already-filtered) items; we filter externally.
    const visible = ref<ComboboxItem[]>(all());
    const collection = computed(() =>
        combobox.collection({
            items: visible.value,
            itemToValue: (i: ComboboxItem) => i.value,
            itemToString: (i: ComboboxItem) => i.label,
            isItemDisabled: (i: ComboboxItem) => Boolean(i.disabled)
        })
    );

    const service = useMachine(combobox.machine, {
        id: initial.id ?? useId(),
        get collection() {
            return collection.value;
        },
        get disabled() {
            return toValue(options).disabled;
        },
        defaultValue: initial.value != null ? [initial.value] : [],
        defaultInputValue: initial.inputValue ?? '',
        onInputValueChange({ inputValue }) {
            const q = inputValue.trim();
            visible.value = q ? all().filter((i) => filterFn()(i, q)) : all();
        }
    });

    const api = computed(() => combobox.connect(service, normalizeProps));

    return {
        open: computed(() => api.value.open),
        value: computed(() => api.value.value[0] ?? null),
        inputValue: computed(() => api.value.inputValue),
        highlightedValue: computed(() => api.value.highlightedValue),
        items: computed(() => visible.value),
        rootProps: computed(() => asRecord(api.value.getRootProps())),
        labelProps: computed(() => asRecord(api.value.getLabelProps())),
        controlProps: computed(() => asRecord(api.value.getControlProps())),
        inputProps: computed(() => asRecord(api.value.getInputProps())),
        triggerProps: computed(() => asRecord(api.value.getTriggerProps())),
        clearTriggerProps: computed(() => asRecord(api.value.getClearTriggerProps())),
        // Our single <ul> plays Zag's `content` part; hidden when closed to match the contract.
        listboxProps: computed(() => ({
            ...asRecord(api.value.getContentProps()),
            hidden: api.value.open ? undefined : true
        })),
        getOptionProps: (item) => asRecord(api.value.getItemProps({ item })),
        getOptionState: (item) => {
            const s = api.value.getItemState({ item });
            return { highlighted: s.highlighted, selected: s.selected };
        },
        setOpen: (open) => api.value.setOpen(open),
        setInputValue: (next) => api.value.setInputValue(next),
        select: (item) => api.value.selectValue(item.value),
        clear: () => api.value.clearValue()
    };
}
