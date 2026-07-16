import { afterEach, describe, it, expect, vi } from 'vitest';
import { renderHook, act, cleanup } from '@testing-library/react';
import { createElement, type ReactNode } from 'react';
import { useDialog, useCombobox, useMenu, OriHeadlessProvider, type DialogControl } from '@oriui/headless/react';

// The three machine-adapter hooks (useDialog / useCombobox / useMenu) over the shared `../core` engine,
// bridged to React via `useSyncExternalStore`. Exercised with `renderHook` (no JSX); `act()` flushes machine
// changes. The combobox/menu bags flow through the React `normalizeProps`, so this also proves the neutral
// `onKeydown` → React `onKeyDown` / `tabindex` → `tabIndex` casing on the machine path. Mirrors
// tests/svelte-adapter for the Svelte side.

afterEach(() => {
    cleanup();
    document.body.innerHTML = '';
});

describe('React useDialog (native fallback)', () => {
    it('exposes the trigger + dialog prop bags with the native-event handlers', () => {
        const onOpenChange = vi.fn();
        const { result } = renderHook(() => useDialog({ id: 'dl', onOpenChange }));

        expect(result.current.open).toBe(false);

        const trigger = result.current.triggerProps;
        expect(trigger['aria-haspopup']).toBe('dialog');
        expect(trigger['aria-expanded']).toBe(false);
        expect(typeof trigger.onClick).toBe('function');

        const dialog = result.current.dialogProps;
        expect(dialog.role).toBe('dialog');
        expect(dialog['aria-modal']).toBe('true');
        expect(dialog['aria-labelledby']).toBe('dl-title');
        expect(typeof dialog.onClose).toBe('function');
        expect(typeof dialog.onClick).toBe('function');
        expect(dialog.onCancel).toBeUndefined(); // present only as an Esc guard when closeOnEscape === false

        expect(result.current.titleProps.id).toBe('dl-title');
        expect(result.current.descriptionProps.id).toBe('dl-description');
        expect(typeof result.current.closeTriggerProps.onClick).toBe('function');
    });

    it('setOpen fires onOpenChange once, toggles, and no-ops on the same value', () => {
        const onOpenChange = vi.fn();
        const { result } = renderHook(() => useDialog({ id: 'd2', onOpenChange }));

        act(() => result.current.setOpen(true));
        expect(result.current.open).toBe(true);
        expect(result.current.triggerProps['aria-expanded']).toBe(true);
        expect(onOpenChange).toHaveBeenCalledWith(true);
        expect(onOpenChange).toHaveBeenCalledTimes(1);

        act(() => result.current.setOpen(true)); // same value → no re-fire
        expect(onOpenChange).toHaveBeenCalledTimes(1);

        act(() => result.current.toggle());
        expect(result.current.open).toBe(false);
        expect(onOpenChange).toHaveBeenCalledTimes(2);
    });

    it('modal:false drops aria-modal; closeOnEscape:false keeps an onCancel guard', () => {
        const nonModal = renderHook(() => useDialog({ id: 'm', modal: false }));
        expect(nonModal.result.current.dialogProps['aria-modal']).toBeUndefined();

        const noEsc = renderHook(() => useDialog({ id: 'e', closeOnEscape: false }));
        expect(typeof noEsc.result.current.dialogProps.onCancel).toBe('function');
    });

    it('resolves a provided adapter over the native default', () => {
        const control = {
            open: true,
            setOpen: () => {},
            toggle: () => {},
            triggerProps: { 'data-fake': 'trigger' },
            dialogProps: { 'data-fake': 'dialog' },
            titleProps: {},
            descriptionProps: {},
            closeTriggerProps: {}
        } satisfies DialogControl;
        const wrapper = ({ children }: { children: ReactNode }) =>
            createElement(OriHeadlessProvider, { adapters: { dialog: () => control }, children });

        const { result } = renderHook(() => useDialog({ id: 'p' }), { wrapper });
        expect(result.current.open).toBe(true);
        expect(result.current.dialogProps['data-fake']).toBe('dialog');
    });
});

describe('React useCombobox (native fallback)', () => {
    const OPTIONS = [
        { label: 'Apple', value: 'apple' },
        { label: 'Banana', value: 'banana' },
        { label: 'Cherry', value: 'cherry', disabled: true },
        { label: 'Grape', value: 'grape' }
    ];

    it('starts closed, empty, with the full list and a role=combobox input (React-cased handlers)', () => {
        const { result } = renderHook(() => useCombobox({ id: 'c', options: OPTIONS }));

        expect(result.current.open).toBe(false);
        expect(result.current.value).toBe(null);
        expect(result.current.inputValue).toBe('');
        expect(result.current.items).toHaveLength(4);

        const input = result.current.inputProps;
        expect(input.role).toBe('combobox');
        // The core emits `onKeydown`; the React normalizer must have re-cased it (proves the machine path).
        expect(typeof input.onKeyDown).toBe('function');
        expect('onKeydown' in input).toBe(false);
    });

    it('setInputValue filters the visible items live and opens', () => {
        const { result } = renderHook(() => useCombobox({ id: 'c', options: OPTIONS }));

        act(() => result.current.setInputValue('ap')); // matches Apple + grAPe (substring)
        expect(result.current.open).toBe(true);
        expect(result.current.items.map((i) => i.label)).toEqual(['Apple', 'Grape']);
    });

    it('select commits value + label and closes; clear resets', () => {
        const { result } = renderHook(() => useCombobox({ id: 'c', options: OPTIONS }));

        act(() => result.current.select({ label: 'Banana', value: 'banana' }));
        expect(result.current.value).toBe('banana');
        expect(result.current.inputValue).toBe('Banana');
        expect(result.current.open).toBe(false);

        act(() => result.current.clear());
        expect(result.current.value).toBe(null);
        expect(result.current.inputValue).toBe('');
    });

    it('getOptionProps returns role=option props; toggling disabled closes the listbox', () => {
        const { result, rerender } = renderHook(
            (props: { disabled: boolean }) => useCombobox({ id: 'rd', options: OPTIONS, disabled: props.disabled }),
            {
                initialProps: { disabled: false }
            }
        );

        expect(result.current.getOptionProps(OPTIONS[0]!, 0).role).toBe('option');

        act(() => result.current.setOpen(true));
        expect(result.current.open).toBe(true);

        rerender({ disabled: true }); // the disabled-sync effect pushes SET_DISABLED and closes
        expect(result.current.open).toBe(false);
    });
});

describe('React useMenu (native fallback)', () => {
    const ITEMS = [
        { label: 'Copy', value: 'copy' },
        { label: 'Paste', value: 'paste' }
    ];

    it('starts closed with the WAI-ARIA menu-button wiring', () => {
        const { result } = renderHook(() => useMenu({ id: 'm', items: ITEMS }));

        expect(result.current.open).toBe(false);
        expect(result.current.highlightedValue).toBe(null);
        expect(result.current.items).toHaveLength(2);

        expect(result.current.triggerProps['aria-haspopup']).toBe('menu');
        expect(result.current.triggerProps['aria-expanded']).toBe(false);
        expect(result.current.contentProps.role).toBe('menu');
    });

    it('setOpen + highlightFirst drive the reactive state; getItemProps is role=menuitem with a React handler', () => {
        const { result } = renderHook(() => useMenu({ id: 'm', items: ITEMS }));

        act(() => result.current.setOpen(true));
        expect(result.current.open).toBe(true);
        expect(result.current.triggerProps['aria-expanded']).toBe(true);

        act(() => result.current.highlightFirst());
        expect(result.current.highlightedValue).toBe('copy');

        const item = result.current.getItemProps(ITEMS[0]!, 0);
        expect(item.role).toBe('menuitem');
        expect(typeof item.onClick).toBe('function');
        expect('onClick' in item).toBe(true);
    });
});
