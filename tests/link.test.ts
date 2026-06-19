import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import OriLink from '../src/components/link/ori-link.vue';
import { expectNoA11yViolations } from './helpers/axe';

describe('OriLink', () => {
    // ------------------------------------------------------------------ block class
    it('has the ori-link block class by default', () => {
        const wrapper = mount(OriLink, { slots: { default: 'Click me' } });

        expect(wrapper.classes()).toContain('ori-link');
    });

    // ------------------------------------------------------------------ default element
    it('renders as <a> by default', () => {
        const wrapper = mount(OriLink, { slots: { default: 'Link text' } });

        expect(wrapper.element.tagName).toBe('A');
    });

    // ------------------------------------------------------------------ slot
    it('renders default slot content', () => {
        const wrapper = mount(OriLink, { slots: { default: 'Read more' } });

        expect(wrapper.text()).toBe('Read more');
    });

    // ------------------------------------------------------------------ href
    it('forwards href to the anchor element', () => {
        const wrapper = mount(OriLink, { props: { href: 'https://example.com' }, slots: { default: 'Go' } });

        expect(wrapper.attributes('href')).toBe('https://example.com');
    });

    it('renders no href attribute when prop is absent', () => {
        const wrapper = mount(OriLink, { slots: { default: 'Go' } });

        expect(wrapper.attributes('href')).toBeUndefined();
    });

    // ------------------------------------------------------------------ color
    it('adds ori-color_<color> class when color prop is set', () => {
        const wrapper = mount(OriLink, { props: { color: 'primary' }, slots: { default: 'Go' } });

        expect(wrapper.classes()).toContain('ori-color_primary');
    });

    it('adds no color class when color prop is absent', () => {
        const wrapper = mount(OriLink, { slots: { default: 'Go' } });
        const classes = wrapper.classes();

        expect(classes.some((c) => c.startsWith('ori-color_'))).toBe(false);
    });

    it('maps every supported ThemeColor to its class', () => {
        const colors = ['primary', 'secondary', 'success', 'warn', 'danger', 'info'] as const;

        for (const color of colors) {
            const wrapper = mount(OriLink, { props: { color }, slots: { default: 'x' } });
            expect(wrapper.classes()).toContain(`ori-color_${color}`);
        }
    });

    // ------------------------------------------------------------------ hover modifier
    it('adds ori-link_hover class when hover prop is true', () => {
        const wrapper = mount(OriLink, { props: { hover: true }, slots: { default: 'Go' } });

        expect(wrapper.classes()).toContain('ori-link_hover');
    });

    it('does not add ori-link_hover class by default', () => {
        const wrapper = mount(OriLink, { slots: { default: 'Go' } });

        expect(wrapper.classes()).not.toContain('ori-link_hover');
    });

    // ------------------------------------------------------------------ external
    it('sets target=_blank and rel=noopener noreferrer when external is true', () => {
        const wrapper = mount(OriLink, {
            props: { href: 'https://example.com', external: true },
            slots: { default: 'External' }
        });

        expect(wrapper.attributes('target')).toBe('_blank');
        expect(wrapper.attributes('rel')).toBe('noopener noreferrer');
    });

    it('does not set target or rel when external is absent', () => {
        const wrapper = mount(OriLink, { props: { href: 'https://example.com' }, slots: { default: 'Local' } });

        expect(wrapper.attributes('target')).toBeUndefined();
        expect(wrapper.attributes('rel')).toBeUndefined();
    });

    // ------------------------------------------------------------------ polymorphic `as`
    it('renders as a <span> when as="span"', () => {
        const wrapper = mount(OriLink, { props: { as: 'span' }, slots: { default: 'Text' } });

        expect(wrapper.element.tagName).toBe('SPAN');
        expect(wrapper.classes()).toContain('ori-link');
    });

    it('renders as a <button> when as="button"', () => {
        const wrapper = mount(OriLink, { props: { as: 'button' }, slots: { default: 'Press' } });

        expect(wrapper.element.tagName).toBe('BUTTON');
    });

    // ------------------------------------------------------------------ combined props
    it('combines hover + color classes correctly', () => {
        const wrapper = mount(OriLink, {
            props: { hover: true, color: 'danger' },
            slots: { default: 'Danger' }
        });
        const classes = wrapper.classes();

        expect(classes).toContain('ori-link');
        expect(classes).toContain('ori-link_hover');
        expect(classes).toContain('ori-color_danger');
    });

    // ------------------------------------------------------------------ axe
    it('has no axe violations', async () => {
        const wrapper = mount(OriLink, {
            props: { href: 'https://example.com' },
            slots: { default: 'Visit example' },
            attachTo: document.body
        });

        await expectNoA11yViolations(wrapper.element);
        wrapper.unmount();
    });
});
