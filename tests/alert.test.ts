import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import { OriAlert } from '../src/components/alert';
import { expectNoA11yViolations } from './helpers/axe';

describe('OriAlert', () => {
    it('renders default token classes and a polite role="status" for the info default', () => {
        const wrapper = mount(OriAlert);
        const c = wrapper.classes();

        expect(c).toContain('ori-alert');
        expect(c).toContain('ori-variant_tonal');
        expect(c).toContain('ori-color_info');
        expect(c).toContain('ori-size-radius_md');
        expect(c).toContain('ori-font-size_md');
        // info is non-urgent → polite live region (status), not assertive alert.
        expect(wrapper.attributes('role')).toBe('status');
    });

    it('derives an assertive role="alert" for urgent colors (danger / warn)', () => {
        expect(mount(OriAlert, { props: { color: 'danger' } }).attributes('role')).toBe('alert');
        expect(mount(OriAlert, { props: { color: 'warn' } }).attributes('role')).toBe('alert');
        expect(mount(OriAlert, { props: { color: 'success' } }).attributes('role')).toBe('status');
    });

    it('lets `live` override the derived politeness', () => {
        // force assertive on a non-urgent color, polite on an urgent one, and opt out entirely
        expect(mount(OriAlert, { props: { color: 'info', live: 'assertive' } }).attributes('role')).toBe('alert');
        expect(mount(OriAlert, { props: { color: 'danger', live: 'polite' } }).attributes('role')).toBe('status');
        expect(mount(OriAlert, { props: { live: 'off' } }).attributes('role')).toBeUndefined();
    });

    it('renders title via prop', () => {
        const wrapper = mount(OriAlert, { props: { title: 'Heads up' } });

        expect(wrapper.find('.ori-alert__title').text()).toBe('Heads up');
    });

    it('renders text via prop', () => {
        const wrapper = mount(OriAlert, { props: { text: 'Something went wrong.' } });

        expect(wrapper.find('.ori-alert__body').text()).toBe('Something went wrong.');
    });

    it('renders title and text together', () => {
        const wrapper = mount(OriAlert, { props: { title: 'Warning', text: 'Check your input.' } });

        expect(wrapper.find('.ori-alert__title').text()).toBe('Warning');
        expect(wrapper.find('.ori-alert__body').text()).toBe('Check your input.');
    });

    it('does not render title element when title prop is absent', () => {
        const wrapper = mount(OriAlert, { props: { text: 'Only body' } });

        expect(wrapper.find('.ori-alert__title').exists()).toBe(false);
    });

    it('does not render body element when text prop is absent and no default slot', () => {
        const wrapper = mount(OriAlert, { props: { title: 'Title only' } });

        expect(wrapper.find('.ori-alert__body').exists()).toBe(false);
    });

    it('renders icon element when icon prop is supplied', () => {
        const wrapper = mount(OriAlert, { props: { icon: 'M12 2L2 22h20L12 2z' } });

        expect(wrapper.find('.ori-alert__icon').exists()).toBe(true);
    });

    it('does not render icon element when icon prop is absent', () => {
        const wrapper = mount(OriAlert, { props: { text: 'No icon' } });

        expect(wrapper.find('.ori-alert__icon').exists()).toBe(false);
    });

    it('maps variant / color / radius / size to classes', () => {
        const c = mount(OriAlert, {
            props: { variant: 'outline', color: 'danger', radius: 'xl', size: 'lg', text: 'x' }
        }).classes();

        expect(c).toContain('ori-variant_outline');
        expect(c).toContain('ori-color_danger');
        expect(c).toContain('ori-size-radius_xl');
        expect(c).toContain('ori-font-size_lg');
    });

    it('does not render close button when closable is absent', () => {
        const wrapper = mount(OriAlert, { props: { text: 'Info' } });

        expect(wrapper.find('.ori-alert__close').exists()).toBe(false);
    });

    it('renders close button with aria-label when closable is true', () => {
        const wrapper = mount(OriAlert, { props: { closable: true } });
        const btn = wrapper.find('.ori-alert__close');

        expect(btn.exists()).toBe(true);
        expect(btn.attributes('aria-label')).toBe('Dismiss');
        expect(btn.attributes('type')).toBe('button');
    });

    it('respects custom closeLabel for aria-label', () => {
        const wrapper = mount(OriAlert, { props: { closable: true, closeLabel: 'Close notification' } });

        expect(wrapper.find('.ori-alert__close').attributes('aria-label')).toBe('Close notification');
    });

    it('emits "close" when the close button is clicked', async () => {
        const wrapper = mount(OriAlert, { props: { closable: true } });
        await wrapper.find('.ori-alert__close').trigger('click');

        expect(wrapper.emitted('close')).toHaveLength(1);
    });

    it('renders title via named slot', () => {
        const wrapper = mount(OriAlert, {
            slots: { title: '<span>Slot Title</span>' }
        });

        expect(wrapper.find('.ori-alert__title').text()).toBe('Slot Title');
    });

    it('renders body content via default slot', () => {
        const wrapper = mount(OriAlert, {
            slots: { default: 'Slot body text' }
        });

        expect(wrapper.find('.ori-alert__body').text()).toBe('Slot body text');
    });

    it('renders actions slot when provided', () => {
        const wrapper = mount(OriAlert, {
            slots: { actions: '<button>Retry</button>' }
        });

        expect(wrapper.find('.ori-alert__actions').exists()).toBe(true);
        expect(wrapper.find('.ori-alert__actions button').text()).toBe('Retry');
    });

    it('does not render actions element when actions slot is absent', () => {
        const wrapper = mount(OriAlert, { props: { text: 'No actions' } });

        expect(wrapper.find('.ori-alert__actions').exists()).toBe(false);
    });

    it('has no axe violations (basic text alert)', async () => {
        const wrapper = mount(OriAlert, {
            props: { title: 'Notice', text: 'Your session will expire soon.' },
            attachTo: document.body
        });
        await expectNoA11yViolations(wrapper.element);
        wrapper.unmount();
    });

    it('has no axe violations (closable alert with icon)', async () => {
        const wrapper = mount(OriAlert, {
            props: {
                title: 'Error',
                text: 'Something went wrong.',
                closable: true,
                closeLabel: 'Dismiss error',
                icon: 'M12 2L2 22h20L12 2z',
                color: 'danger'
            },
            attachTo: document.body
        });
        await expectNoA11yViolations(wrapper.element);
        wrapper.unmount();
    });
});
