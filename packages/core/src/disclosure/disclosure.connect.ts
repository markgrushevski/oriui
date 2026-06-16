import type { NormalizeProps, PropTypes } from '../types';
import { anatomy } from './disclosure.anatomy';
import type { DisclosureService } from './disclosure.machine';

const parts = anatomy.build();

export interface DisclosureApi<T extends PropTypes = PropTypes> {
    /** Whether the content is currently expanded. */
    open: boolean;
    setOpen(open: boolean): void;
    toggle(): void;
    getRootProps(): T['element'];
    getTriggerProps(): T['button'];
    getContentProps(): T['element'];
}

/**
 * Pure projection of machine state -> prop-getters. Carries the WAI-ARIA Disclosure wiring
 * (`aria-expanded`, `aria-controls`/`aria-labelledby`, real `hidden`) and `data-state` styling
 * hooks. The framework adapter supplies `normalize` and re-invokes this on every state change.
 */
export function connect<T extends PropTypes>(
    service: DisclosureService,
    normalize: NormalizeProps<T>
): DisclosureApi<T> {
    const { open, disabled } = service.getState();
    const { scope } = service;
    const triggerId = scope.getId('trigger');
    const contentId = scope.getId('content');

    return {
        open,
        setOpen(next) {
            service.send({ type: 'SET', open: next });
        },
        toggle() {
            service.send({ type: 'TOGGLE' });
        },
        getRootProps() {
            return normalize.element({
                ...parts.root.attrs,
                'data-state': open ? 'open' : 'closed'
            });
        },
        getTriggerProps() {
            return normalize.button({
                ...parts.trigger.attrs,
                id: triggerId,
                type: 'button',
                'aria-controls': contentId,
                'aria-expanded': open,
                'data-state': open ? 'open' : 'closed',
                'data-disabled': disabled ? '' : undefined,
                disabled: disabled || undefined,
                onClick() {
                    service.send({ type: 'TOGGLE' });
                }
            });
        },
        getContentProps() {
            return normalize.element({
                ...parts.content.attrs,
                id: contentId,
                role: 'region',
                'aria-labelledby': triggerId,
                hidden: !open,
                'data-state': open ? 'open' : 'closed'
            });
        }
    };
}
