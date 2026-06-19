import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import { OriAvatar } from '../src';
import { expectNoA11yViolations } from './helpers/axe';

describe('OriAvatar', () => {
    it('computes uppercase initials from text', () => {
        const wrapper = mount(OriAvatar, { props: { text: 'John Doe' } });

        expect(wrapper.find('.ori-avatar__backdrop').text()).toBe('JD');
    });

    it('marks the initials backdrop as decorative', () => {
        const wrapper = mount(OriAvatar, { props: { text: 'Ann' } });

        expect(wrapper.find('.ori-avatar__backdrop').attributes('aria-hidden')).toBe('true');
    });

    it('renders title / subtitle and the titled modifier', () => {
        const wrapper = mount(OriAvatar, { props: { text: 'JD', title: 'Jane', subtitle: 'Admin' } });

        expect(wrapper.classes()).toContain('ori-avatar_titled');
        expect(wrapper.find('.ori-avatar__title').text()).toBe('Jane');
        expect(wrapper.find('.ori-avatar__subtitle').text()).toBe('Admin');
    });

    it('maps size / radius / inline / reverse to classes', () => {
        const c = mount(OriAvatar, {
            props: { text: 'A', size: 'xl', radius: 'sm', inline: true, reverse: true }
        }).classes();

        expect(c).toContain('ori-avatar_xl');
        expect(c).toContain('ori-size-radius_sm');
        expect(c).toContain('ori-avatar_inline');
        expect(c).toContain('ori-avatar_reverse');
    });

    it('has no axe violations', async () => {
        const wrapper = mount(OriAvatar, { props: { text: 'John Doe' }, attachTo: document.body });
        await expectNoA11yViolations(wrapper.element);
        wrapper.unmount();
    });
});
