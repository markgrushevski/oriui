import { createMachine, type Service } from '../machine';
import { createScope } from '../scope';
import type { DisclosureContext, DisclosureEvent, DisclosureProps } from './disclosure.types';

export type DisclosureService = Service<DisclosureContext, DisclosureEvent>;

export function machine(props: DisclosureProps): DisclosureService {
    const scope = createScope({ id: props.id });

    return createMachine<DisclosureContext, DisclosureEvent>(
        {
            initial: {
                open: props.defaultOpen ?? false,
                disabled: props.disabled ?? false
            },
            reducer(context, event) {
                switch (event.type) {
                    case 'TOGGLE':
                        return context.disabled ? context : { ...context, open: !context.open };
                    case 'OPEN':
                        return context.open ? context : { ...context, open: true };
                    case 'CLOSE':
                        return !context.open ? context : { ...context, open: false };
                    case 'SET':
                        return context.open === event.open ? context : { ...context, open: event.open };
                    default:
                        return context;
                }
            }
        },
        scope
    );
}
