import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import { OriTag } from '../src/components/tag';
import { expectNoA11yViolations } from './helpers/axe';

describe('OriTag', () => {
    it('renders default token classes on the root <span>', () => {
        const wrapper = mount(OriTag, { props: { text: 'Beta' } });
        const c = wrapper.classes();

        expect(wrapper.element.tagName).toBe('SPAN');
        expect(c).toContain('ori-tag');
        expect(c).toContain('ori-variant_tonal');
        expect(c).toContain('ori-color_primary');
        expect(c).toContain('ori-font-size_sm');
        expect(c).toContain('ori-size-radius_rounded');
    });

    it('renders the text prop inside .ori-tag__text', () => {
        const wrapper = mount(OriTag, { props: { text: 'New' } });

        expect(wrapper.find('.ori-tag__text').text()).toBe('New');
    });

    it('renders slot content instead of text prop', () => {
        const wrapper = mount(OriTag, { slots: { default: 'Slotted' } });

        expect(wrapper.find('.ori-tag__text').text()).toBe('Slotted');
    });

    it('maps variant / color / size / radius to classes', () => {
        const c = mount(OriTag, {
            props: { text: 'x', variant: 'outline', color: 'success', size: 'lg', radius: 'xl' }
        }).classes();

        expect(c).toContain('ori-variant_outline');
        expect(c).toContain('ori-color_success');
        expect(c).toContain('ori-font-size_lg');
        expect(c).toContain('ori-size-radius_xl');
    });

    it('reflects disabled state via aria-disabled attribute, not a class', () => {
        const wrapper = mount(OriTag, { props: { text: 'x', disabled: true } });

        expect(wrapper.attributes('aria-disabled')).toBe('true');
        // no extra disabled class — state is attribute-driven
        expect(wrapper.classes()).not.toContain('ori-tag_disabled');
    });

    it('does not set aria-disabled when not disabled', () => {
        const wrapper = mount(OriTag, { props: { text: 'x' } });

        expect(wrapper.attributes('aria-disabled')).toBeUndefined();
    });

    it('renders prependIcon when provided', () => {
        const wrapper = mount(OriTag, { props: { text: 'x', prependIcon: 'M0 0h24v24H0z' } });
        const icons = wrapper.findAll('.ori-tag__icon');

        // prepend icon comes before the text
        expect(icons.length).toBeGreaterThanOrEqual(1);
        const firstIcon = icons[0];
        const textEl = wrapper.find('.ori-tag__text');
        // prepend icon should appear before .ori-tag__text in the DOM
        expect(
            firstIcon.element.compareDocumentPosition(textEl.element) & Node.DOCUMENT_POSITION_FOLLOWING
        ).toBeTruthy();
    });

    it('renders appendIcon when provided', () => {
        const wrapper = mount(OriTag, { props: { text: 'x', appendIcon: 'M0 0h24v24H0z' } });
        const icons = wrapper.findAll('.ori-tag__icon');

        expect(icons.length).toBeGreaterThanOrEqual(1);
        const lastIcon = icons[icons.length - 1];
        const textEl = wrapper.find('.ori-tag__text');
        // append icon should appear after .ori-tag__text in the DOM
        expect(
            textEl.element.compareDocumentPosition(lastIcon.element) & Node.DOCUMENT_POSITION_FOLLOWING
        ).toBeTruthy();
    });

    it('does not render a close button when closable is not set', () => {
        const wrapper = mount(OriTag, { props: { text: 'x' } });

        expect(wrapper.find('.ori-tag__close').exists()).toBe(false);
    });

    it('renders a close button when closable=true', () => {
        const wrapper = mount(OriTag, { props: { text: 'x', closable: true } });
        const btn = wrapper.find('.ori-tag__close');

        expect(btn.exists()).toBe(true);
        expect(btn.element.tagName).toBe('BUTTON');
        expect((btn.element as HTMLButtonElement).type).toBe('button');
    });

    it('close button uses the default aria-label "Remove"', () => {
        const wrapper = mount(OriTag, { props: { text: 'x', closable: true } });

        expect(wrapper.find('.ori-tag__close').attributes('aria-label')).toBe('Remove');
    });

    it('close button uses a custom closeLabel when provided', () => {
        const wrapper = mount(OriTag, { props: { text: 'x', closable: true, closeLabel: 'Dismiss tag' } });

        expect(wrapper.find('.ori-tag__close').attributes('aria-label')).toBe('Dismiss tag');
    });

    it('clicking the close button emits the close event', async () => {
        const wrapper = mount(OriTag, { props: { text: 'x', closable: true } });

        await wrapper.find('.ori-tag__close').trigger('click');

        expect(wrapper.emitted('close')).toBeTruthy();
        expect(wrapper.emitted('close')!.length).toBe(1);
    });

    it('close button is disabled (native) when the tag is disabled', () => {
        const wrapper = mount(OriTag, { props: { text: 'x', closable: true, disabled: true } });
        const btn = wrapper.find('.ori-tag__close');

        expect((btn.element as HTMLButtonElement).disabled).toBe(true);
    });

    it('has no axe violations (basic tag)', async () => {
        const wrapper = mount(OriTag, {
            props: { text: 'Beta' },
            attachTo: document.body
        });
        await expectNoA11yViolations(wrapper.element);
        wrapper.unmount();
    });

    it('has no axe violations (closable tag)', async () => {
        const wrapper = mount(OriTag, {
            props: { text: 'Beta', closable: true, closeLabel: 'Remove Beta tag' },
            attachTo: document.body
        });
        await expectNoA11yViolations(wrapper.element);
        wrapper.unmount();
    });
});
