import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import { OriField, OriInput, OriSelect, OriTextarea } from '../packages/vue/src';
import { expectNoA11yViolations } from './helpers/axe';

describe('OriField', () => {
    // ----- standalone shell (label / hint / error / required, wired to a raw control) -----

    it('renders the field wrapper with the font-size token class', () => {
        const wrapper = mount(OriField, { props: { size: 'lg' } });

        expect(wrapper.classes()).toContain('ori-field');
        expect(wrapper.classes()).toContain('ori-font-size_lg');
    });

    it('renders a label tied to the control by for/id via the slot props', () => {
        const wrapper = mount(OriField, {
            props: { label: 'Email' },
            slots: { default: `<template #default="f"><input v-bind="f.controlAttrs" /></template>` }
        });
        const label = wrapper.find('label.ori-field__label');
        const inputId = wrapper.find('input').attributes('id');

        expect(label.text()).toContain('Email');
        expect(inputId).toBeTruthy();
        expect(label.attributes('for')).toBe(inputId);
    });

    it('required renders an asterisk and exposes the native required via controlAttrs', () => {
        const wrapper = mount(OriField, {
            props: { label: 'Name', required: true },
            slots: { default: `<template #default="f"><input v-bind="f.controlAttrs" /></template>` }
        });

        expect(wrapper.find('.ori-field__required').exists()).toBe(true);
        expect((wrapper.find('input').element as HTMLInputElement).required).toBe(true);
    });

    it('the #label slot renders rich content while keeping for/id and the required asterisk', () => {
        const wrapper = mount(OriField, {
            props: { required: true },
            slots: {
                label: `<span class="rich">Email <em>*</em></span>`,
                default: `<template #default="f"><input v-bind="f.controlAttrs" /></template>`
            }
        });
        const label = wrapper.find('label.ori-field__label');
        const inputId = wrapper.find('input').attributes('id');

        expect(label.find('.rich').exists()).toBe(true);
        expect(label.text()).toContain('Email');
        expect(label.attributes('for')).toBe(inputId);
        expect(inputId).toBeTruthy();
        expect(label.find('.ori-field__required').exists()).toBe(true);
    });

    it('the label prop renders as the #label fallback', () => {
        const wrapper = mount(OriField, {
            props: { label: 'Fallback' },
            slots: { default: `<template #default="f"><input v-bind="f.controlAttrs" /></template>` }
        });
        const label = wrapper.find('label.ori-field__label');

        expect(label.text()).toContain('Fallback');
        expect(label.attributes('for')).toBe(wrapper.find('input').attributes('id'));
    });

    it('hint is rendered and wired via aria-describedby (no error)', () => {
        const wrapper = mount(OriField, {
            props: { hint: 'We never share it' },
            slots: { default: `<template #default="f"><input v-bind="f.controlAttrs" /></template>` }
        });
        const hint = wrapper.find('.ori-field__hint');

        expect(hint.text()).toBe('We never share it');
        expect(wrapper.find('input').attributes('aria-describedby')).toBe(hint.attributes('id'));
        expect(wrapper.find('input').attributes('aria-invalid')).toBeUndefined();
    });

    it('error flips aria-invalid, announces via role=alert, and replaces the hint', () => {
        const wrapper = mount(OriField, {
            props: { hint: 'helper', error: 'Required field' },
            slots: { default: `<template #default="f"><input v-bind="f.controlAttrs" /></template>` }
        });
        const error = wrapper.find('.ori-field__error');

        expect(error.text()).toBe('Required field');
        expect(error.attributes('role')).toBe('alert');
        expect(wrapper.find('input').attributes('aria-invalid')).toBe('true');
        expect(wrapper.find('input').attributes('aria-describedby')).toBe(error.attributes('id'));
        expect(wrapper.find('.ori-field__hint').exists()).toBe(false);
    });

    it('appends the describedby prop to aria-describedby', () => {
        const wrapper = mount(OriField, {
            props: { hint: 'A hint', describedby: 'form-note' },
            slots: { default: `<template #default="f"><input v-bind="f.controlAttrs" /></template>` }
        });
        const describedby = wrapper.find('input').attributes('aria-describedby');

        expect(describedby).toContain('form-note');
        expect(describedby).toContain(wrapper.find('.ori-field__hint').attributes('id'));
    });

    it('a #error slot (no error prop) still flips aria-invalid and wires aria-describedby', () => {
        const wrapper = mount(OriField, {
            slots: {
                error: `<span class="rich">Required</span>`,
                default: `<template #default="f"><input v-bind="f.controlAttrs" /></template>`
            }
        });
        const error = wrapper.find('.ori-field__error');
        const input = wrapper.find('input');

        expect(error.exists()).toBe(true);
        expect(error.find('.rich').exists()).toBe(true);
        expect(input.attributes('aria-invalid')).toBe('true');
        expect(input.attributes('aria-describedby')).toBe(error.attributes('id'));
    });

    it('a #error slot alongside a hint prop points aria-describedby at the rendered error, never a suppressed hint', () => {
        const wrapper = mount(OriField, {
            props: { hint: 'helper' },
            slots: {
                error: `Required`,
                default: `<template #default="f"><input v-bind="f.controlAttrs" /></template>`
            }
        });
        const error = wrapper.find('.ori-field__error');
        const input = wrapper.find('input');

        // The error <p> renders and the hint <p> is suppressed — aria-describedby must not dangle.
        expect(error.exists()).toBe(true);
        expect(wrapper.find('.ori-field__hint').exists()).toBe(false);
        expect(input.attributes('aria-describedby')).toBe(error.attributes('id'));
    });

    // ----- integration: an Ori control nested in the field adopts its wiring -----

    it('an OriInput in the field shares the label id and renders no duplicate label/hint', () => {
        const wrapper = mount(
            {
                components: { OriField, OriInput },
                template: `<OriField label="Email" hint="We never share it"><OriInput type="email" /></OriField>`
            },
            { attachTo: document.body }
        );

        // exactly one label (the field's), tied to the input
        const labels = wrapper.findAll('label');
        expect(labels).toHaveLength(1);
        expect(labels[0].classes()).toContain('ori-field__label');

        const input = wrapper.find('input');
        expect(labels[0].attributes('for')).toBe(input.attributes('id'));

        // the input is described by the field's hint
        const hint = wrapper.find('.ori-field__hint');
        expect(input.attributes('aria-describedby')).toBe(hint.attributes('id'));

        // the control suppresses its own label / hint / error
        expect(wrapper.find('.ori-input__label').exists()).toBe(false);
        expect(wrapper.find('.ori-input__hint').exists()).toBe(false);
        expect(wrapper.find('.ori-input__field').exists()).toBe(true);

        wrapper.unmount();
    });

    it('field error/required/disabled drive the nested control natively', () => {
        const wrapper = mount({
            components: { OriField, OriInput },
            template: `<OriField label="Email" error="Enter a valid email" required disabled><OriInput type="email" /></OriField>`
        });
        const input = wrapper.find('input').element as HTMLInputElement;

        expect(input.getAttribute('aria-invalid')).toBe('true');
        expect(input.required).toBe(true);
        expect(input.disabled).toBe(true);
        // described by the field error, which carries role=alert
        const error = wrapper.find('.ori-field__error');
        expect(error.attributes('role')).toBe('alert');
        expect(input.getAttribute('aria-describedby')).toBe(error.attributes('id'));
    });

    it('propagates size to the nested control', () => {
        const wrapper = mount({
            components: { OriField, OriInput },
            template: `<OriField label="Big" size="lg"><OriInput /></OriField>`
        });
        const inner = wrapper.find('.ori-input');

        expect(inner.classes()).toContain('ori-input_lg');
        expect(inner.classes()).toContain('ori-font-size_lg');
        // and stretches to the field width
        expect(inner.classes()).toContain('ori-input_fluid');
    });

    it('wires a nested OriSelect (shared id, no duplicate label)', () => {
        const wrapper = mount({
            components: { OriField, OriSelect },
            template: `<OriField label="Fruit" hint="Pick one"><OriSelect :options="[{ label: 'Apple', value: 'a' }]" /></OriField>`
        });

        expect(wrapper.findAll('label')).toHaveLength(1);
        expect(wrapper.find('.ori-select__label').exists()).toBe(false);
        const select = wrapper.find('select');
        expect(wrapper.find('label').attributes('for')).toBe(select.attributes('id'));
        expect(select.attributes('aria-describedby')).toBe(wrapper.find('.ori-field__hint').attributes('id'));
    });

    it('wires a nested OriTextarea (shared id, no duplicate label)', () => {
        const wrapper = mount({
            components: { OriField, OriTextarea },
            template: `<OriField label="Bio" hint="Tell us"><OriTextarea /></OriField>`
        });

        expect(wrapper.findAll('label')).toHaveLength(1);
        expect(wrapper.find('.ori-textarea__label').exists()).toBe(false);
        const textarea = wrapper.find('textarea');
        expect(wrapper.find('label').attributes('for')).toBe(textarea.attributes('id'));
        expect(textarea.attributes('aria-describedby')).toBe(wrapper.find('.ori-field__hint').attributes('id'));
    });

    // ----- a control used standalone keeps owning its label (no regression) -----

    it('a standalone OriInput still renders its own label (field is opt-in)', () => {
        const wrapper = mount(OriInput, { props: { label: 'Solo', hint: 'h' } });

        expect(wrapper.find('.ori-input__label').exists()).toBe(true);
        expect(wrapper.find('.ori-input__hint').exists()).toBe(true);
    });

    it('has no axe violations (field + input, labelled with a hint)', async () => {
        const wrapper = mount(
            {
                components: { OriField, OriInput },
                template: `<OriField label="Email" hint="We never share it"><OriInput type="email" /></OriField>`
            },
            { attachTo: document.body }
        );
        await expectNoA11yViolations(wrapper.element);
        wrapper.unmount();
    });
});
