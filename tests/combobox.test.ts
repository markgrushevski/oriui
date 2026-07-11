import { describe, it, expect, vi } from 'vitest';
import { h } from 'vue';
import { mount } from '@vue/test-utils';
import { combobox } from '@oriui/headless';
import { OriCombobox } from '../packages/vue/src';
import { expectNoA11yViolations } from './helpers/axe';

const OPTIONS = [
    { label: 'Apple', value: 'apple' },
    { label: 'Banana', value: 'banana' },
    { label: 'Cherry', value: 'cherry', disabled: true },
    { label: 'Grape', value: 'grape' }
];

// ---------------------------------------------------------------------------
// Core state machine (framework-agnostic reducer)
// ---------------------------------------------------------------------------
describe('combobox machine', () => {
    const make = () => combobox.machine({ id: 'cb' });

    it('starts closed, empty, with nothing highlighted or selected', () => {
        const s = make().getState();
        expect(s).toEqual({ open: false, value: null, inputValue: '', highlightedValue: null, disabled: false });
    });

    it('OPEN / CLOSE toggle the open flag and CLOSE drops the highlight', () => {
        const m = make();
        m.send({ type: 'OPEN' });
        expect(m.getState().open).toBe(true);
        m.send({ type: 'HIGHLIGHT', value: 'apple' });
        m.send({ type: 'CLOSE' });
        expect(m.getState().open).toBe(false);
        expect(m.getState().highlightedValue).toBe(null);
    });

    it('SET_INPUT updates the text, opens, and resets the highlight', () => {
        const m = make();
        m.send({ type: 'HIGHLIGHT', value: 'apple' });
        m.send({ type: 'SET_INPUT', value: 'ban' });
        expect(m.getState()).toMatchObject({ inputValue: 'ban', open: true, highlightedValue: null });
    });

    it('SELECT commits the value, mirrors the label into the input, and closes', () => {
        const m = make();
        m.send({ type: 'OPEN' });
        m.send({ type: 'SELECT', value: 'banana', label: 'Banana' });
        expect(m.getState()).toMatchObject({ value: 'banana', inputValue: 'Banana', open: false });
    });

    it('CLEAR resets value + input', () => {
        const m = make();
        m.send({ type: 'SELECT', value: 'banana', label: 'Banana' });
        m.send({ type: 'CLEAR' });
        expect(m.getState()).toMatchObject({ value: null, inputValue: '' });
    });

    it('SET_DISABLED closes the listbox when disabling', () => {
        const m = make();
        m.send({ type: 'OPEN' });
        m.send({ type: 'SET_DISABLED', disabled: true });
        expect(m.getState()).toMatchObject({ disabled: true, open: false });
    });

    it('returns the same reference for a no-op (skips notifications)', () => {
        const m = make();
        const before = m.getState();
        m.send({ type: 'CLOSE' }); // already closed
        expect(m.getState()).toBe(before);
    });
});

// ---------------------------------------------------------------------------
// Styled OriCombobox (behaviour + a11y through the real composable + DOM)
// ---------------------------------------------------------------------------
describe('OriCombobox', () => {
    const mountCb = (props = {}) => mount(OriCombobox, { props: { options: OPTIONS, label: 'Fruit', ...props } });

    it('renders a role=combobox input wired to a hidden listbox', () => {
        const wrapper = mountCb();
        const input = wrapper.find('input');

        expect(input.attributes('role')).toBe('combobox');
        expect(input.attributes('aria-expanded')).toBe('false');
        expect(input.attributes('aria-autocomplete')).toBe('list');

        const listbox = wrapper.find('[role="listbox"]');
        expect(listbox.exists()).toBe(true);
        expect(input.attributes('aria-controls')).toBe(listbox.attributes('id'));
        expect(listbox.attributes('hidden')).toBeDefined();

        // Retrofit: the listbox is placed by the shared .ori-anchored primitive, tethered to the control.
        expect(listbox.classes()).toContain('ori-anchored');
        expect(listbox.classes()).toContain('ori-anchored_bottom-start');
        const anchorVar = (listbox.element as HTMLElement).style.getPropertyValue('--ori-anchor');
        expect(anchorVar).toMatch(/^--ori-combobox-/);
        const control = wrapper.find('.ori-combobox__control').element as HTMLElement;
        expect((control.style as unknown as Record<string, string>).anchorName).toBe(anchorVar);
    });

    it('associates the built-in label with the input via for/id', () => {
        const wrapper = mountCb();
        const label = wrapper.find('label.ori-combobox__label');
        const inputId = wrapper.find('input').attributes('id');

        expect(label.text()).toContain('Fruit');
        expect(label.attributes('for')).toBe(inputId);
    });

    it('renders a #label slot (prop as fallback) and still labels the listbox', () => {
        const wrapper = mount(OriCombobox, {
            props: { options: OPTIONS },
            slots: { label: '<b class="rich-label">Fruit</b>' }
        });
        const label = wrapper.find('label.ori-combobox__label');
        const listbox = wrapper.find('[role="listbox"]');

        expect(label.find('.rich-label').exists()).toBe(true);
        expect(label.attributes('for')).toBe(wrapper.find('input').attributes('id'));
        // the listbox stays labelled by the (slotted) label
        expect(listbox.attributes('aria-labelledby')).toBe(label.attributes('id'));
    });

    it('renders all options with role=option (disabled marked)', () => {
        const wrapper = mountCb();
        const opts = wrapper.findAll('[role="option"]');

        expect(opts).toHaveLength(4);
        expect(opts[0].text()).toBe('Apple');
        expect(opts[2].attributes('aria-disabled')).toBe('true');
    });

    it('typing filters the options and opens the listbox', async () => {
        const wrapper = mountCb();
        await wrapper.find('input').setValue('ap');

        expect(wrapper.find('input').attributes('aria-expanded')).toBe('true');
        const opts = wrapper.findAll('[role="option"]');
        // "ap" matches Apple and grAPe (substring), not Banana / Cherry
        expect(opts.map((o) => o.text())).toEqual(['Apple', 'Grape']);
    });

    it('shows the no-results text when nothing matches', async () => {
        const wrapper = mountCb({ noResultsText: 'Nope' });
        await wrapper.find('input').setValue('zzz');

        expect(wrapper.findAll('[role="option"]')).toHaveLength(0);
        expect(wrapper.find('.ori-combobox__empty').text()).toBe('Nope');
    });

    it('ArrowDown opens + highlights, Enter selects, emitting v-model', async () => {
        const wrapper = mountCb();
        const input = wrapper.find('input');

        await input.trigger('keydown', { key: 'ArrowDown' });
        expect(input.attributes('aria-expanded')).toBe('true');
        // first enabled option highlighted, reflected on aria-activedescendant
        const active = input.attributes('aria-activedescendant');
        expect(active).toBeTruthy();
        expect(wrapper.find(`#${active}`).text()).toBe('Apple');

        await input.trigger('keydown', { key: 'Enter' });
        expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual(['apple']);
        expect((input.element as HTMLInputElement).value).toBe('Apple');
        expect(input.attributes('aria-expanded')).toBe('false');
    });

    it('ArrowDown skips a disabled option during navigation', async () => {
        const wrapper = mountCb();
        const input = wrapper.find('input');

        await input.trigger('keydown', { key: 'ArrowDown' }); // Apple
        await input.trigger('keydown', { key: 'ArrowDown' }); // Banana
        await input.trigger('keydown', { key: 'ArrowDown' }); // Grape (skips disabled Cherry)
        const active = input.attributes('aria-activedescendant');
        expect(wrapper.find(`#${active}`).text()).toBe('Grape');
    });

    it('clicking an option selects it, fills the input, and closes', async () => {
        const wrapper = mountCb();
        await wrapper.find('input').trigger('keydown', { key: 'ArrowDown' }); // open
        await wrapper.findAll('[role="option"]')[1].trigger('click'); // Banana

        expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual(['banana']);
        expect((wrapper.find('input').element as HTMLInputElement).value).toBe('Banana');
        expect(wrapper.find('[role="listbox"]').attributes('hidden')).toBeDefined();
    });

    it('Escape closes an open listbox', async () => {
        const wrapper = mountCb();
        const input = wrapper.find('input');
        await input.trigger('keydown', { key: 'ArrowDown' });
        expect(input.attributes('aria-expanded')).toBe('true');
        await input.trigger('keydown', { key: 'Escape' });
        expect(input.attributes('aria-expanded')).toBe('false');
    });

    it('the selected option carries aria-selected=true', async () => {
        const wrapper = mountCb({ modelValue: 'banana' });
        const selected = wrapper.findAll('[role="option"]').find((o) => o.text() === 'Banana');

        expect(selected?.attributes('aria-selected')).toBe('true');
    });

    it('clearable clears the selection', async () => {
        const wrapper = mountCb({ modelValue: 'banana', clearable: true });
        expect((wrapper.find('input').element as HTMLInputElement).value).toBe('Banana');

        await wrapper.find('.ori-combobox__clear').trigger('click');
        expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([null]);
    });

    it('Escape clears the selection for keyboard users when the listbox is closed (clearable)', async () => {
        const wrapper = mountCb({ modelValue: 'banana', clearable: true });
        const input = wrapper.find('input[role="combobox"]');

        // listbox is closed on mount; the clear button is tabindex=-1, so Escape is the keyboard path
        expect(input.attributes('aria-expanded')).toBe('false');
        await input.trigger('keydown', { key: 'Escape' });
        expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([null]);
    });

    it('Escape only closes the open listbox — it does not clear', async () => {
        const wrapper = mountCb({ modelValue: 'banana', clearable: true });
        const input = wrapper.find('input[role="combobox"]');

        await input.trigger('keydown', { key: 'ArrowDown' }); // open
        expect(input.attributes('aria-expanded')).toBe('true');
        await input.trigger('keydown', { key: 'Escape' }); // closes only
        expect(input.attributes('aria-expanded')).toBe('false');
        expect(wrapper.emitted('update:modelValue')).toBeFalsy();
    });

    it('Escape does not clear when there is no selection', async () => {
        const wrapper = mountCb({ clearable: true });
        await wrapper.find('input[role="combobox"]').trigger('keydown', { key: 'Escape' });
        expect(wrapper.emitted('update:modelValue')).toBeFalsy();
    });

    it('disabled sets the real disabled attribute and blocks the trigger', () => {
        const wrapper = mountCb({ disabled: true });

        expect((wrapper.find('input').element as HTMLInputElement).disabled).toBe(true);
        expect((wrapper.find('.ori-combobox__trigger').element as HTMLButtonElement).disabled).toBe(true);
    });

    it('submits the selected VALUE (not the label) via a hidden input under `name`', () => {
        const wrapper = mountCb({ name: 'fruit', modelValue: 'banana' });

        const hidden = wrapper.find('input[type="hidden"]');
        expect(hidden.exists()).toBe(true);
        expect(hidden.attributes('name')).toBe('fruit');
        expect((hidden.element as HTMLInputElement).value).toBe('banana');

        // the visible combobox input shows the label and must NOT carry the form name (else it would
        // submit the label text under the same field)
        const visible = wrapper.find('input[role="combobox"]');
        expect((visible.element as HTMLInputElement).value).toBe('Banana');
        expect(visible.attributes('name')).toBeUndefined();
    });

    it('emits an empty hidden value while nothing is selected', () => {
        const wrapper = mountCb({ name: 'fruit' });
        expect((wrapper.find('input[type="hidden"]').element as HTMLInputElement).value).toBe('');
    });

    it('renders no hidden input when `name` is omitted', () => {
        const wrapper = mountCb({ modelValue: 'banana' });
        expect(wrapper.find('input[type="hidden"]').exists()).toBe(false);
    });

    it('a disabled combobox is excluded from submission (hidden input disabled)', () => {
        const wrapper = mountCb({ name: 'fruit', modelValue: 'banana', disabled: true });
        expect((wrapper.find('input[type="hidden"]').element as HTMLInputElement).disabled).toBe(true);
    });

    it('hint wires aria-describedby; error flips aria-invalid + role=alert', async () => {
        const hintW = mountCb({ hint: 'Pick a fruit' });
        const hint = hintW.find('.ori-combobox__hint');
        expect(hintW.find('input').attributes('aria-describedby')).toBe(hint.attributes('id'));

        const errW = mountCb({ hint: 'Pick a fruit', error: 'Required' });
        const err = errW.find('.ori-combobox__error');
        expect(err.attributes('role')).toBe('alert');
        expect(errW.find('input').attributes('aria-invalid')).toBe('true');
        expect(errW.find('input').attributes('aria-describedby')).toBe(err.attributes('id'));
        expect(errW.find('.ori-combobox__hint').exists()).toBe(false);
    });

    it('required renders the asterisk + aria-required and guards the SELECTION (not the typed text)', async () => {
        const wrapper = mountCb({ required: true });
        await wrapper.vm.$nextTick();
        const input = wrapper.find('input[role="combobox"]');
        const el = input.element as HTMLInputElement;

        expect(wrapper.find('.ori-combobox__required').exists()).toBe(true);
        expect(input.attributes('aria-required')).toBe('true');
        // native `required` is NOT set on the visible input (it would validate the label text, not the
        // selection); validity is driven by whether a value is committed
        expect(el.required).toBe(false);
        expect(el.validity.valid).toBe(false);
        expect(el.validationMessage).toBeTruthy();

        // typing a non-matching query must NOT satisfy required (no value is committed)
        await input.setValue('zzz');
        await wrapper.vm.$nextTick();
        expect(el.validity.valid).toBe(false);

        // committing a real selection clears the custom validity
        await wrapper.setProps({ modelValue: 'apple' });
        await wrapper.vm.$nextTick();
        expect(el.validity.valid).toBe(true);
    });

    it('associates both the value (hidden) and validation (visible) inputs with an out-of-tree form', () => {
        const wrapper = mountCb({ name: 'fruit', form: 'checkout', required: true });

        expect(wrapper.find('input[type="hidden"]').attributes('form')).toBe('checkout');
        expect(wrapper.find('input[role="combobox"]').attributes('form')).toBe('checkout');
    });

    it('maps color / size / radius to classes', () => {
        const wrapper = mountCb({ color: 'danger', size: 'lg', radius: 'sm' });

        expect(wrapper.classes()).toContain('ori-color_danger');
        expect(wrapper.classes()).toContain('ori-font-size_lg');
        expect(wrapper.classes()).toContain('ori-combobox_lg');
        expect(wrapper.find('input').classes()).toContain('ori-size-radius_sm');
    });

    it('chains a caller @input listener with the headless handler (still filters)', async () => {
        const onInput = vi.fn();
        const wrapper = mount(OriCombobox, {
            props: { options: OPTIONS, label: 'Fruit' },
            attrs: { onInput }
        });

        await wrapper.find('input').setValue('ap');

        // mergeProps chained the caller's listener onto the headless one rather than dropping it
        expect(onInput).toHaveBeenCalled();
        // and the headless filter/open behaviour still runs
        expect(wrapper.find('input').attributes('aria-expanded')).toBe('true');
        expect(wrapper.findAll('[role="option"]').map((o) => o.text())).toEqual(['Apple', 'Grape']);
    });

    it('#option scoped slot renders custom content with item + selected', () => {
        const wrapper = mount(OriCombobox, {
            props: { options: OPTIONS, label: 'Fruit', modelValue: 'banana' },
            slots: {
                option: (props: { item: { label: string }; selected: boolean }) =>
                    h('span', { class: 'custom-option' }, `${props.item.label}:${props.selected}`)
            }
        });

        const opts = wrapper.findAll('.custom-option');
        expect(opts).toHaveLength(4);
        expect(opts[0].text()).toBe('Apple:false');
        // the selected option receives selected=true through the slot scope
        expect(opts.find((o) => o.text().startsWith('Banana'))?.text()).toBe('Banana:true');
    });

    it('falls back to the plain label when no #option slot is given', () => {
        const wrapper = mountCb();
        const opts = wrapper.findAll('[role="option"]');

        expect(opts[0].text()).toBe('Apple');
        expect(wrapper.find('.custom-option').exists()).toBe(false);
    });

    it('has no axe violations (labelled, with a hint)', async () => {
        const wrapper = mount(OriCombobox, {
            props: { options: OPTIONS, label: 'Fruit', hint: 'Pick a fruit' },
            attachTo: document.body
        });
        await expectNoA11yViolations(wrapper.element);
        wrapper.unmount();
    });
});
