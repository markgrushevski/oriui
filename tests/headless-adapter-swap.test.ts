import { describe, it, expect } from 'vitest';
import { computed, defineComponent, h } from 'vue';
import { mount } from '@vue/test-utils';
import {
    OriHeadless,
    useCombobox,
    useMenu,
    nativeCombobox,
    nativeMenu,
    type ComboboxAdapter,
    type MenuAdapter
} from '../packages/headless/src/vue';

// The OriHeadless contract promises Combobox and Menu are swappable — an app can provide a custom /
// Zag-backed engine via the plugin, else the native `../core` adapter is the default. These tests prove
// the seam is real (not just documented): a marker prop from a swapped adapter reaches the consumer,
// and an unwired consumer transparently gets the native default.
const OPTIONS = [{ label: 'Apple', value: 'apple' }];
const ITEMS = [{ label: 'Copy', value: 'copy' }];

describe('OriHeadless contract — Combobox / Menu are swappable', () => {
    it('useCombobox routes through a provided combobox adapter, else falls back to native', () => {
        const fake: ComboboxAdapter = (options) => ({
            ...nativeCombobox(options),
            rootProps: computed(() => ({ 'data-adapter': 'fake-combobox' }))
        });

        const rootPropsWith = (plugins: unknown[]): Record<string, unknown> => {
            let captured: Record<string, unknown> = {};
            const Probe = defineComponent({
                setup() {
                    captured = useCombobox(() => ({ options: OPTIONS })).rootProps.value;
                    return () => h('div');
                }
            });
            mount(Probe, { global: { plugins: plugins as never } });
            return captured;
        };

        expect(rootPropsWith([[OriHeadless, { combobox: fake }]])['data-adapter']).toBe('fake-combobox');
        // no adapter wired → native default produces the real prop bag, never the marker
        expect(rootPropsWith([])['data-adapter']).toBeUndefined();
    });

    it('useMenu routes through a provided menu adapter, else falls back to native', () => {
        const fake: MenuAdapter = (options) => ({
            ...nativeMenu(options),
            triggerProps: computed(() => ({ 'data-adapter': 'fake-menu' }))
        });

        const triggerPropsWith = (plugins: unknown[]): Record<string, unknown> => {
            let captured: Record<string, unknown> = {};
            const Probe = defineComponent({
                setup() {
                    captured = useMenu(() => ({ items: ITEMS })).triggerProps.value;
                    return () => h('div');
                }
            });
            mount(Probe, { global: { plugins: plugins as never } });
            return captured;
        };

        expect(triggerPropsWith([[OriHeadless, { menu: fake }]])['data-adapter']).toBe('fake-menu');
        expect(triggerPropsWith([])['data-adapter']).toBeUndefined();
        expect(triggerPropsWith([])['aria-haspopup']).toBeDefined();
    });
});
