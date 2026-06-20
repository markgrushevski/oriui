import { createMachine, type Service } from '../machine';
import { createScope } from '../scope';
import type { ComboboxContext, ComboboxEvent, ComboboxProps } from './combobox.types';

export type ComboboxService = Service<ComboboxContext, ComboboxEvent>;

/**
 * The combobox state machine — open state + selected value + input text + the highlighted option.
 * Deliberately dumb about the option list: keyboard navigation (which option is "next") and filtering
 * are computed by the consumer (it knows the visible collection) and fed back as `HIGHLIGHT` / `SELECT`
 * events. That keeps the machine a tiny pure reducer, framework- and collection-agnostic.
 */
export function machine(props: ComboboxProps): ComboboxService {
    const scope = createScope({ id: props.id });

    return createMachine<ComboboxContext, ComboboxEvent>(
        {
            initial: {
                open: false,
                value: props.defaultValue ?? null,
                inputValue: props.defaultInputValue ?? '',
                highlightedValue: null,
                disabled: props.disabled ?? false
            },
            reducer(context, event) {
                switch (event.type) {
                    case 'OPEN':
                        return context.open ? context : { ...context, open: true };
                    case 'CLOSE':
                        return !context.open && context.highlightedValue === null
                            ? context
                            : { ...context, open: false, highlightedValue: null };
                    case 'SET_INPUT':
                        // Typing filters and (re)opens; the prior highlight no longer maps to the list.
                        return { ...context, inputValue: event.value, open: true, highlightedValue: null };
                    case 'HIGHLIGHT':
                        return context.highlightedValue === event.value
                            ? context
                            : { ...context, highlightedValue: event.value };
                    case 'SELECT':
                        // Commit the choice: reflect its label in the input and close.
                        return {
                            ...context,
                            value: event.value,
                            inputValue: event.label,
                            open: false,
                            highlightedValue: null
                        };
                    case 'CLEAR':
                        return context.value === null && context.inputValue === ''
                            ? context
                            : { ...context, value: null, inputValue: '', highlightedValue: null };
                    case 'SET_DISABLED':
                        return context.disabled === event.disabled
                            ? context
                            : { ...context, disabled: event.disabled, open: event.disabled ? false : context.open };
                    default:
                        return context;
                }
            }
        },
        scope
    );
}
