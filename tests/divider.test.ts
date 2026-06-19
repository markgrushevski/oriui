import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import { OriDivider } from '../src';
import { expectNoA11yViolations } from './helpers/axe';

describe('OriDivider', () => {
    it('renders a single div with role="separator" and the base class', () => {
        const wrapper = mount(OriDivider);

        expect(wrapper.element.tagName).toBe('DIV');
        expect(wrapper.attributes('role')).toBe('separator');
        expect(wrapper.classes()).toContain('ori-divider');
    });

    it('horizontal (default) does NOT set aria-orientation', () => {
        const wrapper = mount(OriDivider);

        expect(wrapper.attributes('aria-orientation')).toBeUndefined();
    });

    it('vertical sets aria-orientation="vertical" and the modifier class', () => {
        const wrapper = mount(OriDivider, { props: { vertical: true } });

        expect(wrapper.attributes('aria-orientation')).toBe('vertical');
        expect(wrapper.classes()).toContain('ori-divider_vertical');
    });

    it('horizontal does NOT add the vertical modifier class', () => {
        const wrapper = mount(OriDivider);

        expect(wrapper.classes()).not.toContain('ori-divider_vertical');
    });

    it('text prop adds the _text modifier and renders a label span', () => {
        const wrapper = mount(OriDivider, { props: { text: 'OR' } });

        expect(wrapper.classes()).toContain('ori-divider_text');
        const label = wrapper.find('.ori-divider__label');
        expect(label.exists()).toBe(true);
        expect(label.text()).toBe('OR');
    });

    it('no text and no slot: no _text modifier, no label span', () => {
        const wrapper = mount(OriDivider);

        expect(wrapper.classes()).not.toContain('ori-divider_text');
        expect(wrapper.find('.ori-divider__label').exists()).toBe(false);
    });

    it('default slot renders in the label span and overrides the text prop fallback', () => {
        const wrapper = mount(OriDivider, {
            props: { text: 'fallback' },
            slots: { default: 'slot content' }
        });

        const label = wrapper.find('.ori-divider__label');
        expect(label.exists()).toBe(true);
        expect(label.text()).toBe('slot content');
        expect(wrapper.classes()).toContain('ori-divider_text');
    });

    it('default slot without text prop still shows the label', () => {
        const wrapper = mount(OriDivider, {
            slots: { default: 'Section break' }
        });

        expect(wrapper.classes()).toContain('ori-divider_text');
        expect(wrapper.find('.ori-divider__label').text()).toBe('Section break');
    });

    it('color prop adds the single-class color utility', () => {
        const wrapper = mount(OriDivider, { props: { color: 'primary' } });

        expect(wrapper.classes()).toContain('ori-color_primary');
    });

    it('color="danger" adds ori-color_danger', () => {
        const wrapper = mount(OriDivider, { props: { color: 'danger' } });

        expect(wrapper.classes()).toContain('ori-color_danger');
    });

    it('no color prop: no ori-color_* class is added', () => {
        const wrapper = mount(OriDivider);

        expect(wrapper.classes().some((c) => c.startsWith('ori-color_'))).toBe(false);
    });

    it('has no axe violations without a label (horizontal)', async () => {
        const wrapper = mount(OriDivider, { attachTo: document.body });
        await expectNoA11yViolations(wrapper.element);
        wrapper.unmount();
    });

    it('has no axe violations with a text label', async () => {
        const wrapper = mount(OriDivider, { props: { text: 'OR' }, attachTo: document.body });
        await expectNoA11yViolations(wrapper.element);
        wrapper.unmount();
    });

    it('has no axe violations when vertical', async () => {
        const wrapper = mount(OriDivider, { props: { vertical: true }, attachTo: document.body });
        await expectNoA11yViolations(wrapper.element);
        wrapper.unmount();
    });
});
