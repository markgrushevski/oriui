import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import OriSkeleton from '../packages/vue/src/components/skeleton/ori-skeleton.vue';
import { expectNoA11yViolations } from './helpers/axe';

describe('OriSkeleton', () => {
    it('renders a <div> by default with the block class and default radius', () => {
        const wrapper = mount(OriSkeleton);
        const el = wrapper.element;

        expect(el.tagName).toBe('DIV');
        expect(wrapper.classes()).toContain('ori-skeleton');
        expect(wrapper.classes()).toContain('ori-size-radius_sm');
    });

    it('is aria-hidden (decorative — the loading region owns aria-busy)', () => {
        const wrapper = mount(OriSkeleton);

        expect(wrapper.attributes('aria-hidden')).toBe('true');
    });

    it('maps the radius prop to ori-size-radius_<value>', () => {
        for (const radius of ['zero', 'xs', 'sm', 'md', 'lg', 'xl', 'rounded'] as const) {
            const wrapper = mount(OriSkeleton, { props: { radius } });

            expect(wrapper.classes()).toContain(`ori-size-radius_${radius}`);
        }
    });

    it('as prop renders as a different HTML element', () => {
        const wrapper = mount(OriSkeleton, { props: { as: 'span' } });

        expect(wrapper.element.tagName).toBe('SPAN');
        expect(wrapper.classes()).toContain('ori-skeleton');
        expect(wrapper.attributes('aria-hidden')).toBe('true');
    });

    it('carries no slot content (consumer sizes via style/class)', () => {
        // Mounting with slots should produce no rendered children — the element is self-closing.
        const wrapper = mount(OriSkeleton);

        expect(wrapper.element.childNodes.length).toBe(0);
    });

    it('has no axe violations inside an aria-busy loading region', async () => {
        const region = document.createElement('div');
        region.setAttribute('role', 'region');
        region.setAttribute('aria-label', 'Loading content');
        region.setAttribute('aria-busy', 'true');
        document.body.appendChild(region);

        const wrapper = mount(OriSkeleton, { attachTo: region });

        await expectNoA11yViolations(region);

        wrapper.unmount();
        document.body.removeChild(region);
    });
});
