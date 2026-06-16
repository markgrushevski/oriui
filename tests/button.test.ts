import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import { OriButton } from '../src';
import { expectNoA11yViolations } from './helpers/axe';

describe('OriButton', () => {
    it('renders a real <button type="button"> with the default token classes', () => {
        const wrapper = mount(OriButton, { props: { text: 'Save' } });
        const el = wrapper.element as HTMLButtonElement;

        expect(el.tagName).toBe('BUTTON');
        expect(el.getAttribute('type')).toBe('button');
        for (const cls of [
            'ori-button',
            'ori-size-action_md',
            'ori-size-radius_rounded',
            'ori-font-size_md',
            'ori-variant_fill',
            'ori-color_primary'
        ]) {
            expect(wrapper.classes()).toContain(cls);
        }
        expect(wrapper.find('.ori-button__text').text()).toBe('Save');
    });

    it('maps variant / size / color / radius props to classes', () => {
        const wrapper = mount(OriButton, {
            props: { text: 'x', variant: 'tonal', size: 'lg', color: 'danger', radius: 'sm' }
        });
        const c = wrapper.classes();

        expect(c).toContain('ori-variant_tonal');
        expect(c).toContain('ori-size-action_lg');
        expect(c).toContain('ori-font-size_lg');
        expect(c).toContain('ori-color_danger');
        expect(c).toContain('ori-size-radius_sm');
    });

    // The headline a11y fix of the rebrand: `disabled` is the real DOM attribute. The old
    // V-button only added a pointer-events:none class, leaving the control focusable.
    it('disabled sets the real disabled attribute + aria-disabled', () => {
        const el = mount(OriButton, { props: { text: 'x', disabled: true } }).element as HTMLButtonElement;

        expect(el.disabled).toBe(true);
        expect(el.getAttribute('aria-disabled')).toBe('true');
    });

    it('loading gates the button, sets aria-busy, swaps icon -> spinner', () => {
        const wrapper = mount(OriButton, { props: { text: 'x', loading: true, icon: 'M0 0' } });
        const el = wrapper.element as HTMLButtonElement;

        expect(el.disabled).toBe(true);
        expect(el.getAttribute('aria-busy')).toBe('true');
        expect(wrapper.find('.ori-spinner').exists()).toBe(true);
        expect(wrapper.find('.ori-icon').exists()).toBe(false);
    });

    it('active reflects as the data-active attribute', () => {
        const el = mount(OriButton, { props: { text: 'x', active: true } }).element;

        expect(el.getAttribute('data-active')).toBe('');
    });

    it('as="a" drops the button-only attrs and guards focus when disabled', () => {
        const el = mount(OriButton, { props: { text: 'x', as: 'a', disabled: true } }).element;

        expect(el.tagName).toBe('A');
        expect(el.getAttribute('type')).toBeNull();
        expect(el.hasAttribute('disabled')).toBe(false);
        expect(el.getAttribute('aria-disabled')).toBe('true');
        expect(el.getAttribute('tabindex')).toBe('-1');
    });

    it('icon-only (no text) takes the icon modifier class', () => {
        const wrapper = mount(OriButton, { props: { icon: 'M0 0' }, attrs: { 'aria-label': 'Menu' } });

        expect(wrapper.classes()).toContain('ori-button_icon');
    });

    it('has no axe violations when labeled', async () => {
        const wrapper = mount(OriButton, { props: { text: 'Save' }, attachTo: document.body });
        await expectNoA11yViolations(wrapper.element);
        wrapper.unmount();
    });
});
