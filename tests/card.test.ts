import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import { OriCard } from '../packages/vue/src';
import { expectNoA11yViolations } from './helpers/axe';

describe('OriCard', () => {
    it('renders default classes and title / subtitle / body text', () => {
        const wrapper = mount(OriCard, { props: { title: 'Hello', subtitle: 'World', text: 'Body' } });
        const c = wrapper.classes();

        expect(c).toContain('ori-card');
        expect(c).toContain('ori-variant_fill');
        expect(c).toContain('ori-color_surface');
        expect(c).toContain('ori-size-radius_lg');
        expect(wrapper.find('.ori-card__title').text()).toBe('Hello');
        expect(wrapper.find('.ori-card__subtitle').text()).toBe('World');
        expect(wrapper.find('.ori-card__body').text()).toBe('Body');
    });

    // State is an attribute, not a class — the css layer styles [aria-disabled] / [aria-busy].
    it('reflects disabled via aria-disabled', () => {
        const wrapper = mount(OriCard, { props: { title: 'x', disabled: true } });

        expect(wrapper.attributes('aria-disabled')).toBe('true');
    });

    it('reflects loading via aria-busy', () => {
        const wrapper = mount(OriCard, { props: { title: 'x', loading: true } });

        expect(wrapper.attributes('aria-busy')).toBe('true');
    });

    it('maps variant / color / radius / fluid / row to classes', () => {
        const c = mount(OriCard, {
            props: { title: 'x', variant: 'outline', color: 'success', radius: 'xl', fluid: true, row: true }
        }).classes();

        expect(c).toContain('ori-variant_outline');
        expect(c).toContain('ori-color_success');
        expect(c).toContain('ori-size-radius_xl');
        expect(c).toContain('ori-card_fluid');
        expect(c).toContain('ori-card_row');
    });

    // Icon mode is EXPLICIT: it needs an icon prop (prepend/append) AND no text — never the mere
    // absence of `text`. A plain or text-only card must not silently switch layout.
    it('icon mode (prependIcon, no text) takes the icon modifier class', () => {
        const c = mount(OriCard, { props: { prependIcon: 'M0 0' } }).classes();

        expect(c).toContain('ori-card_icon');
    });

    it('a text-only card is NOT icon mode', () => {
        const c = mount(OriCard, { props: { text: 'Body' } }).classes();

        expect(c).not.toContain('ori-card_icon');
    });

    it('a bare card (no icon, no text) is NOT forced into icon mode', () => {
        const c = mount(OriCard, { props: { title: 'Hello' } }).classes();

        expect(c).not.toContain('ori-card_icon');
    });

    it('an icon + text card is NOT icon mode', () => {
        const c = mount(OriCard, { props: { prependIcon: 'M0 0', text: 'Body' } }).classes();

        expect(c).not.toContain('ori-card_icon');
    });

    it('has no axe violations', async () => {
        const wrapper = mount(OriCard, {
            props: { title: 'Hello', subtitle: 'World', text: 'Body' },
            attachTo: document.body
        });
        await expectNoA11yViolations(wrapper.element);
        wrapper.unmount();
    });
});
