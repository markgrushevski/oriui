import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import { OriSelect } from '../packages/vue/src';
import { expectNoA11yViolations } from './helpers/axe';

const OPTIONS = [
    { label: 'Apple', value: 'apple' },
    { label: 'Banana', value: 'banana' },
    { label: 'Cherry', value: 'cherry', disabled: true }
];

describe('OriSelect', () => {
    it('renders a native <select> with the default token classes', () => {
        const wrapper = mount(OriSelect);

        expect(wrapper.classes()).toContain('ori-select');
        expect(wrapper.classes()).toContain('ori-color_primary');
        expect(wrapper.classes()).toContain('ori-font-size_md');
        expect(wrapper.classes()).toContain('ori-select_md');

        const select = wrapper.find('select');
        expect(select.exists()).toBe(true);
        expect(select.classes()).toContain('ori-select__control');
        expect(select.classes()).toContain('ori-size-radius_md');
    });

    it('renders options from the options prop', () => {
        const wrapper = mount(OriSelect, { props: { options: OPTIONS } });
        const opts = wrapper.findAll('option');

        expect(opts).toHaveLength(3);
        expect(opts[0].text()).toBe('Apple');
        expect(opts[1].text()).toBe('Banana');
        expect(opts[2].text()).toBe('Cherry');
        expect((opts[2].element as HTMLOptionElement).disabled).toBe(true);
    });

    it('renders a placeholder as a disabled first <option>', () => {
        const wrapper = mount(OriSelect, { props: { placeholder: 'Choose one', options: OPTIONS } });
        const opts = wrapper.findAll('option');

        expect(opts).toHaveLength(4);
        expect(opts[0].text()).toBe('Choose one');
        expect((opts[0].element as HTMLOptionElement).disabled).toBe(true);
        expect((opts[0].element as HTMLOptionElement).value).toBe('');
    });

    it('placeholder renders before slot options', () => {
        const wrapper = mount(OriSelect, {
            props: { placeholder: 'Pick one' },
            slots: { default: '<option value="x">X</option>' }
        });
        const opts = wrapper.findAll('option');

        expect(opts[0].text()).toBe('Pick one');
        expect((opts[0].element as HTMLOptionElement).disabled).toBe(true);
        expect(opts[1].text()).toBe('X');
    });

    it('default slot replaces options-prop rendering', () => {
        const wrapper = mount(OriSelect, {
            props: { options: OPTIONS },
            slots: {
                default: '<option value="slot-only">Slot option</option>'
            }
        });
        const opts = wrapper.findAll('option');

        // only the slot option, not the OPTIONS prop items
        expect(opts).toHaveLength(1);
        expect(opts[0].text()).toBe('Slot option');
    });

    it('reflects the initial v-model value in the native select', () => {
        const wrapper = mount(OriSelect, { props: { options: OPTIONS, modelValue: 'banana' } });
        const select = wrapper.find('select');

        expect((select.element as HTMLSelectElement).value).toBe('banana');
    });

    it('emits update:modelValue when the selection changes', async () => {
        const wrapper = mount(OriSelect, { props: { options: OPTIONS, modelValue: 'apple' } });

        await wrapper.find('select').setValue('banana');
        expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['banana']);
    });

    it('disabled sets the real native disabled attribute on the <select>', () => {
        const wrapper = mount(OriSelect, { props: { disabled: true } });

        expect((wrapper.find('select').element as HTMLSelectElement).disabled).toBe(true);
    });

    it('disabled=false does not set the disabled attribute', () => {
        const wrapper = mount(OriSelect, { props: { disabled: false } });

        expect((wrapper.find('select').element as HTMLSelectElement).disabled).toBe(false);
    });

    it('invalid sets aria-invalid="true" on the <select>', () => {
        const wrapper = mount(OriSelect, { props: { invalid: true } });

        expect(wrapper.find('select').attributes('aria-invalid')).toBe('true');
    });

    it('invalid=false does not render aria-invalid', () => {
        const wrapper = mount(OriSelect, { props: { invalid: false } });

        expect(wrapper.find('select').attributes('aria-invalid')).toBeUndefined();
    });

    it('has a stable id on the <select> for label association', () => {
        const wrapper = mount(OriSelect);
        const fieldId = wrapper.find('select').attributes('id');

        expect(fieldId).toBeTruthy();
    });

    it('uses the id prop when provided', () => {
        const wrapper = mount(OriSelect, { props: { id: 'my-select' } });

        expect(wrapper.find('select').attributes('id')).toBe('my-select');
    });

    it('an external <label for> can target the select by its id', () => {
        const wrapper = mount(OriSelect, { props: { id: 'fruit' } });
        const fieldId = wrapper.find('select').attributes('id');

        // The id is on the <select> itself, not the wrapper
        expect(fieldId).toBe('fruit');
        expect(wrapper.attributes('id')).toBeUndefined();
    });

    it('chevron is aria-hidden and decorative', () => {
        const wrapper = mount(OriSelect);
        const chevron = wrapper.find('.ori-select__chevron');

        expect(chevron.exists()).toBe(true);
        expect(chevron.attributes('aria-hidden')).toBe('true');
    });

    it('maps color / size / radius to classes', () => {
        const wrapper = mount(OriSelect, {
            props: { color: 'danger', size: 'lg', radius: 'sm' }
        });

        expect(wrapper.classes()).toContain('ori-color_danger');
        expect(wrapper.classes()).toContain('ori-font-size_lg');
        expect(wrapper.classes()).toContain('ori-select_lg');
        expect(wrapper.find('select').classes()).toContain('ori-size-radius_sm');
    });

    it('forwards arbitrary native attrs to the <select>, not the wrapper (inheritAttrs:false)', () => {
        const wrapper = mount(OriSelect, {
            attrs: { name: 'fruit', autocomplete: 'off' }
        });
        const select = wrapper.find('select');

        expect(select.attributes('name')).toBe('fruit');
        expect(select.attributes('autocomplete')).toBe('off');

        // should NOT land on the wrapper div
        expect(wrapper.attributes('name')).toBeUndefined();
        expect(wrapper.attributes('autocomplete')).toBeUndefined();
    });

    // ----- built-in label / hint / error / required (parity with OriInput / OriTextarea) -----

    it('renders a built-in <label for> targeting the select', () => {
        const wrapper = mount(OriSelect, { props: { label: 'Fruit' } });
        const label = wrapper.find('label.ori-select__label');
        const fieldId = wrapper.find('select').attributes('id');

        expect(label.exists()).toBe(true);
        expect(label.text()).toContain('Fruit');
        expect(label.attributes('for')).toBe(fieldId);
    });

    it('required renders an asterisk and sets the native required attribute', () => {
        const wrapper = mount(OriSelect, { props: { label: 'Fruit', required: true } });

        expect(wrapper.find('.ori-select__required').exists()).toBe(true);
        expect((wrapper.find('select').element as HTMLSelectElement).required).toBe(true);
    });

    it('hint renders below the control and is wired via aria-describedby', () => {
        const wrapper = mount(OriSelect, { props: { hint: 'Pick your favourite' } });
        const hint = wrapper.find('.ori-select__hint');
        const select = wrapper.find('select');

        expect(hint.exists()).toBe(true);
        expect(hint.text()).toBe('Pick your favourite');
        expect(select.attributes('aria-describedby')).toBe(hint.attributes('id'));
    });

    it('error renders role=alert, flips aria-invalid, and is wired via aria-describedby', () => {
        const wrapper = mount(OriSelect, { props: { error: 'Selection required' } });
        const error = wrapper.find('.ori-select__error');
        const select = wrapper.find('select');

        expect(error.exists()).toBe(true);
        expect(error.attributes('role')).toBe('alert');
        expect(select.attributes('aria-invalid')).toBe('true');
        expect(select.attributes('aria-describedby')).toBe(error.attributes('id'));
    });

    it('error replaces the hint and is the described element', () => {
        const wrapper = mount(OriSelect, { props: { hint: 'A hint', error: 'An error' } });

        expect(wrapper.find('.ori-select__hint').exists()).toBe(false);
        expect(wrapper.find('.ori-select__error').exists()).toBe(true);
        expect(wrapper.find('select').attributes('aria-describedby')).toBe(
            wrapper.find('.ori-select__error').attributes('id')
        );
    });

    it('appends the describedby prop to aria-describedby', () => {
        const wrapper = mount(OriSelect, { props: { hint: 'A hint', describedby: 'form-note' } });
        const describedby = wrapper.find('select').attributes('aria-describedby');

        expect(describedby).toContain('form-note');
        expect(describedby).toContain(wrapper.find('.ori-select__hint').attributes('id'));
    });

    it('has no axe violations (built-in label, no external <label> needed)', async () => {
        const wrapper = mount(OriSelect, {
            props: { label: 'Fruit', options: OPTIONS },
            attachTo: document.body
        });
        await expectNoA11yViolations(wrapper.element);
        wrapper.unmount();
    });

    it('has no axe violations (with a label and options)', async () => {
        // Mount with an external <label> associating via the stable id
        const wrapper = mount(
            {
                components: { OriSelect },
                template: `
                    <div>
                        <label for="axe-select">Fruit</label>
                        <OriSelect id="axe-select" :options="options" />
                    </div>
                `,
                data() {
                    return { options: OPTIONS };
                }
            },
            { attachTo: document.body }
        );
        await expectNoA11yViolations(wrapper.element);
        wrapper.unmount();
    });
});
