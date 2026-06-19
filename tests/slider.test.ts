import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import { OriSlider } from '../src/components/slider';
import { expectNoA11yViolations } from './helpers/axe';

describe('OriSlider', () => {
    it('renders a root .ori-slider wrapping an input[type=range].ori-slider__input', () => {
        const wrapper = mount(OriSlider);

        expect(wrapper.classes()).toContain('ori-slider');
        const input = wrapper.find('input.ori-slider__input');
        expect(input.exists()).toBe(true);
        expect(input.attributes('type')).toBe('range');
    });

    it('forwards min / max / step to the input as attributes', () => {
        const wrapper = mount(OriSlider, { props: { min: 10, max: 50, step: 5 } });
        const input = wrapper.find('input');

        expect(input.attributes('min')).toBe('10');
        expect(input.attributes('max')).toBe('50');
        expect(input.attributes('step')).toBe('5');
    });

    it('reflects modelValue in the input value', () => {
        const wrapper = mount(OriSlider, { props: { modelValue: 42, min: 0, max: 100 } });
        const input = wrapper.find('input');

        expect((input.element as HTMLInputElement).value).toBe('42');
    });

    it('defaults the input value to min when modelValue is undefined', () => {
        const wrapper = mount(OriSlider, { props: { min: 20, max: 80 } });
        const input = wrapper.find('input');

        expect((input.element as HTMLInputElement).value).toBe('20');
    });

    it('emits update:modelValue as a Number when the input event fires', async () => {
        const wrapper = mount(OriSlider, { props: { min: 0, max: 100 } });
        const input = wrapper.find('input');

        (input.element as HTMLInputElement).value = '42';
        await input.trigger('input');

        expect(wrapper.emitted('update:modelValue')).toBeTruthy();
        expect(wrapper.emitted('update:modelValue')![0]).toEqual([42]);
    });

    it('applies .ori-color_primary by default', () => {
        const wrapper = mount(OriSlider);

        expect(wrapper.classes()).toContain('ori-color_primary');
    });

    it('applies the correct color class when color prop is set', () => {
        const wrapper = mount(OriSlider, { props: { color: 'success' } });

        expect(wrapper.classes()).toContain('ori-color_success');
        expect(wrapper.classes()).not.toContain('ori-color_primary');
    });

    it('renders .ori-slider__label with text and correct for/id association when label is provided', () => {
        const wrapper = mount(OriSlider, { props: { label: 'Volume' } });
        const label = wrapper.find('label.ori-slider__label');
        const inputId = wrapper.find('input').attributes('id');

        expect(label.exists()).toBe(true);
        expect(label.text()).toContain('Volume');
        expect(inputId).toBeTruthy();
        expect(label.attributes('for')).toBe(inputId);
    });

    it('renders no label element when neither label nor showValue is provided', () => {
        const wrapper = mount(OriSlider);

        expect(wrapper.find('label').exists()).toBe(false);
    });

    it('renders .ori-slider__value with the current value when showValue is true', () => {
        const wrapper = mount(OriSlider, { props: { modelValue: 75, max: 100, showValue: true } });
        const valueEl = wrapper.find('.ori-slider__value');

        expect(valueEl.exists()).toBe(true);
        expect(valueEl.text()).toBe('75');
    });

    it('renders .ori-slider__value using min as fallback when modelValue is undefined and showValue is true', () => {
        const wrapper = mount(OriSlider, { props: { min: 10, max: 50, showValue: true } });

        expect(wrapper.find('.ori-slider__value').text()).toBe('10');
    });

    it('renders label element (for axe name) when showValue is true without label text', () => {
        const wrapper = mount(OriSlider, { props: { showValue: true } });

        expect(wrapper.find('label').exists()).toBe(true);
    });

    it('sets the input disabled attribute and root data-disabled when disabled is true', () => {
        const wrapper = mount(OriSlider, { props: { disabled: true, label: 'Brightness' } });
        const input = wrapper.find('input');

        expect((input.element as HTMLInputElement).disabled).toBe(true);
        expect(wrapper.attributes('data-disabled')).toBe('');
    });

    it('does not set data-disabled when disabled is false or omitted', () => {
        const wrapper = mount(OriSlider);

        expect(wrapper.attributes('data-disabled')).toBeUndefined();
    });

    it('sets --ori-slider-pct to 25% for min=0, max=100, modelValue=25', () => {
        const wrapper = mount(OriSlider, { props: { min: 0, max: 100, modelValue: 25 } });
        const input = wrapper.find('input');
        const style = (input.element as HTMLInputElement).style;

        expect(style.getPropertyValue('--ori-slider-pct')).toBe('25%');
    });

    it('sets --ori-slider-pct to 50% for min=0, max=200, modelValue=100', () => {
        const wrapper = mount(OriSlider, { props: { min: 0, max: 200, modelValue: 100 } });
        const input = wrapper.find('input');
        const style = (input.element as HTMLInputElement).style;

        expect(style.getPropertyValue('--ori-slider-pct')).toBe('50%');
    });

    it('sets --ori-slider-pct to 0% when span is zero (min === max)', () => {
        const wrapper = mount(OriSlider, { props: { min: 50, max: 50, modelValue: 50 } });
        const input = wrapper.find('input');
        const style = (input.element as HTMLInputElement).style;

        expect(style.getPropertyValue('--ori-slider-pct')).toBe('0%');
    });

    it('has no axe violations when a label is provided', async () => {
        const wrapper = mount(OriSlider, {
            props: { label: 'Volume', modelValue: 50, min: 0, max: 100 },
            attachTo: document.body
        });
        await expectNoA11yViolations(wrapper.element);
        wrapper.unmount();
    });

    it('forwards aria-label to the input element (inheritAttrs is disabled)', () => {
        const wrapper = mount(OriSlider, { attrs: { 'aria-label': 'Volume level' } });

        expect(wrapper.find('input').attributes('aria-label')).toBe('Volume level');
    });

    it('has no axe violations when named via aria-label only (no visible label)', async () => {
        const wrapper = mount(OriSlider, {
            attrs: { 'aria-label': 'Volume level' },
            attachTo: document.body
        });
        await expectNoA11yViolations(wrapper.element);
        wrapper.unmount();
    });
});
