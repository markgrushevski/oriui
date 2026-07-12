import { describe, it, expect, afterEach } from 'vitest';
import { get, writable } from 'svelte/store';
import { useColorPicker, type UseColorPickerOptions } from '@oriui/headless/svelte';

// The Svelte `useColorPicker` is the store twin of the Vue one, over the shared core/color-picker engine.
// Exercised without a component: `get(store)` reads current state, handlers are invoked directly, and a
// `writable` options store drives reactivity (incl. the echo-guard). Mirrors tests/color-picker.test.ts.

afterEach(() => {
    document.body.innerHTML = '';
    delete (window as unknown as { EyeDropper?: unknown }).EyeDropper;
});

function pick(o: Partial<UseColorPickerOptions> & { value: string | undefined }) {
    const inputs: string[] = [];
    const changes: string[] = [];
    const opts = writable<UseColorPickerOptions>({
        value: o.value,
        format: o.format,
        alpha: o.alpha,
        eyedropper: o.eyedropper,
        disabled: o.disabled,
        presets: o.presets,
        onInput: (v) => inputs.push(v),
        onChange: (v) => changes.push(v)
    });
    return { cp: useColorPicker(opts), opts, inputs, changes };
}

const asFn = (v: unknown) => v as (event: Event) => void;

describe('useColorPicker (Svelte) — state', () => {
    it('seeds hex / value / swatch from the color', () => {
        const { cp } = pick({ value: '#3366ff' });
        expect(get(cp.hex)).toBe('#3366ff');
        expect(get(cp.value)).toBe('#3366ff');
        expect(get(cp.swatchColor)).toBe('#3366ff');
    });

    it('value honours the emitted format', () => {
        expect(get(pick({ value: '#3366ff', format: 'rgb' }).cp.value)).toBe('rgb(51, 102, 255)');
    });

    it('setHue recolors and streams input', () => {
        const { cp, inputs } = pick({ value: '#ff0000' });
        cp.setHue(120);
        expect(get(cp.value)).toBe('#00ff00');
        expect(inputs.at(-1)).toBe('#00ff00');
    });

    it('setColor applies a valid hex (input + change) and rejects an invalid one', () => {
        const { cp, inputs, changes } = pick({ value: '#000000' });
        expect(cp.setColor('#12abef')).toBe(true);
        expect(get(cp.hex)).toBe('#12abef');
        expect(inputs.at(-1)).toBe('#12abef');
        expect(changes.at(-1)).toBe('#12abef');
        expect(cp.setColor('nope')).toBe(false);
    });

    it('alpha: seeds from an 8-digit hex and re-emits #rrggbbaa on setAlpha', () => {
        const { cp } = pick({ value: '#3366ff80', alpha: true });
        expect(get(cp.hex)).toBe('#3366ff80');
        expect(Math.round(get(cp.alpha) * 100)).toBe(50);
        cp.setAlpha(0.25);
        expect(get(cp.value)).toBe('#3366ff40');
    });

    it('echoing the emitted value back keeps the working color (no snap-back)', () => {
        const opts = writable<UseColorPickerOptions>({
            value: '#3366ff80',
            alpha: true,
            onInput: (v) => opts.update((o) => ({ ...o, value: v })), // controlled parent echoes the emit back
            onChange: () => {}
        });
        const cp = useColorPicker(opts);
        cp.setSaturationValue(0.5, 0.5);
        const emitted = get(cp.value);
        expect(emitted).toMatch(/^#[0-9a-f]{8}$/);
        expect(get(cp.hex)).toBe(emitted); // the guard recognised its own emit → no re-parse
    });

    it('a non-value option change (disabled) does NOT reset an uncontrolled drag', () => {
        // Uncontrolled: `value` stays constant while the user drags (hsva drifts). A later change to a
        // non-value option must not re-run the echo-guard and snap the color back — the guard watches
        // `value` only (like the Vue watch), not the whole options object.
        const opts = writable<UseColorPickerOptions>({
            value: '#3366ff',
            disabled: false,
            onInput: () => {},
            onChange: () => {}
        });
        const cp = useColorPicker(opts);

        cp.setSaturationValue(0.9, 0.1); // drift the working color
        const drifted = get(cp.value);
        expect(drifted).not.toBe('#3366ff');

        opts.update((o) => ({ ...o, disabled: true })); // a NON-value option change
        expect(get(cp.value)).toBe(drifted); // preserved, not reset to the initial value
    });
});

describe('useColorPicker (Svelte) — area + presets + prop bags', () => {
    it('channel onkeydown steps the owned axis and commits (once per key)', () => {
        const { cp, inputs, changes } = pick({ value: '#808080' });
        asFn(get(cp.getChannelInputProps)('saturation').onkeydown)(
            new KeyboardEvent('keydown', { key: 'ArrowRight', cancelable: true })
        );
        expect(inputs.length).toBeGreaterThan(0);
        expect(changes.length).toBeGreaterThan(0);
        expect(get(cp.value)).not.toBe('#808080');
    });

    it('getPresetProps marks the selected color + puts the single tab stop on it', () => {
        const presets = ['#ff0000', '#00ff00', '#0000ff'];
        const gp = get(pick({ value: '#00ff00', presets }).cp.getPresetProps);
        expect(gp('#00ff00', 1)['aria-selected']).toBe(true);
        expect(gp('#00ff00', 1).tabindex).toBe(0);
        expect(gp('#ff0000', 0)['aria-selected']).toBe(false);
        expect(gp('#ff0000', 0).tabindex).toBe(-1);
    });

    it('clicking a preset commits that color', () => {
        const presets = ['#ff0000', '#00ff00', '#0000ff'];
        const { cp, changes } = pick({ value: '#000000', presets });
        (get(cp.getPresetProps)('#0000ff', 2).onclick as () => void)();
        expect(changes.at(-1)).toBe('#0000ff');
    });

    it('onPresetKeydown moves the roving tab stop', () => {
        const presets = ['#ff0000', '#00ff00', '#0000ff'];
        const { cp } = pick({ value: '#000000', presets });
        const group = document.createElement('div');
        presets.forEach(() => {
            const b = document.createElement('button');
            b.setAttribute('data-ori-preset', '');
            group.appendChild(b);
        });
        document.body.appendChild(group);
        const ev = new KeyboardEvent('keydown', { key: 'ArrowRight', cancelable: true });
        Object.defineProperty(ev, 'currentTarget', { value: group });
        cp.onPresetKeydown(ev);
        expect(get(cp.getPresetProps)('#00ff00', 1).tabindex).toBe(0);
    });

    it('emits LOWERCASED handlers on every bag', () => {
        const { cp } = pick({ value: '#3366ff', presets: ['#ff0000'] });
        const area = get(cp.areaProps);
        expect(typeof area.onpointerdown).toBe('function');
        expect('onPointerdown' in area).toBe(false);
        const ch = get(cp.getChannelInputProps)('saturation');
        expect(typeof ch.onkeydown).toBe('function');
        expect(typeof ch.oninput).toBe('function');
        const preset = get(cp.getPresetProps)('#ff0000', 0);
        expect(typeof preset.onclick).toBe('function');
        expect(typeof preset.onfocus).toBe('function');
    });
});

describe('useColorPicker (Svelte) — disabled + eyedropper', () => {
    it('disabled marks the channel + presets and blocks the keyboard path', () => {
        const { cp, inputs } = pick({ value: '#3366ff', disabled: true, presets: ['#ff0000'] });
        expect(get(cp.getChannelInputProps)('saturation').disabled).toBe(true);
        expect(get(cp.getPresetProps)('#ff0000', 0).disabled).toBe(true);
        asFn(get(cp.getChannelInputProps)('saturation').onkeydown)(
            new KeyboardEvent('keydown', { key: 'ArrowRight', cancelable: true })
        );
        expect(inputs.length).toBe(0);
    });

    it('eyedropperSupported reflects the EyeDropper API (false without it)', () => {
        expect(get(pick({ value: '#000000', eyedropper: true }).cp.eyedropperSupported)).toBe(false);
        (window as unknown as { EyeDropper: unknown }).EyeDropper = class {
            open() {
                return Promise.resolve({ sRGBHex: '#12abef' });
            }
        };
        expect(get(pick({ value: '#000000', eyedropper: true }).cp.eyedropperSupported)).toBe(true);
    });
});
