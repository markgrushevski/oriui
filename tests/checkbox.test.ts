import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import { OriCheckbox } from '../packages/vue/src';
import { expectNoA11yViolations } from './helpers/axe';

describe('OriCheckbox', () => {
    it('renders a real <input type="checkbox"> with the default classes', () => {
        const wrapper = mount(OriCheckbox, { props: { label: 'Accept' } });
        const input = wrapper.find('input');

        expect(input.attributes('type')).toBe('checkbox');
        expect(wrapper.classes()).toContain('ori-checkbox');
        expect(wrapper.classes()).toContain('ori-color_primary');
        expect(wrapper.classes()).toContain('ori-font-size_md');
        expect(wrapper.find('.ori-checkbox__label').text()).toBe('Accept');
    });

    it('associates the label with the input via for/id', () => {
        const wrapper = mount(OriCheckbox, { props: { label: 'Accept' } });
        const fieldId = wrapper.find('input').attributes('id');

        expect(fieldId).toBeTruthy();
        expect(wrapper.find('label').attributes('for')).toBe(fieldId);
    });

    it('supports a boolean v-model', async () => {
        const wrapper = mount(OriCheckbox, { props: { modelValue: true } });
        const input = wrapper.find('input');

        expect((input.element as HTMLInputElement).checked).toBe(true);

        await input.setValue(false);
        expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([false]);
    });

    it('disabled sets the real disabled attribute + modifier class', () => {
        const wrapper = mount(OriCheckbox, { props: { disabled: true, label: 'x' } });

        expect((wrapper.find('input').element as HTMLInputElement).disabled).toBe(true);
        expect(wrapper.classes()).toContain('ori-checkbox_disabled');
    });

    it('invalid flips aria-invalid', () => {
        const wrapper = mount(OriCheckbox, { props: { invalid: true } });

        expect(wrapper.find('input').attributes('aria-invalid')).toBe('true');
    });

    it('maps size / color to classes', () => {
        const c = mount(OriCheckbox, { props: { size: 'lg', color: 'success' } }).classes();

        expect(c).toContain('ori-font-size_lg');
        expect(c).toContain('ori-color_success');
    });

    it('has no axe violations (labeled)', async () => {
        const wrapper = mount(OriCheckbox, { props: { label: 'Accept terms' }, attachTo: document.body });
        await expectNoA11yViolations(wrapper.element);
        wrapper.unmount();
    });
});
