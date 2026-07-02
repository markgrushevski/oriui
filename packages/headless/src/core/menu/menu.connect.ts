import type { NormalizeProps, PropTypes } from '../types';
import { anatomy } from './menu.anatomy';
import type { MenuService } from './menu.machine';
import type { MenuItem } from './menu.types';

const parts = anatomy.build();

export interface MenuItemState {
    highlighted: boolean;
}

export interface MenuApi<T extends PropTypes = PropTypes> {
    open: boolean;
    highlightedValue: string | null;
    setOpen(open: boolean): void;
    highlight(value: string | null): void;
    /** Move the highlight relative to the current one (wraps), among enabled items. */
    highlightFirst(): void;
    highlightLast(): void;
    getTriggerProps(): T['button'];
    getContentProps(): T['element'];
    getItemProps(item: MenuItem, index: number): T['element'];
    getSeparatorProps(): T['element'];
    getItemState(item: MenuItem): MenuItemState;
}

/**
 * Pure projection of menu state -> prop-getters, carrying the WAI-ARIA menu-button pattern:
 * `aria-haspopup="menu"` / `aria-expanded` / `aria-controls` on the trigger, `role="menu"` on the
 * content, and **roving tabindex** on the items (`tabindex=0` on the active item, `-1` on the rest) plus
 * the full keyboard contract (Arrow/Home/End move the highlight, Enter/Space open from the trigger,
 * Escape/Tab close). `collection` is the current item list, so navigation stays in sync with what renders;
 * `onSelect` fires the item's action (the machine keeps no value — activation is fire-and-forget). The
 * adapter supplies `normalize` and re-invokes this on every state change, then moves DOM focus to the
 * highlighted item (roving requires real focus, which a framework-agnostic projection can't do itself).
 */
export function connect<T extends PropTypes>(
    service: MenuService,
    normalize: NormalizeProps<T>,
    collection: MenuItem[],
    onSelect?: (value: string) => void
): MenuApi<T> {
    const { open, highlightedValue, disabled } = service.getState();
    const { scope } = service;
    const triggerId = scope.getId('trigger');
    const contentId = scope.getId('content');
    const itemId = (index: number) => scope.getId(`item-${index}`);

    const enabled = collection.filter((item) => !item.disabled);
    const enabledCursor = highlightedValue === null ? -1 : enabled.findIndex((i) => i.value === highlightedValue);

    const send = service.send;
    function highlightAt(cursor: number): void {
        if (enabled.length === 0) return;
        const item = enabled[(cursor + enabled.length) % enabled.length];
        if (item) send({ type: 'HIGHLIGHT', value: item.value });
    }
    function openAndHighlight(edge: 'first' | 'last'): void {
        send({ type: 'OPEN' });
        highlightAt(edge === 'first' ? 0 : enabled.length - 1);
    }
    function activate(item: MenuItem): void {
        if (item.disabled) return;
        onSelect?.(item.value);
        send({ type: 'CLOSE' });
    }

    return {
        open,
        highlightedValue,
        setOpen(next) {
            send({ type: next ? 'OPEN' : 'CLOSE' });
        },
        highlight(value) {
            send({ type: 'HIGHLIGHT', value });
        },
        highlightFirst() {
            highlightAt(0);
        },
        highlightLast() {
            highlightAt(enabled.length - 1);
        },

        getTriggerProps() {
            return normalize.button({
                ...parts.trigger.attrs,
                id: triggerId,
                type: 'button',
                'aria-haspopup': 'menu',
                'aria-controls': contentId,
                'aria-expanded': open,
                'data-state': open ? 'open' : 'closed',
                disabled: disabled || undefined,
                onClick() {
                    send({ type: open ? 'CLOSE' : 'OPEN' });
                },
                onKeydown(event: KeyboardEvent) {
                    switch (event.key) {
                        case 'ArrowDown':
                        case 'Enter':
                        case ' ':
                            event.preventDefault();
                            openAndHighlight('first');
                            break;
                        case 'ArrowUp':
                            event.preventDefault();
                            openAndHighlight('last');
                            break;
                    }
                }
            });
        },

        getContentProps() {
            return normalize.element({
                ...parts.content.attrs,
                id: contentId,
                role: 'menu',
                tabindex: -1,
                'aria-labelledby': triggerId,
                'aria-orientation': 'vertical',
                'data-state': open ? 'open' : 'closed',
                hidden: !open,
                onKeydown(event: KeyboardEvent) {
                    switch (event.key) {
                        case 'ArrowDown':
                            event.preventDefault();
                            highlightAt(enabledCursor + 1);
                            break;
                        case 'ArrowUp':
                            event.preventDefault();
                            highlightAt(enabledCursor - 1);
                            break;
                        case 'Home':
                            event.preventDefault();
                            highlightAt(0);
                            break;
                        case 'End':
                            event.preventDefault();
                            highlightAt(enabled.length - 1);
                            break;
                        case 'Enter':
                        case ' ': {
                            if (highlightedValue === null) break;
                            event.preventDefault();
                            const item = collection.find((i) => i.value === highlightedValue);
                            if (item) activate(item);
                            break;
                        }
                        case 'Escape':
                            event.preventDefault();
                            send({ type: 'CLOSE' });
                            break;
                        case 'Tab':
                            // Tabbing out closes the menu (focus returns to the trigger via the adapter).
                            send({ type: 'CLOSE' });
                            break;
                    }
                }
            });
        },

        getItemProps(item, index) {
            const highlighted = item.value === highlightedValue;
            return normalize.element({
                ...parts.item.attrs,
                id: itemId(index),
                role: 'menuitem',
                tabindex: highlighted ? 0 : -1,
                'aria-disabled': item.disabled || undefined,
                'data-highlighted': highlighted ? '' : undefined,
                onClick() {
                    activate(item);
                },
                onPointermove() {
                    if (!item.disabled && highlightedValue !== item.value) {
                        send({ type: 'HIGHLIGHT', value: item.value });
                    }
                }
            });
        },

        getSeparatorProps() {
            return normalize.element({
                ...parts.separator.attrs,
                role: 'separator',
                'aria-orientation': 'horizontal'
            });
        },

        getItemState(item) {
            return { highlighted: item.value === highlightedValue };
        }
    };
}
