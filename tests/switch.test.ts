import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import { OriSwitch } from '../packages/vue/src';
import { expectNoA11yViolations } from './helpers/axe';

describe('OriSwitch', () => {
    it('renders a checkbox with role="switch" and the default classes', () => {
        const wrapper = mount(OriSwitch, { props: { label: 'Wi-Fi' } });
        const input = wrapper.find('input');

        expect(input.attributes('type')).toBe('checkbox');
        expect(input.attributes('role')).toBe('switch');
        expect(wrapper.classes()).toContain('ori-switch');
        expect(wrapper.classes()).toContain('ori-color_primary');
        expect(wrapper.find('.ori-switch__label').text()).toBe('Wi-Fi');
    });

    it('associates the label with the input via for/id', () => {
        const wrapper = mount(OriSwitch, { props: { label: 'Wi-Fi' } });
        const fieldId = wrapper.find('input').attributes('id');

        expect(fieldId).toBeTruthy();
        expect(wrapper.find('label').attributes('for')).toBe(fieldId);
    });

    it('supports a boolean v-model', async () => {
        const wrapper = mount(OriSwitch, { props: { modelValue: false } });
        const input = wrapper.find('input');

        expect((input.element as HTMLInputElement).checked).toBe(false);

        await input.setValue(true);
        expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([true]);
    });

    it('disabled sets the real disabled attribute + modifier class', () => {
        const wrapper = mount(OriSwitch, { props: { disabled: true, label: 'x' } });

        expect((wrapper.find('input').element as HTMLInputElement).disabled).toBe(true);
        expect(wrapper.classes()).toContain('ori-switch_disabled');
    });

    it('invalid flips aria-invalid', () => {
        const wrapper = mount(OriSwitch, { props: { invalid: true } });

        expect(wrapper.find('input').attributes('aria-invalid')).toBe('true');
    });

    it('maps size / color to classes', () => {
        const c = mount(OriSwitch, { props: { size: 'sm', color: 'success' } }).classes();

        expect(c).toContain('ori-font-size_sm');
        expect(c).toContain('ori-color_success');
    });

    it('renders rich default-slot content as the label', () => {
        const wrapper = mount(OriSwitch, {
            slots: { default: '<strong>Wi-Fi</strong>' }
        });

        const label = wrapper.find('.ori-switch__label');
        expect(label.exists()).toBe(true);
        expect(label.find('strong').text()).toBe('Wi-Fi');
    });

    it('falls back to the label prop when no slot is provided', () => {
        const wrapper = mount(OriSwitch, { props: { label: 'Wi-Fi' } });

        expect(wrapper.find('.ori-switch__label').text()).toBe('Wi-Fi');
    });

    it('has no axe violations (labeled)', async () => {
        const wrapper = mount(OriSwitch, { props: { label: 'Enable notifications' }, attachTo: document.body });
        await expectNoA11yViolations(wrapper.element);
        wrapper.unmount();
    });
});
