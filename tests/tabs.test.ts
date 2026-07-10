import { describe, it, expect } from 'vitest';
import { h } from 'vue';
import { mount } from '@vue/test-utils';
import { OriTabs } from '../packages/vue/src';
import { expectNoA11yViolations } from './helpers/axe';

const TABS = [
    { value: 'account', label: 'Account' },
    { value: 'billing', label: 'Billing' },
    { value: 'security', label: 'Security' }
];

const TABS_WITH_DISABLED = [
    { value: 'account', label: 'Account' },
    { value: 'billing', label: 'Billing', disabled: true },
    { value: 'security', label: 'Security' }
];

describe('OriTabs', () => {
    it('renders the root block and tablist with default classes', () => {
        const wrapper = mount(OriTabs, { props: { tabs: TABS } });

        expect(wrapper.classes()).toContain('ori-tabs');
        expect(wrapper.classes()).toContain('ori-color_primary');
        expect(wrapper.classes()).not.toContain('ori-tabs_vertical');

        const list = wrapper.find('.ori-tabs__list');
        expect(list.exists()).toBe(true);
        expect(list.attributes('role')).toBe('tablist');
    });

    it('renders one button[role=tab] per tab entry', () => {
        const wrapper = mount(OriTabs, { props: { tabs: TABS } });
        const tabs = wrapper.findAll('.ori-tabs__tab');

        expect(tabs).toHaveLength(3);
        tabs.forEach((tab) => {
            expect(tab.element.tagName).toBe('BUTTON');
            expect(tab.attributes('role')).toBe('tab');
        });
    });

    it('renders one role=tabpanel per tab entry', () => {
        const wrapper = mount(OriTabs, { props: { tabs: TABS } });
        const panels = wrapper.findAll('.ori-tabs__panel');

        expect(panels).toHaveLength(3);
        panels.forEach((panel) => {
            expect(panel.attributes('role')).toBe('tabpanel');
            expect(panel.attributes('tabindex')).toBe('0');
        });
    });

    it('auto-defaults modelValue to the first non-disabled tab and emits update:modelValue', async () => {
        const wrapper = mount(OriTabs, { props: { tabs: TABS } });
        await wrapper.vm.$nextTick();

        expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['account']);
    });

    it('reflects v-model — selected tab has aria-selected=true, others false', async () => {
        const wrapper = mount(OriTabs, { props: { tabs: TABS, modelValue: 'billing' } });
        await wrapper.vm.$nextTick();

        const tabButtons = wrapper.findAll('.ori-tabs__tab');
        expect(tabButtons[0].attributes('aria-selected')).toBe('false');
        expect(tabButtons[1].attributes('aria-selected')).toBe('true');
        expect(tabButtons[2].attributes('aria-selected')).toBe('false');
    });

    it('roving tabindex: selected tab is 0, others are -1', async () => {
        const wrapper = mount(OriTabs, { props: { tabs: TABS, modelValue: 'security' } });
        await wrapper.vm.$nextTick();

        const tabButtons = wrapper.findAll('.ori-tabs__tab');
        expect(tabButtons[0].attributes('tabindex')).toBe('-1');
        expect(tabButtons[1].attributes('tabindex')).toBe('-1');
        expect(tabButtons[2].attributes('tabindex')).toBe('0');
    });

    it('clicking a tab emits update:modelValue with that tab value', async () => {
        const wrapper = mount(OriTabs, { props: { tabs: TABS, modelValue: 'account' } });
        await wrapper.vm.$nextTick();

        await wrapper.findAll('.ori-tabs__tab')[1].trigger('click');

        const emitted = wrapper.emitted('update:modelValue');
        const lastValue = emitted?.[emitted.length - 1];
        expect(lastValue).toEqual(['billing']);
    });

    it('tab id ties to panel aria-labelledby', () => {
        const wrapper = mount(OriTabs, { props: { tabs: TABS } });
        const tabButtons = wrapper.findAll('.ori-tabs__tab');
        const panels = wrapper.findAll('.ori-tabs__panel');

        tabButtons.forEach((tab, i) => {
            const tabId = tab.attributes('id');
            expect(tabId).toBeTruthy();
            expect(panels[i].attributes('aria-labelledby')).toBe(tabId);
        });
    });

    it('tab aria-controls ties to panel id', () => {
        const wrapper = mount(OriTabs, { props: { tabs: TABS } });
        const tabButtons = wrapper.findAll('.ori-tabs__tab');
        const panels = wrapper.findAll('.ori-tabs__panel');

        tabButtons.forEach((tab, i) => {
            const panelId = panels[i].attributes('id');
            expect(panelId).toBeTruthy();
            expect(tab.attributes('aria-controls')).toBe(panelId);
        });
    });

    it('disabled tab has real disabled attribute and is not selectable via click', async () => {
        const wrapper = mount(OriTabs, { props: { tabs: TABS_WITH_DISABLED, modelValue: 'account' } });
        await wrapper.vm.$nextTick();

        const disabledTab = wrapper.findAll('.ori-tabs__tab')[1];
        expect((disabledTab.element as HTMLButtonElement).disabled).toBe(true);

        await disabledTab.trigger('click');

        const emitted = wrapper.emitted('update:modelValue');
        // Only the initial auto-default emit should exist; billing click must not emit
        const emittedValues = (emitted ?? []).map((e) => e[0]);
        expect(emittedValues).not.toContain('billing');
    });

    it('auto-default skips disabled tabs — picks first enabled tab', async () => {
        const tabs = [
            { value: 'first', label: 'First', disabled: true },
            { value: 'second', label: 'Second' }
        ];
        const wrapper = mount(OriTabs, { props: { tabs } });
        await wrapper.vm.$nextTick();

        expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['second']);
    });

    it('self-heals: if modelValue points at a disabled tab it emits the first enabled tab', async () => {
        const wrapper = mount(OriTabs, { props: { tabs: TABS_WITH_DISABLED, modelValue: 'billing' } });
        await wrapper.vm.$nextTick();

        const emitted = wrapper.emitted('update:modelValue');
        const emittedValues = (emitted ?? []).map((e) => e[0]);
        // Should have emitted a correction to the first enabled tab
        expect(emittedValues).toContain('account');
    });

    it('horizontal orientation sets aria-orientation=horizontal on tablist (default)', () => {
        const wrapper = mount(OriTabs, { props: { tabs: TABS } });
        const list = wrapper.find('.ori-tabs__list');

        expect(list.attributes('aria-orientation')).toBe('horizontal');
        expect(wrapper.classes()).not.toContain('ori-tabs_vertical');
    });

    it('vertical orientation sets aria-orientation=vertical on tablist and adds modifier class', () => {
        const wrapper = mount(OriTabs, { props: { tabs: TABS, orientation: 'vertical' } });
        const list = wrapper.find('.ori-tabs__list');

        expect(list.attributes('aria-orientation')).toBe('vertical');
        expect(wrapper.classes()).toContain('ori-tabs_vertical');
    });

    it('maps color prop to ori-color_<color> class', () => {
        const wrapper = mount(OriTabs, { props: { tabs: TABS, color: 'success' } });

        expect(wrapper.classes()).toContain('ori-color_success');
        expect(wrapper.classes()).not.toContain('ori-color_primary');
    });

    it('ArrowRight on horizontal tablist moves selection to the next non-disabled tab', async () => {
        const wrapper = mount(OriTabs, { props: { tabs: TABS, modelValue: 'account' } });
        await wrapper.vm.$nextTick();

        await wrapper.findAll('.ori-tabs__tab')[0].trigger('keydown', { key: 'ArrowRight' });

        const emitted = wrapper.emitted('update:modelValue');
        const lastValue = emitted?.[emitted.length - 1];
        expect(lastValue).toEqual(['billing']);
    });

    it('ArrowLeft on horizontal tablist moves selection to the previous non-disabled tab', async () => {
        const wrapper = mount(OriTabs, { props: { tabs: TABS, modelValue: 'billing' } });
        await wrapper.vm.$nextTick();

        await wrapper.findAll('.ori-tabs__tab')[1].trigger('keydown', { key: 'ArrowLeft' });

        const emitted = wrapper.emitted('update:modelValue');
        const lastValue = emitted?.[emitted.length - 1];
        expect(lastValue).toEqual(['account']);
    });

    it('ArrowRight wraps from last tab to first', async () => {
        const wrapper = mount(OriTabs, { props: { tabs: TABS, modelValue: 'security' } });
        await wrapper.vm.$nextTick();

        await wrapper.findAll('.ori-tabs__tab')[2].trigger('keydown', { key: 'ArrowRight' });

        const emitted = wrapper.emitted('update:modelValue');
        const lastValue = emitted?.[emitted.length - 1];
        expect(lastValue).toEqual(['account']);
    });

    it('ArrowLeft wraps from first tab to last', async () => {
        const wrapper = mount(OriTabs, { props: { tabs: TABS, modelValue: 'account' } });
        await wrapper.vm.$nextTick();

        await wrapper.findAll('.ori-tabs__tab')[0].trigger('keydown', { key: 'ArrowLeft' });

        const emitted = wrapper.emitted('update:modelValue');
        const lastValue = emitted?.[emitted.length - 1];
        expect(lastValue).toEqual(['security']);
    });

    it('ArrowRight skips disabled tabs during keyboard navigation', async () => {
        const wrapper = mount(OriTabs, { props: { tabs: TABS_WITH_DISABLED, modelValue: 'account' } });
        await wrapper.vm.$nextTick();

        await wrapper.findAll('.ori-tabs__tab')[0].trigger('keydown', { key: 'ArrowRight' });

        const emitted = wrapper.emitted('update:modelValue');
        const lastValue = emitted?.[emitted.length - 1];
        // billing is disabled, should jump to security
        expect(lastValue).toEqual(['security']);
    });

    it('ArrowDown on vertical tablist moves selection forward', async () => {
        const wrapper = mount(OriTabs, {
            props: { tabs: TABS, orientation: 'vertical', modelValue: 'account' }
        });
        await wrapper.vm.$nextTick();

        await wrapper.findAll('.ori-tabs__tab')[0].trigger('keydown', { key: 'ArrowDown' });

        const emitted = wrapper.emitted('update:modelValue');
        const lastValue = emitted?.[emitted.length - 1];
        expect(lastValue).toEqual(['billing']);
    });

    it('ArrowUp on vertical tablist moves selection backward', async () => {
        const wrapper = mount(OriTabs, {
            props: { tabs: TABS, orientation: 'vertical', modelValue: 'billing' }
        });
        await wrapper.vm.$nextTick();

        await wrapper.findAll('.ori-tabs__tab')[1].trigger('keydown', { key: 'ArrowUp' });

        const emitted = wrapper.emitted('update:modelValue');
        const lastValue = emitted?.[emitted.length - 1];
        expect(lastValue).toEqual(['account']);
    });

    it('Home key jumps to the first non-disabled tab', async () => {
        const wrapper = mount(OriTabs, { props: { tabs: TABS, modelValue: 'security' } });
        await wrapper.vm.$nextTick();

        await wrapper.findAll('.ori-tabs__tab')[2].trigger('keydown', { key: 'Home' });

        const emitted = wrapper.emitted('update:modelValue');
        const lastValue = emitted?.[emitted.length - 1];
        expect(lastValue).toEqual(['account']);
    });

    it('End key jumps to the last non-disabled tab', async () => {
        const wrapper = mount(OriTabs, { props: { tabs: TABS, modelValue: 'account' } });
        await wrapper.vm.$nextTick();

        await wrapper.findAll('.ori-tabs__tab')[0].trigger('keydown', { key: 'End' });

        const emitted = wrapper.emitted('update:modelValue');
        const lastValue = emitted?.[emitted.length - 1];
        expect(lastValue).toEqual(['security']);
    });

    it('Home skips disabled tabs at the front', async () => {
        const tabs = [
            { value: 'first', label: 'First', disabled: true },
            { value: 'second', label: 'Second' },
            { value: 'third', label: 'Third' }
        ];
        const wrapper = mount(OriTabs, { props: { tabs, modelValue: 'third' } });
        await wrapper.vm.$nextTick();

        await wrapper.findAll('.ori-tabs__tab')[2].trigger('keydown', { key: 'Home' });

        const emitted = wrapper.emitted('update:modelValue');
        const lastValue = emitted?.[emitted.length - 1];
        expect(lastValue).toEqual(['second']);
    });

    it('End skips disabled tabs at the back', async () => {
        const tabs = [
            { value: 'first', label: 'First' },
            { value: 'second', label: 'Second' },
            { value: 'third', label: 'Third', disabled: true }
        ];
        const wrapper = mount(OriTabs, { props: { tabs, modelValue: 'first' } });
        await wrapper.vm.$nextTick();

        await wrapper.findAll('.ori-tabs__tab')[0].trigger('keydown', { key: 'End' });

        const emitted = wrapper.emitted('update:modelValue');
        const lastValue = emitted?.[emitted.length - 1];
        expect(lastValue).toEqual(['second']);
    });

    it('renders named slot content for the matching tab value', async () => {
        const wrapper = mount(OriTabs, {
            props: { tabs: TABS, modelValue: 'account' },
            slots: {
                account: '<p class="panel-account">Account panel</p>',
                billing: '<p class="panel-billing">Billing panel</p>'
            }
        });
        await wrapper.vm.$nextTick();

        expect(wrapper.find('.panel-account').exists()).toBe(true);
        expect(wrapper.find('.panel-account').text()).toBe('Account panel');
    });

    it('renders default scoped slot as fallback when no named slot matches', async () => {
        const wrapper = mount(OriTabs, {
            props: { tabs: TABS, modelValue: 'account' },
            slots: {
                default: '<span class="fallback">fallback content</span>'
            }
        });
        await wrapper.vm.$nextTick();

        expect(wrapper.find('.fallback').exists()).toBe(true);
    });

    it('renders custom trigger content via the #tab scoped slot and receives the tab object', () => {
        const wrapper = mount(OriTabs, {
            props: { tabs: TABS, modelValue: 'account' },
            slots: {
                tab: ({ tab }) => h('span', { class: 'custom-tab', 'data-value': String(tab.value) }, `★ ${tab.label}`)
            }
        });

        const tabButtons = wrapper.findAll('.ori-tabs__tab');
        // The scoped slot replaces the default label rendering for every trigger...
        expect(tabButtons[0].find('.custom-tab').exists()).toBe(true);
        expect(tabButtons[0].text()).toBe('★ Account');
        expect(tabButtons[1].text()).toBe('★ Billing');
        // ...and the slot receives the corresponding tab object.
        expect(tabButtons[0].find('.custom-tab').attributes('data-value')).toBe('account');
        expect(tabButtons[2].find('.custom-tab').attributes('data-value')).toBe('security');
    });

    it('falls back to the tab label when no #tab slot is provided', () => {
        const wrapper = mount(OriTabs, { props: { tabs: TABS, modelValue: 'account' } });

        const tabButtons = wrapper.findAll('.ori-tabs__tab');
        expect(tabButtons[0].text()).toBe('Account');
        expect(tabButtons[1].text()).toBe('Billing');
        expect(tabButtons[2].text()).toBe('Security');
    });

    it('only the active panel is shown — inactive panels carry the hidden attribute', async () => {
        const wrapper = mount(OriTabs, { props: { tabs: TABS, modelValue: 'billing' } });
        await wrapper.vm.$nextTick();

        const panels = wrapper.findAll('.ori-tabs__panel');
        // panel[1] (billing) is shown; the rest are hidden via the `hidden` attribute (APG-correct,
        // robust against display overrides — not just CSS display:none).
        expect(panels[0].attributes('hidden')).toBeDefined();
        expect(panels[1].attributes('hidden')).toBeUndefined();
        expect(panels[2].attributes('hidden')).toBeDefined();
    });

    it('roving focus: ArrowRight moves DOM focus to the newly-selected tab', async () => {
        const wrapper = mount(OriTabs, {
            props: { tabs: TABS, modelValue: 'account' },
            attachTo: document.body
        });
        await wrapper.vm.$nextTick();

        const tabButtons = wrapper.findAll('.ori-tabs__tab');
        (tabButtons[0].element as HTMLButtonElement).focus();
        await tabButtons[0].trigger('keydown', { key: 'ArrowRight' });

        // automatic activation moves focus along with selection
        expect(document.activeElement).toBe(tabButtons[1].element);
        wrapper.unmount();
    });

    it('numeric tab values work: aria-selected, panel visibility, and emit', async () => {
        const numericTabs = [
            { value: 1, label: 'One' },
            { value: 2, label: 'Two' },
            { value: 3, label: 'Three' }
        ];
        const wrapper = mount(OriTabs, { props: { tabs: numericTabs, modelValue: 1 } });
        await wrapper.vm.$nextTick();

        const tabButtons = wrapper.findAll('.ori-tabs__tab');
        expect(tabButtons[0].attributes('aria-selected')).toBe('true');
        expect(tabButtons[1].attributes('aria-selected')).toBe('false');

        await tabButtons[1].trigger('click');
        const emitted = wrapper.emitted('update:modelValue');
        const lastValue = emitted?.[emitted.length - 1];
        expect(lastValue).toEqual([2]);
    });

    it('has no axe violations (horizontal, 3 tabs, one selected)', async () => {
        const wrapper = mount(OriTabs, {
            props: { tabs: TABS, modelValue: 'account' },
            attachTo: document.body
        });
        await wrapper.vm.$nextTick();
        await expectNoA11yViolations(wrapper.element);
        wrapper.unmount();
    });

    it('has no axe violations (vertical orientation)', async () => {
        const wrapper = mount(OriTabs, {
            props: { tabs: TABS, modelValue: 'billing', orientation: 'vertical' },
            attachTo: document.body
        });
        await wrapper.vm.$nextTick();
        await expectNoA11yViolations(wrapper.element);
        wrapper.unmount();
    });
});
