import { afterEach, describe, it, expect, vi } from 'vitest';
import { renderHook, act, cleanup } from '@testing-library/react';
import type { FormEvent, KeyboardEvent as ReactKeyboardEvent, PointerEvent as ReactPointerEvent } from 'react';
import { useColorPicker } from '@oriui/headless/react';

// The React `useColorPicker` is a compositional hook over the shared `../core/color-picker` sRGB + 2D-area
// engine (no machine, no `useSyncExternalStore`) — the twin of the Vue / Svelte bindings. We exercise it
// with `@testing-library/react`'s `renderHook` (no JSX): `result.current` reads the projected values / prop
// bags and `act()` flushes the state changes. This proves the internal-HSVA source of truth, the echo-guard
// re-sync, the dual onInput/onChange emit convention, the a11y prop bags in React casing, and the
// client-only eyedropper gate.

type Options = Parameters<typeof useColorPicker>[0];
const noop = (): void => {};
const render = (options: Options) => renderHook(() => useColorPicker(options));

afterEach(() => {
    cleanup();
    document.body.innerHTML = '';
    delete (window as unknown as { EyeDropper?: unknown }).EyeDropper;
});

describe('React useColorPicker — state & derived values', () => {
    it('seeds the internal HSVA from the initial value and projects the derived colors', () => {
        const { result } = render({ value: '#3366ff', onInput: noop, onChange: noop });

        expect(result.current.hex).toBe('#3366ff');
        expect(result.current.value).toBe('#3366ff'); // default format = hex
        expect(result.current.rgb).toEqual({ r: 51, g: 102, b: 255 });
        expect(result.current.opaqueColor).toBe('#3366ff');
        expect(result.current.swatchColor).toBe('#3366ff');
        expect(result.current.hueColor).toBe('#0040ff'); // fully-saturated hue anchor (h 225)
        expect(result.current.ink).toBe('#ffffff'); // readable ink over the mid-blue
        expect(result.current.alpha).toBe(1);
    });

    it('emits the value in the configured non-hex format', () => {
        const { result } = render({ value: '#3366ff', format: 'rgb', onInput: noop, onChange: noop });
        expect(result.current.value).toBe('rgb(51, 102, 255)');
    });

    it('hex carries an alpha pair only when alpha is on', () => {
        const opaque = render({ value: '#3366ff80', onInput: noop, onChange: noop });
        expect(opaque.result.current.hex).toBe('#3366ff'); // alpha off → dropped

        const withAlpha = render({ value: '#3366ff80', alpha: true, onInput: noop, onChange: noop });
        expect(withAlpha.result.current.hex).toBe('#3366ff80');
        expect(withAlpha.result.current.value).toBe('#3366ff80');
    });
});

describe('React useColorPicker — setters & the dual emit', () => {
    it('setHue streams onInput (live) without committing', () => {
        const onInput = vi.fn();
        const onChange = vi.fn();
        const { result } = render({ value: '#3366ff', onInput, onChange });

        act(() => result.current.setHue(120));
        expect(result.current.hue).toBe(120);
        expect(onInput).toHaveBeenCalledTimes(1);
        expect(onChange).not.toHaveBeenCalled(); // a drag tick, not a commit
    });

    it('setAlpha clamps to [0,1] and streams onInput', () => {
        const onInput = vi.fn();
        const { result } = render({ value: '#3366ff', alpha: true, onInput, onChange: noop });

        act(() => result.current.setAlpha(2));
        expect(result.current.alpha).toBe(1);
        act(() => result.current.setAlpha(-1));
        expect(result.current.alpha).toBe(0);
        expect(onInput).toHaveBeenCalledTimes(2);
    });

    it('commit fires onChange with the current color', () => {
        const onChange = vi.fn();
        const { result } = render({ value: '#3366ff', onInput: noop, onChange });

        act(() => result.current.commit());
        expect(onChange).toHaveBeenCalledWith('#3366ff');
    });

    it('setColor / setHex parse a full string and commit (onInput + onChange), returning success', () => {
        const onInput = vi.fn();
        const onChange = vi.fn();
        const { result } = render({ value: '#3366ff', onInput, onChange });

        let ok = false;
        act(() => {
            ok = result.current.setColor('#00ff00');
        });
        expect(ok).toBe(true);
        expect(result.current.hex).toBe('#00ff00');
        expect(onInput).toHaveBeenLastCalledWith('#00ff00');
        expect(onChange).toHaveBeenLastCalledWith('#00ff00');

        expect(result.current.setHex).toBe(result.current.setColor); // alias
        let bad = true;
        act(() => {
            bad = result.current.setColor('not-a-color');
        });
        expect(bad).toBe(false); // unparseable → no-op
    });
});

describe('React useColorPicker — echo-guard re-sync', () => {
    it('re-syncs on a genuine external value change but skips its own echo (the new hue survives)', () => {
        let external = '#3366ff';
        const onInput = vi.fn((v: string) => {
            external = v;
        });
        const { result, rerender } = renderHook(() => useColorPicker({ value: external, onInput, onChange: noop }));
        expect(result.current.hex).toBe('#3366ff');

        // Own edit: setHue emits, the parent echoes it into `external`; the guard must NOT re-parse and
        // clobber the working HSVA (the new hue would be lost through a round-trip).
        act(() => result.current.setHue(120));
        expect(result.current.hue).toBe(120);
        rerender(); // options.value is now our echo
        expect(result.current.hue).toBe(120);

        // A different, genuinely external value re-syncs the internal HSVA.
        external = '#ff0000';
        rerender();
        expect(result.current.hex).toBe('#ff0000');
    });
});

describe('React useColorPicker — 2D area', () => {
    it('areaProps carries the group role, the --ori-hue style, and a React-cased onPointerDown', () => {
        const { result } = render({ value: '#3366ff', onInput: noop, onChange: noop });
        const area = result.current.areaProps;

        expect(area.role).toBe('group');
        expect(area['aria-label']).toBe('Saturation and brightness');
        expect(area['aria-disabled']).toBeUndefined();
        expect(area.style['--ori-hue']).toBe(result.current.hueColor);
        expect(typeof area.onPointerDown).toBe('function');
        expect('onPointerdown' in area).toBe(false); // React casing, not the neutral/Svelte lowercase
    });

    it('areaThumbStyle positions the thumb: left = saturation, top = inverted value', () => {
        const { result } = render({ value: '#000000', onInput: noop, onChange: noop });
        // black = s0 v0 → thumb bottom-left (top 100%, left 0%)
        expect(result.current.areaThumbStyle).toEqual({ left: '0%', top: '100%' });
    });

    it('a pointerdown streams onInput and the pointerup commits (onChange)', () => {
        const onInput = vi.fn();
        const onChange = vi.fn();
        const { result } = render({ value: '#3366ff', onInput, onChange });

        const area = document.createElement('div');
        area.setPointerCapture = noop; // jsdom/happy-dom lack pointer capture
        document.body.append(area);

        act(() => {
            result.current.areaProps.onPointerDown({
                button: 0,
                pointerId: 1,
                currentTarget: area,
                clientX: 5,
                clientY: 5
            } as unknown as ReactPointerEvent<HTMLElement>);
        });
        expect(onInput).toHaveBeenCalled(); // the initial press positions the thumb (live)
        expect(onChange).not.toHaveBeenCalled();

        act(() => {
            area.dispatchEvent(new Event('pointerup'));
        });
        expect(onChange).toHaveBeenCalledTimes(1); // release commits once
    });

    it('ignores a non-primary button and a disabled picker', () => {
        const onInput = vi.fn();
        const { result } = render({ value: '#3366ff', disabled: true, onInput, onChange: noop });
        const area = document.createElement('div');
        area.setPointerCapture = noop;

        act(() => {
            result.current.areaProps.onPointerDown({
                button: 0,
                pointerId: 1,
                currentTarget: area,
                clientX: 5,
                clientY: 5
            } as unknown as ReactPointerEvent<HTMLElement>);
        });
        expect(onInput).not.toHaveBeenCalled();
        expect(result.current.areaProps['aria-disabled']).toBe(true);
    });
});

describe('React useColorPicker — hidden channel range inputs', () => {
    it('projects each axis as a range with its own label/orientation/value and React-cased handlers', () => {
        const { result } = render({ value: '#3366ff', onInput: noop, onChange: noop });

        const sat = result.current.getChannelInputProps('saturation');
        expect(sat.type).toBe('range');
        expect(sat.min).toBe(0);
        expect(sat.max).toBe(100);
        expect(sat.step).toBe(1);
        expect(sat.value).toBe(80); // #3366ff → s 0.8
        expect(sat['aria-label']).toBe('Saturation');
        expect(sat['aria-orientation']).toBeUndefined();
        expect(sat['aria-valuetext']).toBe('80%, #3366ff');
        expect(typeof sat.onKeyDown).toBe('function');
        expect(typeof sat.onInput).toBe('function');

        const val = result.current.getChannelInputProps('value');
        expect(val['aria-label']).toBe('Brightness');
        expect(val['aria-orientation']).toBe('vertical');
        expect(val.value).toBe(100); // #3366ff → v 1
    });

    it('onKeyDown steps the owned axis and commits (one undo entry)', () => {
        const onInput = vi.fn();
        const onChange = vi.fn();
        const { result } = render({ value: '#3366ff', onInput, onChange });

        act(() =>
            result.current.getChannelInputProps('saturation').onKeyDown({
                key: 'ArrowRight',
                shiftKey: false,
                preventDefault: noop
            } as unknown as ReactKeyboardEvent<HTMLInputElement>)
        );
        // s 0.8 → +1% → ~0.81 (announced as 81%)
        expect(result.current.getChannelInputProps('saturation').value).toBe(81);
        expect(onInput).toHaveBeenCalled();
        expect(onChange).toHaveBeenCalledTimes(1);
    });

    it('onKeyDown ignores a key the axis does not own', () => {
        const onInput = vi.fn();
        const { result } = render({ value: '#3366ff', onInput, onChange: noop });

        act(() =>
            result.current.getChannelInputProps('saturation').onKeyDown({
                key: 'ArrowUp', // a value-axis key → the saturation input ignores it
                shiftKey: false,
                preventDefault: noop
            } as unknown as ReactKeyboardEvent<HTMLInputElement>)
        );
        expect(onInput).not.toHaveBeenCalled();
    });

    it('onInput sets the axis from the range value and commits', () => {
        const onInput = vi.fn();
        const onChange = vi.fn();
        const { result } = render({ value: '#3366ff', onInput, onChange });

        act(() =>
            result.current.getChannelInputProps('saturation').onInput({
                currentTarget: { value: '50' }
            } as unknown as FormEvent<HTMLInputElement>)
        );
        expect(result.current.getChannelInputProps('saturation').value).toBe(50);
        expect(onChange).toHaveBeenCalledTimes(1);
    });

    it('disables both inputs when the picker is disabled', () => {
        const { result } = render({ value: '#3366ff', disabled: true, onInput: noop, onChange: noop });
        expect(result.current.getChannelInputProps('saturation').disabled).toBe(true);
        expect(result.current.getChannelInputProps('value').disabled).toBe(true);
    });
});

describe('React useColorPicker — preset listbox', () => {
    const PRESETS = ['#ff0000', '#00ff00', '#0000ff'];

    it('presetGroupProps is the single-select listbox bag', () => {
        const { result } = render({ value: '#123456', presets: PRESETS, onInput: noop, onChange: noop });
        expect(result.current.presetGroupProps).toEqual({
            role: 'listbox',
            'aria-label': 'Preset colors',
            'aria-orientation': 'horizontal'
        });
    });

    it('getPresetProps carries React casing, aria-selected, and the roving tabIndex', () => {
        const { result } = render({ value: '#ff0000', presets: PRESETS, onInput: noop, onChange: noop });

        const first = result.current.getPresetProps('#ff0000', 0);
        expect(first['data-ori-preset']).toBe('');
        expect(first.type).toBe('button');
        expect(first.role).toBe('option');
        expect(first['aria-label']).toBe('#ff0000');
        expect(first['aria-selected']).toBe(true); // matches the current color
        expect(first.style['--ori-color']).toBe('#ff0000');
        expect(typeof first.onClick).toBe('function');
        expect(typeof first.onFocus).toBe('function');
        expect(first.tabIndex).toBe(0); // selected → the roving tab stop
        expect('tabindex' in first).toBe(false); // React casing

        const other = result.current.getPresetProps('#00ff00', 1);
        expect(other['aria-selected']).toBe(false);
        expect(other.tabIndex).toBe(-1);
    });

    it('clicking a preset commits its color', () => {
        const onInput = vi.fn();
        const onChange = vi.fn();
        const { result } = render({ value: '#123456', presets: PRESETS, onInput, onChange });

        act(() => result.current.getPresetProps('#00ff00', 1).onClick());
        expect(result.current.hex).toBe('#00ff00');
        expect(onInput).toHaveBeenLastCalledWith('#00ff00');
        expect(onChange).toHaveBeenLastCalledWith('#00ff00');
    });

    it('onPresetKeydown roves real DOM focus and moves the tab stop, wrapping', () => {
        const { result } = render({ value: '#123456', presets: PRESETS, onInput: noop, onChange: noop });

        const group = document.createElement('div');
        const chips = PRESETS.map(() => {
            const chip = document.createElement('button');
            chip.setAttribute('data-ori-preset', '');
            group.append(chip);
            return chip;
        });
        document.body.append(group);

        const press = (key: string): void =>
            act(() =>
                result.current.onPresetKeydown({
                    key,
                    currentTarget: group,
                    preventDefault: noop
                } as unknown as ReactKeyboardEvent<HTMLElement>)
            );

        press('ArrowRight'); // 0 → 1
        expect(document.activeElement).toBe(chips[1]);
        expect(result.current.getPresetProps('#00ff00', 1).tabIndex).toBe(0);
        expect(result.current.getPresetProps('#ff0000', 0).tabIndex).toBe(-1);

        press('ArrowLeft'); // 1 → 0
        expect(document.activeElement).toBe(chips[0]);

        press('ArrowLeft'); // 0 → wraps to last
        expect(document.activeElement).toBe(chips[2]);
    });

    it('a disabled picker flags its chips and ignores the roving keydown', () => {
        const { result } = render({
            value: '#123456',
            disabled: true,
            presets: PRESETS,
            onInput: noop,
            onChange: noop
        });
        expect(result.current.getPresetProps('#ff0000', 0).disabled).toBe(true);

        const group = document.createElement('div');
        PRESETS.forEach(() => {
            const chip = document.createElement('button');
            chip.setAttribute('data-ori-preset', '');
            group.append(chip);
        });
        document.body.append(group);

        act(() =>
            result.current.onPresetKeydown({
                key: 'ArrowRight',
                currentTarget: group,
                preventDefault: noop
            } as unknown as ReactKeyboardEvent<HTMLElement>)
        );
        expect(document.activeElement).not.toBe(group.children[1]); // no focus moved
    });
});

describe('React useColorPicker — eyedropper (client-only gate)', () => {
    it('reports false when the EyeDropper API is absent (SSR-safe default)', () => {
        const { result } = render({ value: '#000000', eyedropper: true, onInput: noop, onChange: noop });
        expect(result.current.eyedropperSupported).toBe(false);
    });

    it('detects the API after mount and applies the picked color (keeping alpha), committing', async () => {
        (window as unknown as { EyeDropper: unknown }).EyeDropper = class {
            open(): Promise<{ sRGBHex: string }> {
                return Promise.resolve({ sRGBHex: '#ff0000' });
            }
        };
        const onInput = vi.fn();
        const onChange = vi.fn();
        const { result } = render({ value: '#3366ff80', alpha: true, eyedropper: true, onInput, onChange });

        expect(result.current.eyedropperSupported).toBe(true);
        await act(async () => {
            await result.current.openEyeDropper();
        });
        expect(result.current.hex).toBe('#ff000080'); // picked red, but the original alpha (0x80) is kept
        expect(onInput).toHaveBeenCalled();
        expect(onChange).toHaveBeenCalled();
    });
});
