import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import { OriKbd } from '../src/components/kbd';
import { expectNoA11yViolations } from './helpers/axe';

describe('OriKbd', () => {
    it('renders a <kbd> element with the ori-kbd block class by default', () => {
        const wrapper = mount(OriKbd, { props: { text: 'Enter' } });

        expect(wrapper.element.tagName.toLowerCase()).toBe('kbd');
        expect(wrapper.classes()).toContain('ori-kbd');
    });

    it('has no extra variant / color / size classes', () => {
        const classes = mount(OriKbd, { props: { text: 'Ctrl' } }).classes();

        // Only the single block class — no color, variant, or size modifiers
        expect(classes).toEqual(['ori-kbd']);
    });

    it('renders the text prop as fallback slot content', () => {
        const wrapper = mount(OriKbd, { props: { text: 'Shift' } });

        expect(wrapper.text()).toBe('Shift');
    });

    it('renders default slot content and ignores the text prop when slot is provided', () => {
        const wrapper = mount(OriKbd, {
            props: { text: 'ignored' },
            slots: { default: 'Ctrl' }
        });

        expect(wrapper.text()).toBe('Ctrl');
    });

    it('renders an empty element when neither text prop nor slot is provided', () => {
        const wrapper = mount(OriKbd);

        expect(wrapper.text()).toBe('');
        expect(wrapper.element.tagName.toLowerCase()).toBe('kbd');
        expect(wrapper.classes()).toContain('ori-kbd');
    });

    it('renders a custom element tag via the `as` prop', () => {
        const wrapper = mount(OriKbd, { props: { as: 'span', text: 'Esc' } });

        expect(wrapper.element.tagName.toLowerCase()).toBe('span');
        expect(wrapper.classes()).toContain('ori-kbd');
        expect(wrapper.text()).toBe('Esc');
    });

    it('renders a <code> element when as="code"', () => {
        const wrapper = mount(OriKbd, { props: { as: 'code', text: 'Tab' } });

        expect(wrapper.element.tagName.toLowerCase()).toBe('code');
        expect(wrapper.classes()).toContain('ori-kbd');
    });

    it('has no axe violations', async () => {
        const wrapper = mount(OriKbd, {
            props: { text: 'Enter' },
            attachTo: document.body
        });
        await expectNoA11yViolations(wrapper.element);
        wrapper.unmount();
    });
});
