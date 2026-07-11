import { describe, it, expect, afterEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { OriColorPicker } from '../packages/vue/src';
import { expectNoA11yViolations } from './helpers/axe';

afterEach(() => {
    document.body.innerHTML = '';
    delete (window as unknown as { EyeDropper?: unknown }).EyeDropper;
});

const area = (w: ReturnType<typeof mount>) => w.find('.ori-color-picker__area');
const channels = (w: ReturnType<typeof mount>) => w.findAll('.ori-color-picker__channel');
const hueInput = (w: ReturnType<typeof mount>) => w.find('input.ori-slider_hue');
const hexInput = (w: ReturnType<typeof mount>) => w.find('input.ori-color-picker__hex');
const swatch = (w: ReturnType<typeof mount>) => w.find('.ori-color-picker__swatch');
const last = (events: unknown[][] | undefined): unknown => events?.at(-1)?.[0];
const press = (el: Element, key: string): boolean =>
    el.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }));

describe('OriColorPicker — structure & model', () => {
    it('renders the area (2 hidden range channels), a hue slider, a hex field, and a labelled group', () => {
        const wrapper = mount(OriColorPicker, { props: { modelValue: '#3366ff', label: 'Stroke color' } });

        expect(wrapper.attributes('role')).toBe('group');
        expect(wrapper.attributes('aria-label')).toBe('Stroke color');
        expect(area(wrapper).exists()).toBe(true);
        expect(channels(wrapper)).toHaveLength(2);
        expect(channels(wrapper)[0].attributes('type')).toBe('range');
        expect(channels(wrapper)[0].attributes('aria-label')).toBe('Saturation');
        expect(channels(wrapper)[1].attributes('aria-label')).toBe('Brightness');
        expect(hueInput(wrapper).exists()).toBe(true);
        expect(hexInput(wrapper).exists()).toBe(true);
    });

    it('seeds the swatch + hex field from the v-model color (round-tripped lowercase hex)', () => {
        const wrapper = mount(OriColorPicker, { props: { modelValue: '#3366FF' } });

        expect((hexInput(wrapper).element as HTMLInputElement).value).toBe('#3366ff');
        expect(swatch(wrapper).attributes('style')).toContain('#3366ff');
        expect(swatch(wrapper).attributes('aria-label')).toBe('#3366ff');
    });

    it('sets --ori-hue on the area from the current hue', () => {
        const wrapper = mount(OriColorPicker, { props: { modelValue: '#ff0000' } });
        // pure red → hue 0 → --ori-hue is the fully-saturated hue color (#ff0000)
        expect(area(wrapper).attributes('style')).toContain('--ori-hue: #ff0000');
    });
});

describe('OriColorPicker — area keyboard (each hidden range owns one axis)', () => {
    it('ArrowRight on the saturation channel raises saturation and emits live + committed color', async () => {
        const wrapper = mount(OriColorPicker, { props: { modelValue: '#808080' } });

        press(channels(wrapper)[0].element, 'ArrowRight');
        await wrapper.vm.$nextTick();

        // update:modelValue streams live; change commits (one undo entry) — both carry the new color.
        expect(wrapper.emitted('update:modelValue')).toBeTruthy();
        expect(wrapper.emitted('change')).toBeTruthy();
        expect(last(wrapper.emitted('update:modelValue'))).not.toBe('#808080');
        expect(last(wrapper.emitted('change'))).toBe(last(wrapper.emitted('update:modelValue')));
    });

    it('ArrowUp on the brightness channel raises brightness and emits', async () => {
        const wrapper = mount(OriColorPicker, { props: { modelValue: '#808080' } });

        press(channels(wrapper)[1].element, 'ArrowUp');
        await wrapper.vm.$nextTick();

        expect(wrapper.emitted('update:modelValue')).toBeTruthy();
        expect(last(wrapper.emitted('update:modelValue'))).not.toBe('#808080');
    });

    it('the vertical (brightness) arrows are inert on the saturation channel — each range owns one axis', async () => {
        const wrapper = mount(OriColorPicker, { props: { modelValue: '#808080' } });

        // ArrowUp/Down belong to the brightness slider; on the saturation slider our handler ignores them
        // (and does not preventDefault), so the picker emits nothing from the custom keyboard path.
        press(channels(wrapper)[0].element, 'ArrowUp');
        press(channels(wrapper)[0].element, 'PageUp');
        await wrapper.vm.$nextTick();

        expect(wrapper.emitted('update:modelValue')).toBeFalsy();
    });

    it('marks the brightness channel aria-orientation=vertical and announces the resulting color', () => {
        const wrapper = mount(OriColorPicker, { props: { modelValue: '#3366ff' } });

        expect(channels(wrapper)[0].attributes('aria-orientation')).toBeUndefined(); // saturation: horizontal
        expect(channels(wrapper)[1].attributes('aria-orientation')).toBe('vertical');
        // aria-valuetext carries the axis % plus the settled hex (so the colour is spoken, not just "40%")
        expect(channels(wrapper)[0].attributes('aria-valuetext')).toMatch(/%,\s*#[0-9a-f]{6}/);
    });

    it('a non-navigation key emits nothing', async () => {
        const wrapper = mount(OriColorPicker, { props: { modelValue: '#808080' } });
        press(channels(wrapper)[0].element, 'a');
        await wrapper.vm.$nextTick();

        expect(wrapper.emitted('update:modelValue')).toBeFalsy();
    });
});

describe('OriColorPicker — hue slider', () => {
    it('moving the hue slider recolors and emits', async () => {
        const wrapper = mount(OriColorPicker, { props: { modelValue: '#ff0000' } });
        const hue = hueInput(wrapper);

        (hue.element as HTMLInputElement).value = '120';
        await hue.trigger('input'); // OriSlider → update:modelValue → cp.setHue
        await hue.trigger('change'); // commit

        expect(wrapper.emitted('update:modelValue')).toBeTruthy();
        // hue 120 at full sat/val → green
        expect(last(wrapper.emitted('update:modelValue'))).toBe('#00ff00');
        expect(wrapper.emitted('change')).toBeTruthy();
    });

    it('caps the hue slider at 359 so dragging to the end does not wrap the thumb back to 0', () => {
        const wrapper = mount(OriColorPicker, { props: { modelValue: '#ff0000' } });
        expect(hueInput(wrapper).attributes('max')).toBe('359');
    });
});

describe('OriColorPicker — hex field', () => {
    it('committing a valid hex on blur updates the model (live + change) and clears invalid', async () => {
        const wrapper = mount(OriColorPicker, { props: { modelValue: '#000000' } });
        const hex = hexInput(wrapper);

        await hex.setValue('#12abef');
        await hex.trigger('blur');

        expect(last(wrapper.emitted('update:modelValue'))).toBe('#12abef');
        expect(last(wrapper.emitted('change'))).toBe('#12abef');
        expect(hex.attributes('aria-invalid')).toBeUndefined();
    });

    it('an invalid hex flips aria-invalid and does not emit', async () => {
        const wrapper = mount(OriColorPicker, { props: { modelValue: '#000000' } });
        const hex = hexInput(wrapper);

        await hex.setValue('nope');
        await hex.trigger('blur');

        expect(hex.attributes('aria-invalid')).toBe('true');
        // the reason is announced (role=alert), not just a silent aria-invalid flip
        expect(wrapper.find('.ori-input__error').exists()).toBe(true);
        expect(wrapper.find('.ori-input__error').text().toLowerCase()).toContain('valid hex');
        expect(wrapper.emitted('change')).toBeFalsy();
    });
});

describe('OriColorPicker — presets', () => {
    const presets = ['#ff0000', '#00ff00', '#0000ff'];

    it('renders a single-select roving listbox and marks the current color selected', () => {
        const wrapper = mount(OriColorPicker, { props: { modelValue: '#00ff00', presets } });
        const group = wrapper.find('.ori-color-picker__presets');
        const chips = wrapper.findAll('.ori-color-picker__preset');

        expect(group.attributes('role')).toBe('listbox');
        expect(chips).toHaveLength(3);
        expect(chips.every((c) => c.attributes('role') === 'option')).toBe(true);
        // exactly one roving tab stop — and it sits on the SELECTED swatch (APG), not index 0
        expect(chips.filter((c) => c.attributes('tabindex') === '0')).toHaveLength(1);
        expect(chips[1].attributes('tabindex')).toBe('0');
        expect(chips[0].attributes('tabindex')).toBe('-1');
        // the green preset matches the current color
        expect(chips[1].attributes('aria-selected')).toBe('true');
        expect(chips[0].attributes('aria-selected')).toBe('false');
    });

    it('clicking a preset commits that color', async () => {
        const wrapper = mount(OriColorPicker, { props: { modelValue: '#000000', presets } });
        await wrapper.findAll('.ori-color-picker__preset')[2].trigger('click');

        expect(last(wrapper.emitted('update:modelValue'))).toBe('#0000ff');
        expect(last(wrapper.emitted('change'))).toBe('#0000ff');
    });

    it('ArrowRight moves the roving tab stop across presets', async () => {
        const wrapper = mount(OriColorPicker, { props: { modelValue: '#000000', presets }, attachTo: document.body });
        const group = wrapper.find('.ori-color-picker__presets');
        const chips = wrapper.findAll('.ori-color-picker__preset');

        (chips[0].element as HTMLElement).focus();
        await group.trigger('keydown', { key: 'ArrowRight' });

        expect(chips[1].attributes('tabindex')).toBe('0');
        expect(chips[0].attributes('tabindex')).toBe('-1');
        wrapper.unmount();
    });
});

describe('OriColorPicker — alpha channel', () => {
    const alphaSlider = (w: ReturnType<typeof mount>) => w.find('input.ori-slider_alpha');

    it('adds an alpha slider only when `alpha` is set', () => {
        expect(alphaSlider(mount(OriColorPicker, { props: { modelValue: '#3366ff' } })).exists()).toBe(false);
        expect(alphaSlider(mount(OriColorPicker, { props: { modelValue: '#3366ff', alpha: true } })).exists()).toBe(
            true
        );
    });

    it('seeds alpha from an 8-digit hex and shows #rrggbbaa in the field', () => {
        const wrapper = mount(OriColorPicker, { props: { modelValue: '#3366ff80', alpha: true } });

        expect((hexInput(wrapper).element as HTMLInputElement).value).toBe('#3366ff80');
        expect((alphaSlider(wrapper).element as HTMLInputElement).value).toBe('50'); // 0x80 ≈ 50%
        expect(swatch(wrapper).classes()).toContain('ori-color-picker__swatch_alpha');
    });

    it('moving the alpha slider re-emits an #rrggbbaa string with the new alpha', async () => {
        const wrapper = mount(OriColorPicker, { props: { modelValue: '#3366ff', alpha: true } });
        const a = alphaSlider(wrapper);

        (a.element as HTMLInputElement).value = '25';
        await a.trigger('input');
        await a.trigger('change');

        expect(last(wrapper.emitted('update:modelValue'))).toBe('#3366ff40'); // 25% ≈ 0x40
        expect(wrapper.emitted('change')).toBeTruthy();
    });

    it('with alpha off, output stays #rrggbb even from an 8-digit input', () => {
        const wrapper = mount(OriColorPicker, { props: { modelValue: '#3366ff80' } });
        expect((hexInput(wrapper).element as HTMLInputElement).value).toBe('#3366ff');
    });
});

describe('OriColorPicker — controlled re-sync', () => {
    it('reflects an external modelValue change after mount', async () => {
        const wrapper = mount(OriColorPicker, { props: { modelValue: '#000000' } });

        await wrapper.setProps({ modelValue: '#12abef' });

        expect((hexInput(wrapper).element as HTMLInputElement).value).toBe('#12abef');
        expect(swatch(wrapper).attributes('style')).toContain('#12abef');
    });

    it('with alpha on, echoing the emitted value straight back keeps the working color (no snap-back)', async () => {
        // A controlled v-model parent feeds each live emit back as the prop. The echo-guard must format
        // WITH alpha, or it would treat the alpha-carrying echo as a fresh external value and re-parse.
        const wrapper = mount(OriColorPicker, { props: { modelValue: '#3366ff80', alpha: true } });

        press(channels(wrapper)[0].element, 'ArrowRight'); // nudge saturation
        await wrapper.vm.$nextTick();
        const emitted = last(wrapper.emitted('update:modelValue')) as string;
        expect(emitted).toMatch(/^#[0-9a-f]{8}$/); // carries alpha
        expect(emitted).not.toBe('#3366ff80');

        await wrapper.setProps({ modelValue: emitted }); // parent echoes it back
        await wrapper.vm.$nextTick();

        // the field shows exactly the echoed value — the guard recognised its own emit and left hsva alone
        expect((hexInput(wrapper).element as HTMLInputElement).value).toBe(emitted);
    });
});

describe('OriColorPicker — eyedropper', () => {
    const eyedropperBtn = (w: ReturnType<typeof mount>) => w.find('.ori-color-picker__eyedropper');

    it('is hidden when the browser has no EyeDropper (never a dead button)', () => {
        const wrapper = mount(OriColorPicker, { props: { modelValue: '#000000', eyedropper: true } });
        expect(eyedropperBtn(wrapper).exists()).toBe(false);
    });

    it('shows and picks a color when the EyeDropper API is present', async () => {
        (window as unknown as { EyeDropper: unknown }).EyeDropper = class {
            open() {
                return Promise.resolve({ sRGBHex: '#12abef' });
            }
        };
        const wrapper = mount(OriColorPicker, { props: { modelValue: '#000000', eyedropper: true } });
        await wrapper.vm.$nextTick(); // support is detected in onMounted (SSR-safe), so the trigger renders post-mount
        const btn = eyedropperBtn(wrapper);

        expect(btn.exists()).toBe(true);
        await btn.trigger('click');
        await flushPromises();

        expect(last(wrapper.emitted('update:modelValue'))).toBe('#12abef');
        expect(last(wrapper.emitted('change'))).toBe('#12abef');
    });
});

describe('OriColorPicker — form submission', () => {
    const hidden = (w: ReturnType<typeof mount>) => w.find('input[type="hidden"]');

    it('submits the current color via a hidden input under `name`', () => {
        const wrapper = mount(OriColorPicker, { props: { modelValue: '#3366ff', name: 'stroke' } });

        expect(hidden(wrapper).exists()).toBe(true);
        expect(hidden(wrapper).attributes('name')).toBe('stroke');
        expect((hidden(wrapper).element as HTMLInputElement).value).toBe('#3366ff');
    });

    it('always carries a value — a color control has no empty state (unlike Combobox)', () => {
        // No v-model: the combobox would submit '' here, but a color picker mirrors a native
        // <input type=color> and submits its current (default black) color.
        const wrapper = mount(OriColorPicker, { props: { name: 'stroke' } });
        expect((hidden(wrapper).element as HTMLInputElement).value).toBe('#000000');
    });

    it('submits in the emitted format (rgb/hsl), not always hex', () => {
        const rgb = mount(OriColorPicker, { props: { modelValue: '#3366ff', name: 'c', format: 'rgb' } });
        expect((hidden(rgb).element as HTMLInputElement).value).toBe('rgb(51, 102, 255)');

        const withAlpha = mount(OriColorPicker, { props: { modelValue: '#3366ff80', name: 'c', alpha: true } });
        expect((hidden(withAlpha).element as HTMLInputElement).value).toBe('#3366ff80');
    });

    it('the hidden value tracks a live edit (hex commit)', async () => {
        const wrapper = mount(OriColorPicker, { props: { modelValue: '#000000', name: 'c' } });

        await hexInput(wrapper).setValue('#12abef');
        await hexInput(wrapper).trigger('blur');

        expect((hidden(wrapper).element as HTMLInputElement).value).toBe('#12abef');
    });

    it('renders no hidden input when `name` is omitted', () => {
        expect(hidden(mount(OriColorPicker, { props: { modelValue: '#3366ff' } })).exists()).toBe(false);
    });

    it('a disabled picker is excluded from submission (hidden input disabled)', () => {
        const wrapper = mount(OriColorPicker, { props: { modelValue: '#3366ff', name: 'stroke', disabled: true } });
        expect((hidden(wrapper).element as HTMLInputElement).disabled).toBe(true);
    });

    it('associates the hidden input with an out-of-tree form by id', () => {
        const wrapper = mount(OriColorPicker, { props: { modelValue: '#3366ff', name: 'stroke', form: 'checkout' } });
        expect(hidden(wrapper).attributes('form')).toBe('checkout');
    });

    it('a real <form> serializes the current color under the field name', () => {
        const formEl = document.createElement('form');
        document.body.appendChild(formEl);
        const wrapper = mount(OriColorPicker, { props: { modelValue: '#3366ff', name: 'stroke' }, attachTo: formEl });

        expect(new FormData(formEl).get('stroke')).toBe('#3366ff');

        wrapper.unmount();
        formEl.remove();
    });
});

describe('OriColorPicker — disabled & axe', () => {
    it('disabled marks the group and disables the channels + hex', () => {
        const wrapper = mount(OriColorPicker, { props: { modelValue: '#3366ff', disabled: true } });

        expect(wrapper.attributes('data-disabled')).toBe('');
        expect((channels(wrapper)[0].element as HTMLInputElement).disabled).toBe(true);
        expect((hexInput(wrapper).element as HTMLInputElement).disabled).toBe(true);
    });

    it('disabled makes presets inert to keyboard AND mouse (real `disabled`, guarded handlers)', async () => {
        const wrapper = mount(OriColorPicker, {
            props: { modelValue: '#000000', disabled: true, presets: ['#ff0000', '#00ff00'] }
        });
        const chips = wrapper.findAll('.ori-color-picker__preset');
        // pointer-events:none only blocks the mouse — the real fix is a native `disabled` on each chip.
        expect((chips[0].element as HTMLButtonElement).disabled).toBe(true);

        await chips[0].trigger('click');
        press(wrapper.find('.ori-color-picker__presets').element, 'ArrowRight');
        await wrapper.vm.$nextTick();

        expect(wrapper.emitted('update:modelValue')).toBeFalsy();
        expect(wrapper.emitted('change')).toBeFalsy();
    });

    it('has no axe violations (labelled, with presets)', async () => {
        const wrapper = mount(OriColorPicker, {
            props: { modelValue: '#3366ff', label: 'Stroke color', presets: ['#ff0000', '#00ff00'] },
            attachTo: document.body
        });
        await expectNoA11yViolations(wrapper.element);
        wrapper.unmount();
    });
});
