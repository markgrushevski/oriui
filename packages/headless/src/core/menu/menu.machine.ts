import { createMachine, type Service } from '../machine';
import { createScope } from '../scope';
import type { MenuContext, MenuEvent, MenuProps } from './menu.types';

export type MenuService = Service<MenuContext, MenuEvent>;

/**
 * The menu state machine — open state + the roving-highlighted item. Like the combobox machine it is a
 * tiny pure reducer, deliberately dumb about the item list: which item is "next" is computed by the
 * connect (it holds the visible collection) and fed back as a `HIGHLIGHT` event. Selection is an action
 * (fire-and-forget), so — unlike the combobox — the machine keeps no committed value; the connect closes
 * and the adapter invokes the item's callback.
 */
export function machine(props: MenuProps): MenuService {
    const scope = createScope({ id: props.id });

    return createMachine<MenuContext, MenuEvent>(
        {
            initial: {
                open: false,
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
                    case 'HIGHLIGHT':
                        return context.highlightedValue === event.value
                            ? context
                            : { ...context, highlightedValue: event.value };
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
