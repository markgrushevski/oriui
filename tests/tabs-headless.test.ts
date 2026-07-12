import { afterEach, describe, it, expect, vi } from 'vitest';
import { ref } from 'vue';
import { get, writable, derived } from 'svelte/store';
import { useTabs as useTabsVue, type TabItem } from '@oriui/headless/vue';
import { useTabs as useTabsSvelte } from '@oriui/headless/svelte';

// The headless `useTabs` is pure TS over the shared `../core/roving` math. The Vue binding returns
// computeds; the Svelte binding returns stores — both are exercised WITHOUT rendering a component
// (`.value` / `get(store)` read state, an external ref/writable drives reactivity). The styled OriTabs
// keeps its own component-level suite (tests/tabs.test.ts); this proves the composable contract + the
// two adapters (Vue reactivity, Svelte stores + lowercased events) directly.

const TABS: TabItem[] = [{ value: 'a' }, { value: 'b' }, { value: 'c', disabled: true }, { value: 'd' }];

afterEach(() => {
    document.body.innerHTML = '';
});

describe('useTabs (Vue)', () => {
    it('defaults the selection to the first enabled tab', () => {
        expect(useTabsVue(() => ({ tabs: TABS, value: undefined })).selectedValue.value).toBe('a');
    });

    it('honors a valid bound value but recovers from a missing / disabled one', () => {
        expect(useTabsVue(() => ({ tabs: TABS, value: 'b' })).selectedValue.value).toBe('b');
        expect(useTabsVue(() => ({ tabs: TABS, value: 'zzz' })).selectedValue.value).toBe('a'); // missing
        expect(useTabsVue(() => ({ tabs: TABS, value: 'c' })).selectedValue.value).toBe('a'); // disabled
    });

    it('tracks a reactive bound value', () => {
        const value = ref<string | undefined>(undefined);
        const { selectedValue } = useTabsVue(() => ({ tabs: TABS, value: value.value }));
        expect(selectedValue.value).toBe('a');
        value.value = 'd';
        expect(selectedValue.value).toBe('d');
    });

    it('select() commits an enabled tab and ignores a disabled one', () => {
        const onChange = vi.fn();
        const { select } = useTabsVue(() => ({ tabs: TABS, value: 'a', onChange }));
        select(TABS[1]);
        expect(onChange).toHaveBeenCalledWith('b');
        select(TABS[2]); // disabled
        expect(onChange).toHaveBeenCalledTimes(1);
    });

    it('getTabProps returns the ARIA + roving bag (active tab is the only tab stop)', () => {
        const { getTabProps } = useTabsVue(() => ({ tabs: TABS, value: 'b', idBase: 'x' }));
        expect(getTabProps(TABS[0], 0)).toMatchObject({
            id: 'x-tab-0',
            type: 'button',
            role: 'tab',
            'aria-selected': 'false',
            'aria-controls': 'x-panel-0',
            tabindex: -1
        });
        expect(getTabProps(TABS[1], 1)['aria-selected']).toBe('true');
        expect(getTabProps(TABS[1], 1).tabindex).toBe(0);
        expect(getTabProps(TABS[2], 2).disabled).toBe(true);
    });

    it('getPanelProps hides every panel but the selected one', () => {
        const { getPanelProps } = useTabsVue(() => ({ tabs: TABS, value: 'b', idBase: 'x' }));
        expect(getPanelProps(TABS[1], 1)).toMatchObject({
            id: 'x-panel-1',
            role: 'tabpanel',
            'aria-labelledby': 'x-tab-1',
            hidden: false,
            tabindex: 0
        });
        expect(getPanelProps(TABS[0], 0).hidden).toBe(true);
    });

    it('tablistProps carries role + orientation', () => {
        expect(useTabsVue(() => ({ tabs: TABS, value: 'a' })).tablistProps.value).toMatchObject({
            role: 'tablist',
            'aria-orientation': 'horizontal'
        });
        expect(
            useTabsVue(() => ({ tabs: TABS, value: 'a', orientation: 'vertical' })).tablistProps.value[
                'aria-orientation'
            ]
        ).toBe('vertical');
    });

    it('tablistProps carries an accessible name from label / labelledby', () => {
        expect(useTabsVue(() => ({ tabs: TABS, value: 'a', label: 'Sections' })).tablistProps.value['aria-label']).toBe(
            'Sections'
        );
        expect(
            useTabsVue(() => ({ tabs: TABS, value: 'a', labelledby: 'h1' })).tablistProps.value['aria-labelledby']
        ).toBe('h1');
    });

    it('onKeydown moves selection + real focus, skips the disabled tab, and wraps', () => {
        const onChange = vi.fn();
        const { tablistProps } = useTabsVue(() => ({ tabs: TABS, value: 'a', onChange }));

        const list = document.createElement('div');
        const buttons = TABS.map((t) => {
            const b = document.createElement('button');
            b.setAttribute('role', 'tab');
            if (t.disabled) b.disabled = true;
            list.appendChild(b);
            return b;
        });
        document.body.appendChild(list);
        list.addEventListener('keydown', tablistProps.value.onKeydown as EventListener);

        const arrowFrom = (btn: HTMLButtonElement) => {
            btn.focus();
            btn.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true, cancelable: true }));
        };

        arrowFrom(buttons[0]); // a -> b
        expect(onChange).toHaveBeenLastCalledWith('b');
        expect(document.activeElement).toBe(buttons[1]);

        arrowFrom(buttons[1]); // b -> (skip disabled c) -> d
        expect(onChange).toHaveBeenLastCalledWith('d');
        expect(document.activeElement).toBe(buttons[3]);

        arrowFrom(buttons[3]); // d -> wrap -> a
        expect(onChange).toHaveBeenLastCalledWith('a');
        expect(document.activeElement).toBe(buttons[0]);
    });
});

describe('useTabs (Svelte)', () => {
    it('selectedValue resolves + tracks a reactive value; select commits', () => {
        const value = writable<string | number | undefined>(undefined);
        const opts = derived(value, (v) => ({
            tabs: TABS,
            value: v,
            onChange: (nv: string | number) => value.set(nv)
        }));
        const { selectedValue, select } = useTabsSvelte(opts);

        expect(get(selectedValue)).toBe('a'); // default first-enabled
        value.set('b');
        expect(get(selectedValue)).toBe('b');
        value.set('c'); // disabled -> recovers
        expect(get(selectedValue)).toBe('a');

        select(TABS[3]);
        expect(get(value)).toBe('d');
    });

    it('tablistProps is a store with a LOWERCASED onkeydown; getTabProps is a store of a function', () => {
        const { tablistProps, getTabProps, getPanelProps } = useTabsSvelte({ tabs: TABS, value: 'b', idBase: 'x' });

        const list = get(tablistProps);
        expect(list.role).toBe('tablist');
        expect(list['aria-orientation']).toBe('horizontal');
        expect(typeof list.onkeydown).toBe('function');
        expect('onKeydown' in list).toBe(false);

        const tab = get(getTabProps);
        expect(tab(TABS[1], 1)).toMatchObject({ id: 'x-tab-1', role: 'tab', 'aria-selected': 'true', tabindex: 0 });
        expect(tab(TABS[0], 0)['aria-selected']).toBe('false');
        expect(typeof tab(TABS[0], 0).onclick).toBe('function');

        const panel = get(getPanelProps);
        expect(panel(TABS[1], 1)).toMatchObject({ role: 'tabpanel', 'aria-labelledby': 'x-tab-1', hidden: false });
        expect(panel(TABS[0], 0).hidden).toBe(true);
    });

    it('getTabProps RE-EMITS when idBase changes (a Svelte {#each} only re-renders on emit)', () => {
        const idBase = writable('a');
        const opts = derived(idBase, (b) => ({ tabs: TABS, value: 'a', idBase: b }));
        const { getTabProps } = useTabsSvelte(opts);

        const seen: string[] = [];
        const unsub = getTabProps.subscribe((fn) => seen.push(fn(TABS[0], 0).id as string));
        idBase.set('b');
        unsub();

        // Without deriving on the options store, an idBase change (selection unchanged) would not re-emit,
        // so a Svelte template would keep the stale ids — the store must emit for BOTH bases.
        expect(seen).toContain('a-tab-0');
        expect(seen).toContain('b-tab-0');
    });
});
