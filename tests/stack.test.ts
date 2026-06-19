import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import { OriStack } from '../src';
import { expectNoA11yViolations } from './helpers/axe';

describe('OriStack', () => {
    it('renders a div with class ori-stack by default', () => {
        const wrapper = mount(OriStack);

        expect(wrapper.element.tagName).toBe('DIV');
        expect(wrapper.classes()).toContain('ori-stack');
        expect(wrapper.classes()).not.toContain('ori-cluster');
    });

    it('renders slot content', () => {
        const wrapper = mount(OriStack, {
            slots: { default: '<p class="child">content</p>' }
        });

        expect(wrapper.find('.child').exists()).toBe(true);
        expect(wrapper.find('.child').text()).toBe('content');
    });

    it('cluster prop swaps ori-stack for ori-cluster', () => {
        const wrapper = mount(OriStack, { props: { cluster: true } });

        expect(wrapper.classes()).toContain('ori-cluster');
        expect(wrapper.classes()).not.toContain('ori-stack');
    });

    it('cluster=false keeps ori-stack', () => {
        const wrapper = mount(OriStack, { props: { cluster: false } });

        expect(wrapper.classes()).toContain('ori-stack');
        expect(wrapper.classes()).not.toContain('ori-cluster');
    });

    it('gap prop adds ori-size-gap_<value> class', () => {
        const wrapper = mount(OriStack, { props: { gap: 'lg' } });

        expect(wrapper.classes()).toContain('ori-size-gap_lg');
    });

    it('gap="zero" adds ori-size-gap_zero class', () => {
        const wrapper = mount(OriStack, { props: { gap: 'zero' } });

        expect(wrapper.classes()).toContain('ori-size-gap_zero');
    });

    it('gap="md" adds ori-size-gap_md class', () => {
        const wrapper = mount(OriStack, { props: { gap: 'md' } });

        expect(wrapper.classes()).toContain('ori-size-gap_md');
    });

    it('no gap prop means no ori-size-gap_* class', () => {
        const wrapper = mount(OriStack);
        const gapClasses = wrapper.classes().filter((c) => c.startsWith('ori-size-gap_'));

        expect(gapClasses).toHaveLength(0);
    });

    it('align prop sets inline style align-items', () => {
        const wrapper = mount(OriStack, { props: { align: 'center' } });

        expect((wrapper.element as HTMLElement).style.alignItems).toBe('center');
    });

    it('justify prop sets inline style justify-content', () => {
        const wrapper = mount(OriStack, { props: { justify: 'space-between' } });

        expect((wrapper.element as HTMLElement).style.justifyContent).toBe('space-between');
    });

    it('align and justify can be set together', () => {
        const wrapper = mount(OriStack, { props: { align: 'flex-start', justify: 'flex-end' } });
        const el = wrapper.element as HTMLElement;

        expect(el.style.alignItems).toBe('flex-start');
        expect(el.style.justifyContent).toBe('flex-end');
    });

    it('omitting align and justify leaves those styles unset', () => {
        const wrapper = mount(OriStack);
        const el = wrapper.element as HTMLElement;

        expect(el.style.alignItems).toBe('');
        expect(el.style.justifyContent).toBe('');
    });

    it('as="section" renders a section element', () => {
        const wrapper = mount(OriStack, { props: { as: 'section' } });

        expect(wrapper.element.tagName).toBe('SECTION');
        expect(wrapper.classes()).toContain('ori-stack');
    });

    it('as="main" renders a main element', () => {
        const wrapper = mount(OriStack, { props: { as: 'main' } });

        expect(wrapper.element.tagName).toBe('MAIN');
    });

    it('cluster + gap + align + justify all combine correctly', () => {
        const wrapper = mount(OriStack, {
            props: { cluster: true, gap: 'sm', align: 'center', justify: 'space-around' }
        });
        const el = wrapper.element as HTMLElement;

        expect(wrapper.classes()).toContain('ori-cluster');
        expect(wrapper.classes()).toContain('ori-size-gap_sm');
        expect(el.style.alignItems).toBe('center');
        expect(el.style.justifyContent).toBe('space-around');
    });

    it('has no axe violations', async () => {
        const wrapper = mount(OriStack, {
            props: { gap: 'md' },
            slots: { default: '<p>Stack content</p>' },
            attachTo: document.body
        });
        await expectNoA11yViolations(wrapper.element);
        wrapper.unmount();
    });

    it('has no axe violations in cluster mode', async () => {
        const wrapper = mount(OriStack, {
            props: { cluster: true, gap: 'sm' },
            slots: { default: '<span>Item A</span><span>Item B</span>' },
            attachTo: document.body
        });
        await expectNoA11yViolations(wrapper.element);
        wrapper.unmount();
    });
});
