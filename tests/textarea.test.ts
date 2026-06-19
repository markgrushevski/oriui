import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import { OriTextarea } from '../packages/vue/src/components/textarea';
import { expectNoA11yViolations } from './helpers/axe';

describe('OriTextarea', () => {
    it('renders a <textarea> with the default token classes', () => {
        const wrapper = mount(OriTextarea);
        const wrapClasses = wrapper.classes();

        expect(wrapClasses).toContain('ori-textarea');
        expect(wrapClasses).toContain('ori-color_primary');
        expect(wrapClasses).toContain('ori-font-size_md');
        expect(wrapClasses).toContain('ori-textarea_outline');
        expect(wrapClasses).toContain('ori-textarea_md');

        const field = wrapper.find('textarea');
        expect(field.exists()).toBe(true);
        expect(field.classes()).toContain('ori-textarea__field');
        expect(field.classes()).toContain('ori-size-radius_md');
    });

    it('sets the default rows attribute on the <textarea>', () => {
        const wrapper = mount(OriTextarea);
        const field = wrapper.find('textarea');

        expect(field.attributes('rows')).toBe('3');
    });

    it('associates the label with the field via for/id', () => {
        const wrapper = mount(OriTextarea, { props: { label: 'Description' } });
        const label = wrapper.find('label');
        const fieldId = wrapper.find('textarea').attributes('id');

        expect(label.text()).toContain('Description');
        expect(fieldId).toBeTruthy();
        expect(label.attributes('for')).toBe(fieldId);
    });

    it('marks a required field (asterisk + native required)', () => {
        const wrapper = mount(OriTextarea, { props: { label: 'Bio', required: true } });

        expect(wrapper.find('.ori-textarea__required').exists()).toBe(true);
        expect((wrapper.find('textarea').element as HTMLTextAreaElement).required).toBe(true);
    });

    it('supports v-model (reflects value in, emits update:modelValue out)', async () => {
        const wrapper = mount(OriTextarea, { props: { modelValue: 'hello' } });
        const field = wrapper.find('textarea');

        expect((field.element as HTMLTextAreaElement).value).toBe('hello');

        await field.setValue('world');
        expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['world']);
    });

    it('disabled sets the real disabled attribute on the <textarea>', () => {
        const wrapper = mount(OriTextarea, { props: { disabled: true } });

        expect((wrapper.find('textarea').element as HTMLTextAreaElement).disabled).toBe(true);
    });

    it('hint is rendered and wired via aria-describedby', () => {
        const wrapper = mount(OriTextarea, { props: { hint: 'Up to 500 characters' } });
        const hint = wrapper.find('.ori-textarea__hint');

        expect(hint.text()).toBe('Up to 500 characters');
        expect(wrapper.find('textarea').attributes('aria-describedby')).toBe(hint.attributes('id'));
        expect(wrapper.find('textarea').attributes('aria-invalid')).toBeUndefined();
    });

    it('error flips aria-invalid, announces via role=alert, and replaces the hint', () => {
        const wrapper = mount(OriTextarea, { props: { hint: 'helper', error: 'Field is required' } });
        const field = wrapper.find('textarea');
        const error = wrapper.find('.ori-textarea__error');

        expect(error.text()).toBe('Field is required');
        expect(error.attributes('role')).toBe('alert');
        expect(field.attributes('aria-invalid')).toBe('true');
        expect(field.attributes('aria-describedby')).toBe(error.attributes('id'));
        // error supersedes hint — only the error helper is rendered
        expect(wrapper.find('.ori-textarea__hint').exists()).toBe(false);
    });

    it('invalid prop alone flips aria-invalid without an error message', () => {
        const wrapper = mount(OriTextarea, { props: { invalid: true } });

        expect(wrapper.find('textarea').attributes('aria-invalid')).toBe('true');
        expect(wrapper.find('.ori-textarea__error').exists()).toBe(false);
    });

    it('forwards arbitrary native attributes to the <textarea>', () => {
        const wrapper = mount(OriTextarea, {
            attrs: { name: 'bio', maxlength: '500', autocomplete: 'off', wrap: 'soft' }
        });
        const field = wrapper.find('textarea');

        expect(field.attributes('name')).toBe('bio');
        expect(field.attributes('maxlength')).toBe('500');
        expect(field.attributes('autocomplete')).toBe('off');
        expect(field.attributes('wrap')).toBe('soft');
        // inheritAttrs:false — they land on the field, not the wrapper div
        expect(wrapper.attributes('name')).toBeUndefined();
    });

    it('maps size / radius / variant / color to classes', () => {
        const wrapper = mount(OriTextarea, {
            props: { size: 'lg', radius: 'sm', variant: 'fill', color: 'danger' }
        });
        const wrapClasses = wrapper.classes();

        expect(wrapClasses).toContain('ori-font-size_lg');
        expect(wrapClasses).toContain('ori-textarea_fill');
        expect(wrapClasses).toContain('ori-color_danger');
        expect(wrapClasses).toContain('ori-textarea_lg');
        expect(wrapper.find('textarea').classes()).toContain('ori-size-radius_sm');
    });

    it('fluid prop adds the fluid modifier class', () => {
        const wrapper = mount(OriTextarea, { props: { fluid: true } });

        expect(wrapper.classes()).toContain('ori-textarea_fluid');
    });

    it('rows prop is forwarded to the <textarea>', () => {
        const wrapper = mount(OriTextarea, { props: { rows: 6 } });

        expect(wrapper.find('textarea').attributes('rows')).toBe('6');
    });

    it('describedby prop is appended to aria-describedby', () => {
        const wrapper = mount(OriTextarea, {
            props: { hint: 'Some hint', describedby: 'external-note' }
        });
        const fieldDescribedBy = wrapper.find('textarea').attributes('aria-describedby') ?? '';

        expect(fieldDescribedBy).toContain('external-note');
        // hint id should also be present
        const hintId = wrapper.find('.ori-textarea__hint').attributes('id');
        expect(fieldDescribedBy).toContain(hintId);
    });

    it('has no axe violations (labeled, with hint)', async () => {
        const wrapper = mount(OriTextarea, {
            props: { label: 'Description', hint: 'Up to 500 characters', modelValue: '' },
            attachTo: document.body
        });
        await expectNoA11yViolations(wrapper.element);
        wrapper.unmount();
    });

    it('has no axe violations in error state', async () => {
        const wrapper = mount(OriTextarea, {
            props: { label: 'Bio', error: 'This field is required', modelValue: '' },
            attachTo: document.body
        });
        await expectNoA11yViolations(wrapper.element);
        wrapper.unmount();
    });
});
