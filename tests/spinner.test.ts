import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import { OriSpinner } from '../packages/vue/src';
import { expectNoA11yViolations } from './helpers/axe';

describe('OriSpinner', () => {
    it('is a status region with a default accessible label', () => {
        const wrapper = mount(OriSpinner);

        expect(wrapper.attributes('role')).toBe('status');
        expect(wrapper.attributes('aria-label')).toBe('Loading');
    });

    it('accepts a custom label', () => {
        const wrapper = mount(OriSpinner, { props: { label: 'Saving' } });

        expect(wrapper.attributes('aria-label')).toBe('Saving');
    });

    it('maps size / color / inline to classes', () => {
        const c = mount(OriSpinner, { props: { size: 'lg', color: 'primary', inline: true } }).classes();

        expect(c).toContain('ori-spinner_lg');
        expect(c).toContain('ori-color_primary');
        expect(c).toContain('ori-spinner_inline');
    });

    it('has no axe violations', async () => {
        const wrapper = mount(OriSpinner, { attachTo: document.body });
        await expectNoA11yViolations(wrapper.element);
        wrapper.unmount();
    });
});
