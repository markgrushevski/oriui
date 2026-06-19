import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import { OriIcon } from '../src';
import { expectNoA11yViolations } from './helpers/axe';

describe('OriIcon', () => {
    it('is decorative by default (aria-hidden, no role) and draws the path', () => {
        const wrapper = mount(OriIcon, { props: { icon: 'M0 0h24v24H0z' } });

        expect(wrapper.attributes('aria-hidden')).toBe('true');
        expect(wrapper.attributes('role')).toBeUndefined();
        expect(wrapper.find('svg path').attributes('d')).toBe('M0 0h24v24H0z');
    });

    it('becomes role="img" with an accessible name when labeled', () => {
        const wrapper = mount(OriIcon, { props: { icon: 'M0 0', label: 'Search' } });

        expect(wrapper.attributes('role')).toBe('img');
        expect(wrapper.attributes('aria-label')).toBe('Search');
        expect(wrapper.attributes('aria-hidden')).toBeUndefined();
    });

    it('maps size / color / spaced to classes', () => {
        const c = mount(OriIcon, { props: { icon: 'M0 0', size: 'sm', color: 'info', spaced: true } }).classes();

        expect(c).toContain('ori-icon_sm');
        expect(c).toContain('ori-size-action-space_sm');
        expect(c).toContain('ori-color_info');
    });

    it('has no axe violations when labeled', async () => {
        const wrapper = mount(OriIcon, { props: { icon: 'M0 0', label: 'Search' }, attachTo: document.body });
        await expectNoA11yViolations(wrapper.element);
        wrapper.unmount();
    });
});
