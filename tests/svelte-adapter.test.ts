import { describe, it, expect, vi } from 'vitest';
import { get, writable } from 'svelte/store';
import {
    nativeDisclosure,
    nativeDialog,
    useDisclosure,
    useDialog,
    useCombobox,
    useMenu,
    normalizeProps
} from '@oriui/headless/svelte';

// The Svelte adapter is pure TS over the shared `../core` engine — it returns Svelte stores, so we can
// exercise it without rendering a component: `get(store)` reads the current value and a live
// `store.subscribe` proves reactivity. This mirrors tests/dialog / combobox for the Vue side and is the
// executable proof that the store bridge + the Svelte prop normalizer (lowercased events) are correct.

describe('Svelte normalizeProps', () => {
    it('lowercases onXxx handler keys so a spread wires real Svelte handlers', () => {
        const fn = () => {};
        const out = normalizeProps.button({ onClick: fn, onKeyDown: fn });

        expect(out.onclick).toBe(fn);
        expect(out.onkeydown).toBe(fn);
        expect('onClick' in out).toBe(false);
    });

    it('remaps className/htmlFor and drops undefined', () => {
        const out = normalizeProps.element({
            className: 'a',
            htmlFor: 'b',
            'aria-label': 'x',
            'data-state': 'open',
            title: undefined
        });

        expect(out.class).toBe('a');
        expect(out.for).toBe('b');
        expect(out['aria-label']).toBe('x');
        expect(out['data-state']).toBe('open');
        expect('title' in out).toBe(false);
        expect('className' in out).toBe(false);
    });
});

describe('Svelte nativeDisclosure', () => {
    it('starts closed with the WAI-ARIA wiring, ids derived from the base id', () => {
        const d = nativeDisclosure({ id: 'test' });

        expect(get(d.open)).toBe(false);

        const trigger = get(d.triggerProps);
        expect(trigger.id).toBe('ori-test-trigger');
        expect(trigger.type).toBe('button');
        expect(trigger['aria-controls']).toBe('ori-test-content');
        expect(trigger['aria-expanded']).toBe(false);
        // The core emits `onClick`; the Svelte normalizer must have lowercased it.
        expect(typeof trigger.onclick).toBe('function');
        expect('onClick' in trigger).toBe(false);

        const content = get(d.contentProps);
        expect(content.id).toBe('ori-test-content');
        expect(content.role).toBe('region');
        expect(content['aria-labelledby']).toBe('ori-test-trigger');
        expect(content.hidden).toBe(true);
    });

    it('setOpen / toggle drive the stores and re-project the prop bags', () => {
        const d = nativeDisclosure({ id: 'x' });

        d.setOpen(true);
        expect(get(d.open)).toBe(true);
        expect(get(d.triggerProps)['aria-expanded']).toBe(true);
        expect(get(d.contentProps).hidden).toBe(false);

        d.toggle();
        expect(get(d.open)).toBe(false);
    });

    it('a live subscriber is notified on every machine change (real reactivity)', () => {
        const d = nativeDisclosure({ id: 'live' });
        const seen: boolean[] = [];
        const stop = d.open.subscribe((v) => seen.push(v));

        d.setOpen(true);
        d.setOpen(false);
        stop();

        expect(seen).toEqual([false, true, false]);
    });

    it('a disabled disclosure ignores toggle and flags the trigger', () => {
        const d = nativeDisclosure({ id: 'd', disabled: true });

        d.toggle();
        expect(get(d.open)).toBe(false);

        const trigger = get(d.triggerProps);
        expect(trigger.disabled).toBe(true);
        expect(trigger['data-disabled']).toBe('');
    });
});

describe('Svelte nativeDialog', () => {
    it('exposes the trigger + dialog prop bags with lowercased native-event handlers', () => {
        const onOpenChange = vi.fn();
        const dlg = nativeDialog({ id: 'dl', onOpenChange });

        expect(get(dlg.open)).toBe(false);

        const trigger = get(dlg.triggerProps);
        expect(trigger['aria-haspopup']).toBe('dialog');
        expect(trigger['aria-expanded']).toBe(false);
        expect(typeof trigger.onclick).toBe('function');

        const dialog = get(dlg.dialogProps);
        expect(dialog.role).toBe('dialog');
        expect(dialog['aria-modal']).toBe('true');
        expect(dialog['aria-labelledby']).toBe('dl-title');
        expect(typeof dialog.onclose).toBe('function');
        expect(typeof dialog.onclick).toBe('function');
        // oncancel is absent by default (only present as an Esc-guard when closeOnEscape === false).
        expect(dialog.oncancel).toBeUndefined();

        expect(get(dlg.titleProps).id).toBe('dl-title');
        expect(get(dlg.descriptionProps).id).toBe('dl-description');
        expect(typeof get(dlg.closeTriggerProps).onclick).toBe('function');
    });

    it('setOpen fires onOpenChange once and toggles state', () => {
        const onOpenChange = vi.fn();
        const dlg = nativeDialog({ id: 'd2', onOpenChange });

        dlg.setOpen(true);
        expect(get(dlg.open)).toBe(true);
        expect(onOpenChange).toHaveBeenCalledWith(true);
        expect(onOpenChange).toHaveBeenCalledTimes(1);

        // no-op set: same value must not re-fire
        dlg.setOpen(true);
        expect(onOpenChange).toHaveBeenCalledTimes(1);
    });

    it('modal:false drops aria-modal; closeOnEscape:false keeps an oncancel guard', () => {
        const nonModal = get(nativeDialog({ id: 'm', modal: false }).dialogProps);
        expect(nonModal['aria-modal']).toBeUndefined();

        const noEsc = get(nativeDialog({ id: 'e', closeOnEscape: false }).dialogProps);
        expect(typeof noEsc.oncancel).toBe('function');
    });
});

describe('Svelte useCombobox', () => {
    const OPTIONS = [
        { label: 'Apple', value: 'apple' },
        { label: 'Banana', value: 'banana' },
        { label: 'Cherry', value: 'cherry', disabled: true },
        { label: 'Grape', value: 'grape' }
    ];

    it('starts closed, empty, with the full list and a role=combobox input', () => {
        const cb = useCombobox({ id: 'c', options: OPTIONS });

        expect(get(cb.open)).toBe(false);
        expect(get(cb.value)).toBe(null);
        expect(get(cb.inputValue)).toBe('');
        expect(get(cb.items)).toHaveLength(4);
        expect(get(cb.inputProps).role).toBe('combobox');
    });

    it('setInputValue filters the visible items live and opens', () => {
        const cb = useCombobox({ id: 'c', options: OPTIONS });

        cb.setInputValue('ap'); // matches Apple + grAPe (substring)
        expect(get(cb.open)).toBe(true);
        expect(get(cb.items).map((i) => i.label)).toEqual(['Apple', 'Grape']);
    });

    it('select commits value + label and closes; clear resets', () => {
        const cb = useCombobox({ id: 'c', options: OPTIONS });

        cb.select({ label: 'Banana', value: 'banana' });
        expect(get(cb.value)).toBe('banana');
        expect(get(cb.inputValue)).toBe('Banana');
        expect(get(cb.open)).toBe(false);

        cb.clear();
        expect(get(cb.value)).toBe(null);
        expect(get(cb.inputValue)).toBe('');
    });

    it('getOptionProps is a store of a function returning role=option props', () => {
        const cb = useCombobox({ id: 'c', options: OPTIONS });
        const optionProps = get(cb.getOptionProps)(OPTIONS[0]!, 0);

        expect(optionProps.role).toBe('option');
        expect(typeof optionProps.id).toBe('string');
    });

    it('reacts to an options store — a new list re-filters the visible items', () => {
        const opts = writable({ id: 'rx', options: OPTIONS });
        const cb = useCombobox(opts);
        expect(get(cb.items)).toHaveLength(4);

        opts.set({ id: 'rx', options: [{ label: 'Kiwi', value: 'kiwi' }] });
        expect(get(cb.items).map((i) => i.label)).toEqual(['Kiwi']);
    });

    it('reacts to a disabled store — toggling disabled pushes SET_DISABLED and closes the listbox', () => {
        const opts = writable({ id: 'rd', options: OPTIONS, disabled: false });
        const cb = useCombobox(opts);

        cb.setOpen(true);
        expect(get(cb.open)).toBe(true);

        opts.set({ id: 'rd', options: OPTIONS, disabled: true });
        expect(get(cb.open)).toBe(false);
    });
});

describe('Svelte useMenu', () => {
    const ITEMS = [
        { label: 'Copy', value: 'copy' },
        { label: 'Paste', value: 'paste' }
    ];

    it('starts closed with the WAI-ARIA menu-button wiring', () => {
        const m = useMenu({ id: 'm', items: ITEMS });

        expect(get(m.open)).toBe(false);
        expect(get(m.highlightedValue)).toBe(null);
        expect(get(m.items)).toHaveLength(2);

        const trigger = get(m.triggerProps);
        expect(trigger['aria-haspopup']).toBe('menu');
        expect(trigger['aria-expanded']).toBe(false);
        expect(get(m.contentProps).role).toBe('menu');
    });

    it('setOpen and highlightFirst drive the reactive stores', () => {
        const m = useMenu({ id: 'm', items: ITEMS });

        m.setOpen(true);
        expect(get(m.open)).toBe(true);
        expect(get(m.triggerProps)['aria-expanded']).toBe(true);

        m.highlightFirst();
        expect(get(m.highlightedValue)).toBe('copy');
    });

    it('getItemProps is a store of a function returning role=menuitem props with a lowercased handler', () => {
        const m = useMenu({ id: 'm', items: ITEMS });
        const itemProps = get(m.getItemProps)(ITEMS[0]!, 0);

        expect(itemProps.role).toBe('menuitem');
        expect(typeof itemProps.onclick).toBe('function');
        expect('onClick' in itemProps).toBe(false);
    });

    it('reacts to an items store — a new list is reflected', () => {
        const opts = writable({ id: 'rm', items: ITEMS });
        const m = useMenu(opts);
        expect(get(m.items)).toHaveLength(2);

        opts.set({ id: 'rm', items: [{ label: 'Cut', value: 'cut' }] });
        expect(get(m.items).map((i) => i.label)).toEqual(['Cut']);
    });
});

describe('Svelte resolvers fall back to native outside a component', () => {
    it('useDisclosure / useDialog resolve the native adapter when no context is provided', () => {
        // Called outside Svelte component init, getContext would throw — getHeadless swallows that and
        // returns null, so the native default is used.
        const d = useDisclosure({ id: 'r' });
        expect(get(d.open)).toBe(false);
        expect(get(d.triggerProps).id).toBe('ori-r-trigger');

        const dlg = useDialog({ id: 'rd' });
        expect(get(dlg.open)).toBe(false);
        expect(get(dlg.dialogProps).role).toBe('dialog');
    });
});
