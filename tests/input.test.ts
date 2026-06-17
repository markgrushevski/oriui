import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import { OriInput } from '../src';
import { expectNoA11yViolations } from './helpers/axe';

describe('OriInput', () => {
    it('renders an <input> with the default token classes', () => {
        const wrapper = mount(OriInput);
        const wrap = wrapper.classes();

        expect(wrap).toContain('ori-input');
        expect(wrap).toContain('ori-color_primary');
        expect(wrap).toContain('ori-font-size_md');
        expect(wrap).toContain('ori-input_outline');

        const field = wrapper.find('input');
        expect(field.exists()).toBe(true);
        expect(field.classes()).toContain('ori-size-action_md');
        expect(field.classes()).toContain('ori-size-radius_md');
        expect(field.attributes('type')).toBe('text');
    });

    it('associates the label with the field via for/id', () => {
        const wrapper = mount(OriInput, { props: { label: 'Email' } });
        const label = wrapper.find('label');
        const fieldId = wrapper.find('input').attributes('id');

        expect(label.text()).toContain('Email');
        expect(fieldId).toBeTruthy();
        expect(label.attributes('for')).toBe(fieldId);
    });

    it('marks a required field (asterisk + native required)', () => {
        const wrapper = mount(OriInput, { props: { label: 'Name', required: true } });

        expect(wrapper.find('.ori-input__required').exists()).toBe(true);
        expect((wrapper.find('input').element as HTMLInputElement).required).toBe(true);
    });

    it('supports v-model (reflects value in, emits update out)', async () => {
        const wrapper = mount(OriInput, { props: { modelValue: 'hi' } });
        const field = wrapper.find('input');

        expect((field.element as HTMLInputElement).value).toBe('hi');

        await field.setValue('world');
        expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['world']);
    });

    it('disabled sets the real disabled attribute', () => {
        const wrapper = mount(OriInput, { props: { disabled: true } });

        expect((wrapper.find('input').element as HTMLInputElement).disabled).toBe(true);
    });

    it('hint is rendered and wired via aria-describedby', () => {
        const wrapper = mount(OriInput, { props: { hint: 'We never share it' } });
        const hint = wrapper.find('.ori-input__hint');

        expect(hint.text()).toBe('We never share it');
        expect(wrapper.find('input').attributes('aria-describedby')).toBe(hint.attributes('id'));
        expect(wrapper.find('input').attributes('aria-invalid')).toBeUndefined();
    });

    it('error flips aria-invalid, announces via role=alert, and replaces the hint', () => {
        const wrapper = mount(OriInput, { props: { hint: 'helper', error: 'Required field' } });
        const field = wrapper.find('input');
        const error = wrapper.find('.ori-input__error');

        expect(error.text()).toBe('Required field');
        expect(error.attributes('role')).toBe('alert');
        expect(field.attributes('aria-invalid')).toBe('true');
        expect(field.attributes('aria-describedby')).toBe(error.attributes('id'));
        // error supersedes hint — only one helper is rendered (no dangling aria reference)
        expect(wrapper.find('.ori-input__hint').exists()).toBe(false);
    });

    it('invalid prop alone flips aria-invalid', () => {
        const wrapper = mount(OriInput, { props: { invalid: true } });

        expect(wrapper.find('input').attributes('aria-invalid')).toBe('true');
    });

    it('forwards arbitrary native attributes to the underlying input', () => {
        const wrapper = mount(OriInput, {
            attrs: { name: 'email', autocomplete: 'email', maxlength: '50', inputmode: 'email' }
        });
        const field = wrapper.find('input');

        expect(field.attributes('name')).toBe('email');
        expect(field.attributes('autocomplete')).toBe('email');
        expect(field.attributes('maxlength')).toBe('50');
        expect(field.attributes('inputmode')).toBe('email');
        // inheritAttrs:false — they land on the field, not the wrapper
        expect(wrapper.attributes('name')).toBeUndefined();
    });

    it('maps size / radius / variant / color to classes', () => {
        const wrapper = mount(OriInput, { props: { size: 'lg', radius: 'sm', variant: 'fill', color: 'danger' } });

        expect(wrapper.classes()).toContain('ori-font-size_lg');
        expect(wrapper.classes()).toContain('ori-input_fill');
        expect(wrapper.classes()).toContain('ori-color_danger');
        expect(wrapper.find('input').classes()).toContain('ori-size-action_lg');
        expect(wrapper.find('input').classes()).toContain('ori-size-radius_sm');
    });

    it('has no axe violations (labeled, with hint)', async () => {
        const wrapper = mount(OriInput, {
            props: { label: 'Email', hint: 'We never share it', modelValue: '' },
            attachTo: document.body
        });
        await expectNoA11yViolations(wrapper.element);
        wrapper.unmount();
    });
});
