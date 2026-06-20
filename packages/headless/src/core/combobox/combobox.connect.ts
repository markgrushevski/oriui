import type { NormalizeProps, PropTypes } from '../types';
import { anatomy } from './combobox.anatomy';
import type { ComboboxService } from './combobox.machine';
import type { ComboboxItem } from './combobox.types';

const parts = anatomy.build();

export interface ComboboxOptionState {
    highlighted: boolean;
    selected: boolean;
}

export interface ComboboxApi<T extends PropTypes = PropTypes> {
    open: boolean;
    value: string | null;
    inputValue: string;
    highlightedValue: string | null;
    setOpen(open: boolean): void;
    setInputValue(value: string): void;
    select(item: ComboboxItem): void;
    clear(): void;
    getRootProps(): T['element'];
    getLabelProps(): T['element'];
    getControlProps(): T['element'];
    getInputProps(): T['element'];
    getTriggerProps(): T['button'];
    getClearTriggerProps(): T['button'];
    getListboxProps(): T['element'];
    getOptionProps(item: ComboboxItem, index: number): T['element'];
    getOptionState(item: ComboboxItem): ComboboxOptionState;
}

/**
 * Pure projection of machine state -> prop-getters, carrying the WAI-ARIA combobox (listbox-popup)
 * wiring: `role="combobox"` + `aria-expanded` / `aria-controls` / `aria-activedescendant` on the input,
 * `role="listbox"` + `role="option"` + `aria-selected` on the popup, plus the full keyboard contract
 * (Arrow/Home/End move the highlight, Enter selects, Escape closes). `collection` is the currently
 * visible (already-filtered) items, so navigation and the active-descendant id stay in sync with what
 * the user sees. The framework adapter supplies `normalize` and re-invokes this on every state change.
 */
export function connect<T extends PropTypes>(
    service: ComboboxService,
    normalize: NormalizeProps<T>,
    collection: ComboboxItem[]
): ComboboxApi<T> {
    const { open, value, inputValue, highlightedValue, disabled } = service.getState();
    const { scope } = service;
    const labelId = scope.getId('label');
    const inputId = scope.getId('input');
    const listboxId = scope.getId('listbox');
    const optionId = (index: number) => scope.getId(`option-${index}`);

    const enabled = collection.filter((item) => !item.disabled);
    const highlightedIndex = highlightedValue === null ? -1 : collection.findIndex((i) => i.value === highlightedValue);
    const enabledCursor = highlightedValue === null ? -1 : enabled.findIndex((i) => i.value === highlightedValue);

    const send = service.send;
    function highlightAt(cursor: number): void {
        if (enabled.length === 0) return;
        const item = enabled[(cursor + enabled.length) % enabled.length];
        if (item) send({ type: 'HIGHLIGHT', value: item.value });
    }
    function selectItem(item: ComboboxItem): void {
        if (item.disabled) return;
        send({ type: 'SELECT', value: item.value, label: item.label });
    }

    return {
        open,
        value,
        inputValue,
        highlightedValue,
        setOpen(next) {
            send({ type: next ? 'OPEN' : 'CLOSE' });
        },
        setInputValue(next) {
            send({ type: 'SET_INPUT', value: next });
        },
        select(item) {
            selectItem(item);
        },
        clear() {
            send({ type: 'CLEAR' });
        },

        getRootProps() {
            return normalize.element({
                ...parts.root.attrs,
                'data-state': open ? 'open' : 'closed'
            });
        },

        getLabelProps() {
            return normalize.element({
                ...parts.label.attrs,
                id: labelId,
                for: inputId
            });
        },

        getControlProps() {
            return normalize.element({
                ...parts.control.attrs,
                'data-state': open ? 'open' : 'closed',
                'data-disabled': disabled ? '' : undefined
            });
        },

        getInputProps() {
            return normalize.element({
                ...parts.input.attrs,
                id: inputId,
                role: 'combobox',
                autocomplete: 'off',
                'aria-autocomplete': 'list',
                'aria-expanded': open,
                'aria-controls': listboxId,
                'aria-activedescendant': open && highlightedIndex >= 0 ? optionId(highlightedIndex) : undefined,
                disabled: disabled || undefined,
                value: inputValue,
                onInput(event: Event) {
                    send({ type: 'SET_INPUT', value: (event.target as HTMLInputElement).value });
                },
                onKeydown(event: KeyboardEvent) {
                    switch (event.key) {
                        case 'ArrowDown':
                            event.preventDefault();
                            if (!open) send({ type: 'OPEN' });
                            highlightAt(open ? enabledCursor + 1 : 0);
                            break;
                        case 'ArrowUp':
                            event.preventDefault();
                            if (!open) send({ type: 'OPEN' });
                            highlightAt(open ? enabledCursor - 1 : enabled.length - 1);
                            break;
                        case 'Enter':
                            if (open && highlightedValue !== null) {
                                event.preventDefault();
                                const item = collection.find((i) => i.value === highlightedValue);
                                if (item) selectItem(item);
                            }
                            break;
                        case 'Escape':
                            if (open) {
                                event.preventDefault();
                                send({ type: 'CLOSE' });
                            }
                            break;
                        case 'Home':
                            if (open) {
                                event.preventDefault();
                                highlightAt(0);
                            }
                            break;
                        case 'End':
                            if (open) {
                                event.preventDefault();
                                highlightAt(enabled.length - 1);
                            }
                            break;
                    }
                }
            });
        },

        getTriggerProps() {
            return normalize.button({
                ...parts.trigger.attrs,
                type: 'button',
                tabindex: -1,
                'aria-label': open ? 'Close suggestions' : 'Open suggestions',
                'aria-controls': listboxId,
                'aria-expanded': open,
                disabled: disabled || undefined,
                onClick() {
                    send({ type: open ? 'CLOSE' : 'OPEN' });
                }
            });
        },

        getClearTriggerProps() {
            return normalize.button({
                ...parts.clearTrigger.attrs,
                type: 'button',
                tabindex: -1,
                'aria-label': 'Clear selection',
                disabled: disabled || undefined,
                onClick() {
                    send({ type: 'CLEAR' });
                }
            });
        },

        getListboxProps() {
            return normalize.element({
                ...parts.listbox.attrs,
                id: listboxId,
                role: 'listbox',
                'aria-labelledby': labelId,
                hidden: !open
            });
        },

        getOptionProps(item, index) {
            const selected = item.value === value;
            const highlighted = item.value === highlightedValue;
            return normalize.element({
                ...parts.option.attrs,
                id: optionId(index),
                role: 'option',
                'aria-selected': selected,
                'aria-disabled': item.disabled || undefined,
                'data-highlighted': highlighted ? '' : undefined,
                'data-state': selected ? 'checked' : 'unchecked',
                onClick() {
                    selectItem(item);
                },
                onPointermove() {
                    if (!item.disabled && highlightedValue !== item.value) {
                        send({ type: 'HIGHLIGHT', value: item.value });
                    }
                }
            });
        },

        getOptionState(item) {
            return {
                highlighted: item.value === highlightedValue,
                selected: item.value === value
            };
        }
    };
}
