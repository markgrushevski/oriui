import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import { OriSurface } from '../packages/vue/src';
import { expectNoA11yViolations } from './helpers/axe';

describe('OriSurface', () => {
    it('renders a div.ori-surface by default with lg elevation + radius + a border', () => {
        const wrapper = mount(OriSurface);

        expect(wrapper.element.tagName).toBe('DIV');
        expect(wrapper.classes()).toContain('ori-surface');
        expect(wrapper.classes()).toContain('ori-surface_elevation-lg');
        expect(wrapper.classes()).toContain('ori-size-radius_lg');
        expect(wrapper.classes()).toContain('ori-surface_bordered');
    });

    it('maps the elevation prop to the shadow class', () => {
        expect(mount(OriSurface, { props: { elevation: 'sm' } }).classes()).toContain('ori-surface_elevation-sm');
        expect(mount(OriSurface, { props: { elevation: 'md' } }).classes()).toContain('ori-surface_elevation-md');
    });

    it('maps the radius prop to the size-radius utility', () => {
        expect(mount(OriSurface, { props: { radius: 'zero' } }).classes()).toContain('ori-size-radius_zero');
        expect(mount(OriSurface, { props: { radius: 'md' } }).classes()).toContain('ori-size-radius_md');
    });

    it('drops the border class when bordered is false', () => {
        const wrapper = mount(OriSurface, { props: { bordered: false } });

        expect(wrapper.classes()).not.toContain('ori-surface_bordered');
        expect(wrapper.classes()).toContain('ori-surface');
    });

    it('renders as a custom element via `as`', () => {
        const wrapper = mount(OriSurface, { props: { as: 'section' } });

        expect(wrapper.element.tagName).toBe('SECTION');
        expect(wrapper.classes()).toContain('ori-surface');
    });

    it('projects default slot content', () => {
        const wrapper = mount(OriSurface, { slots: { default: () => 'Panel body' } });

        expect(wrapper.text()).toContain('Panel body');
    });

    it('has no axe violations (as a labelled region)', async () => {
        const wrapper = mount(OriSurface, {
            attrs: { role: 'region', 'aria-label': 'Tools' },
            slots: { default: () => 'content' },
            attachTo: document.body
        });
        await expectNoA11yViolations(wrapper.element);
        wrapper.unmount();
    });
});
