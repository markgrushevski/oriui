import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import { OriRadioGroup } from '../src';
import { expectNoA11yViolations } from './helpers/axe';

const OPTIONS = [
    { label: 'Free', value: 'free' },
    { label: 'Pro', value: 'pro' },
    { label: 'Team', value: 'team', disabled: true }
];

describe('OriRadioGroup', () => {
    it('renders a radiogroup with one real radio per option', () => {
        const wrapper = mount(OriRadioGroup, { props: { options: OPTIONS, label: 'Plan' } });

        expect(wrapper.attributes('role')).toBe('radiogroup');
        expect(wrapper.findAll('input[type="radio"]')).toHaveLength(3);
        expect(wrapper.classes()).toContain('ori-radio-group');
        expect(wrapper.classes()).toContain('ori-color_primary');
    });

    it('names the group via aria-labelledby', () => {
        const wrapper = mount(OriRadioGroup, { props: { options: OPTIONS, label: 'Plan' } });
        const labelId = wrapper.find('.ori-radio-group__label').attributes('id');

        expect(labelId).toBeTruthy();
        expect(wrapper.attributes('aria-labelledby')).toBe(labelId);
        expect(wrapper.find('.ori-radio-group__label').text()).toBe('Plan');
    });

    it('shares a single name across the radios', () => {
        const wrapper = mount(OriRadioGroup, { props: { options: OPTIONS } });
        const names = wrapper.findAll('input').map((i) => i.attributes('name'));

        expect(names[0]).toBeTruthy();
        expect(new Set(names).size).toBe(1);
    });

    it('reflects the v-model selection and emits the value on change', async () => {
        const wrapper = mount(OriRadioGroup, { props: { options: OPTIONS, modelValue: 'pro' } });
        const radios = wrapper.findAll('input');

        expect((radios[1].element as HTMLInputElement).checked).toBe(true);

        await radios[0].setValue();
        expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['free']);
    });

    it('disables the whole group, and individual options', () => {
        const all = mount(OriRadioGroup, { props: { options: OPTIONS, disabled: true } });
        expect(all.findAll('input').every((r) => (r.element as HTMLInputElement).disabled)).toBe(true);

        const partial = mount(OriRadioGroup, { props: { options: OPTIONS } });
        expect((partial.findAll('input')[2].element as HTMLInputElement).disabled).toBe(true);
        expect((partial.findAll('input')[0].element as HTMLInputElement).disabled).toBe(false);
    });

    it('required sets aria-required + the native required attribute', () => {
        const wrapper = mount(OriRadioGroup, { props: { options: OPTIONS, required: true } });

        expect(wrapper.attributes('aria-required')).toBe('true');
        expect((wrapper.find('input').element as HTMLInputElement).required).toBe(true);
    });

    it('maps inline / size / color to classes', () => {
        const c = mount(OriRadioGroup, {
            props: { options: OPTIONS, inline: true, size: 'lg', color: 'success' }
        }).classes();

        expect(c).toContain('ori-radio-group_inline');
        expect(c).toContain('ori-font-size_lg');
        expect(c).toContain('ori-color_success');
    });

    it('has no axe violations (labeled group)', async () => {
        const wrapper = mount(OriRadioGroup, { props: { options: OPTIONS, label: 'Plan' }, attachTo: document.body });
        await expectNoA11yViolations(wrapper.element);
        wrapper.unmount();
    });
});
