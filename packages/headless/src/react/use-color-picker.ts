import { useCallback, useEffect, useRef, useState } from 'react';
import type { FormEvent, KeyboardEvent as ReactKeyboardEvent, PointerEvent as ReactPointerEvent } from 'react';
import {
    formatColor,
    hsvToRgb,
    parseColor,
    readableInk,
    resolveAreaPosition,
    rgbToHex,
    stepAreaPosition,
    wrapHue
} from '../core/color-picker';
import type { ColorFormat, HSVA } from '../core/color-picker';
import { resolveRovingIndex, rovingIntent } from '../core';

// Re-export the color types so `@oriui/headless/react` consumers can annotate their state / props.
export type { ColorFormat, HSVA } from '../core/color-picker';

/**
 * Headless color picker (React) — the hooks twin of the Vue / Svelte `useColorPicker`, sharing the same
 * zero-dependency sRGB + 2D-area engine in `../core/color-picker`. Like `useTabs` it is a **compositional**
 * helper, NOT the OriHeadless adapter contract: a color picker has no swappable engine and no async state,
 * only deterministic sRGB math, so there is nothing to swap and no machine to bridge. It owns the working
 * HSVA in React state (so the hue survives a grayscale round-trip) and returns plain values + ready-to-bind
 * prop bags (React-native casing — `onPointerDown` / `onKeyDown` / `onInput` / `onClick` / `onFocus`,
 * `tabIndex`) plus imperative setters.
 *
 * The value crosses the boundary as a lowercase STRING, with the dual event convention: `onInput` streams
 * live on every drag tick, `onChange` commits once on release / keyboard settle (one undo entry).
 */
export interface UseColorPickerOptions {
    /** The controlled color string. Parsed loosely: hex, `rgb()/rgba()`, `hsl()/hsla()`. */
    value: string | undefined;
    /** Output format for the emitted string (default `'hex'`). */
    format?: ColorFormat;
    /** Include an alpha channel — the emitted string carries it (`#rrggbbaa` / `rgba()` / `hsla()`). */
    alpha?: boolean;
    /** Expose an eyedropper trigger (the EyeDropper API; `eyedropperSupported` is false where absent). */
    eyedropper?: boolean;
    disabled?: boolean;
    /** Preset swatches (a `string[]` of colors) rendered as a single-select roving listbox. */
    presets?: string[];
    /** Live update on every interaction tick — wire to your controlled value's setter. */
    onInput: (next: string) => void;
    /** Committed value on pointer-release / keyboard settle — one undo entry. */
    onChange: (next: string) => void;
}

const DEFAULT: HSVA = { h: 0, s: 0, v: 0, a: 1 };

// Each hidden range owns ONE axis of the SV area — saturation takes the horizontal keys, brightness the
// vertical ones — so every keystroke changes the focused slider's own value (screen-reader announced).
const SATURATION_KEYS = ['ArrowLeft', 'ArrowRight', 'Home', 'End'];
const VALUE_KEYS = ['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown'];

export function useColorPicker(options: UseColorPickerOptions) {
    const format = options.format ?? 'hex';
    const withAlpha = options.alpha ?? false;
    const isDisabled = options.disabled ?? false;
    const presets = options.presets ?? [];

    // Latest options in a ref so event handlers (the pointer-move loop, the channel keydown, the eyedropper
    // resolve) read fresh callbacks / flags without going stale — the React twin of the Vue `opts()` getter
    // and the Svelte `get(opts$)`. Written every render, but ONLY read inside handlers that fire after
    // commit, never during render for output, so it is safe under concurrent rendering.
    const optsRef = useRef(options);
    optsRef.current = options;

    // The working color. Internal HSVA is the source of truth during interaction; a `useState` for render +
    // a mirroring ref so the synchronous event handlers (which cannot read the async state) always see the
    // latest value and can emit the NEXT color explicitly. Seeded from `value` so the first paint (and the
    // SSR/hydration render, a deterministic parse on both sides) shows the color, not the DEFAULT black.
    const [hsva, setHsvaState] = useState<HSVA>(() => parseColor(options.value ?? '', 0) ?? { ...DEFAULT });
    const hsvaRef = useRef(hsva);
    const setHsva = useCallback((next: HSVA): void => {
        hsvaRef.current = next;
        setHsvaState(next);
    }, []);

    // Echo-guard: re-sync internal HSVA only on a GENUINE external `value` change — skip our own last emit
    // (it MUST format with the same alpha flag we emit with, or an alpha-carrying echo re-quantizes s/v
    // through 8-bit RGB, defeating "HSVA is the truth"). Keyed on `options.value` ONLY (not the whole
    // options): the Vue twin does `watch(() => value)`, so a change to a NON-value option (disabled,
    // presets, …) must NOT re-run the guard and reset an in-flight drag. Runs on mount too (Vue's
    // `{ immediate }`), reading current hsva / format / alpha from the refs.
    useEffect(() => {
        // Reference `options.value` directly (it is the effect's key) but read format / alpha from the ref,
        // so a format-only change does NOT re-run the guard (mirroring the Vue `watch(() => value)`).
        const o = optsRef.current;
        const parsed = parseColor(options.value ?? '', hsvaRef.current.h);
        if (parsed && formatColor(hsvaRef.current, o.format ?? 'hex', o.alpha ?? false) !== (options.value ?? '')) {
            setHsva(parsed);
        }
    }, [options.value, setHsva]);

    // --- derived (recomputed each render, plain values) ----------------------------------------------
    const rgb = hsvToRgb(hsva.h, hsva.s, hsva.v);
    /** The hex the field shows — `#rrggbbaa` when alpha is on, else `#rrggbb`. */
    const hex = formatColor(hsva, 'hex', withAlpha);
    // The canonical current color in the EMITTED format — the value a form submits, and the next
    // onInput/onChange payload. Honours `format` + `alpha`; never empty (a color control always has a value).
    const value = formatColor(hsva, format, withAlpha);
    /** The current color for the preview swatch — carries alpha so a checkerboard shows through. */
    const swatchColor = rgbToHex(rgb, hsva.a, withAlpha);
    /** The opaque current color (for the alpha slider's transparent → color track). */
    const opaqueColor = rgbToHex(rgb);
    /** Readable ink (black/white) over the current color, per WCAG luminance. */
    const ink = readableInk(rgb);
    /** The fully-saturated hue color — the area's `--ori-hue` gradient anchor. */
    const hueColor = rgbToHex(hsvToRgb(hsva.h, 1, 1));
    const hue = hsva.h;
    const alpha = hsva.a;

    // Emit the NEXT color explicitly (React state is not synchronously readable, so setters compute `next`
    // and hand it straight to the emit). Reads the live callbacks / format via the options ref.
    const emitInput = useCallback((next: HSVA): void => {
        const o = optsRef.current;
        o.onInput(formatColor(next, o.format ?? 'hex', o.alpha ?? false));
    }, []);
    const emitChange = useCallback((next: HSVA): void => {
        const o = optsRef.current;
        o.onChange(formatColor(next, o.format ?? 'hex', o.alpha ?? false));
    }, []);

    // --- setters -------------------------------------------------------------------------------------
    const setSaturationValue = useCallback(
        (s: number, v: number): void => {
            const next = { ...hsvaRef.current, s, v };
            setHsva(next);
            emitInput(next);
        },
        [setHsva, emitInput]
    );
    const setHue = useCallback(
        (h: number): void => {
            const next = { ...hsvaRef.current, h: wrapHue(h) };
            setHsva(next);
            emitInput(next);
        },
        [setHsva, emitInput]
    );
    /** Set alpha (0–1). */
    const setAlpha = useCallback(
        (a: number): void => {
            const next = { ...hsvaRef.current, a: a < 0 ? 0 : a > 1 ? 1 : a };
            setHsva(next);
            emitInput(next);
        },
        [setHsva, emitInput]
    );
    /** Commit the current color (pointer-release / keyboard settle). */
    const commit = useCallback((): void => {
        emitChange(hsvaRef.current);
    }, [emitChange]);
    /** Parse a full color string (hex field entry, preset click) — a commit. Returns whether it parsed. */
    const setColor = useCallback(
        (next: string): boolean => {
            const parsed = parseColor(next, hsvaRef.current.h);
            if (!parsed) return false;
            setHsva(parsed);
            emitInput(parsed);
            emitChange(parsed);
            return true;
        },
        [setHsva, emitInput, emitChange]
    );

    // --- 2D saturation/value area --------------------------------------------------------------------
    const onAreaPointerDown = useCallback(
        (event: ReactPointerEvent<HTMLElement>): void => {
            if ((optsRef.current.disabled ?? false) || event.button !== 0) return;
            const el = event.currentTarget;
            const apply = (e: { clientX: number; clientY: number }): void => {
                const { x, y } = resolveAreaPosition({ x: e.clientX, y: e.clientY }, el.getBoundingClientRect());
                setSaturationValue(x, y);
            };
            el.setPointerCapture(event.pointerId);
            apply(event);

            const onMove = (e: PointerEvent): void => apply(e);
            const onUp = (): void => {
                el.removeEventListener('pointermove', onMove);
                el.removeEventListener('pointerup', onUp);
                commit();
            };
            el.addEventListener('pointermove', onMove);
            el.addEventListener('pointerup', onUp);
        },
        [setSaturationValue, commit]
    );

    const areaProps = {
        role: 'group' as const,
        'aria-label': 'Saturation and brightness',
        'aria-disabled': isDisabled || undefined,
        style: { '--ori-hue': hueColor },
        onPointerDown: onAreaPointerDown
    };

    /** Inline position for the area thumb: left = saturation, top = inverted value (1 = top). */
    const areaThumbStyle = {
        left: `${hsva.s * 100}%`,
        top: `${(1 - hsva.v) * 100}%`
    };

    // The two visually-hidden native range inputs — the a11y surface (role=slider, focusable, form value).
    // Each input owns one axis: its onKeyDown handles only that axis's keys (preventing the native range's
    // own arrow handling), so the focused slider's aria-valuenow/valuetext changes on every keystroke and a
    // screen reader announces it (an APG ColorArea requirement — Up/Down on "Saturation" must NOT silently
    // move brightness). onInput covers an AT setting a value directly (and a native arrow on the non-owned
    // axis, a harmless same-axis nudge).
    const getChannelInputProps = (channel: 'saturation' | 'value') => {
        const pct = channel === 'saturation' ? Math.round(hsva.s * 100) : Math.round(hsva.v * 100);
        const keys = channel === 'saturation' ? SATURATION_KEYS : VALUE_KEYS;
        return {
            type: 'range' as const,
            min: 0,
            max: 100,
            step: 1,
            value: pct,
            disabled: isDisabled || undefined,
            'aria-label': channel === 'saturation' ? 'Saturation' : 'Brightness',
            'aria-orientation': channel === 'value' ? ('vertical' as const) : undefined,
            // Announce the axis value AND the resulting opaque color, so the settled colour is spoken too.
            'aria-valuetext': `${pct}%, ${opaqueColor}`,
            onKeyDown: (event: ReactKeyboardEvent<HTMLInputElement>): void => {
                if ((optsRef.current.disabled ?? false) || !keys.includes(event.key)) return;
                const next = stepAreaPosition({ x: hsvaRef.current.s, y: hsvaRef.current.v }, event.key, {
                    shift: event.shiftKey
                });
                if (!next) return;
                event.preventDefault();
                setSaturationValue(next.x, next.y);
                commit(); // discrete keyboard step → one undo entry, matching a native range's per-key change
            },
            onInput: (event: FormEvent<HTMLInputElement>): void => {
                const n = Number(event.currentTarget.value) / 100;
                if (channel === 'saturation') setSaturationValue(n, hsvaRef.current.v);
                else setSaturationValue(hsvaRef.current.s, n);
                commit();
            }
        };
    };

    // --- preset swatches (single-select roving listbox) ----------------------------------------------
    const presetSelected = (color: string): boolean => {
        const parsed = parseColor(color, hsva.h);
        return parsed ? formatColor(parsed, 'hex') === formatColor(hsva, 'hex') : false;
    };
    const selectedIndex = presets.findIndex((color) => presetSelected(color));

    // The single roving Tab stop. APG: it should sit on the SELECTED swatch — a state for render + a ref for
    // the keydown handler to read synchronously. No focus-guard is needed: the selection only changes via a
    // preset click (which sets `activePreset` itself) or via the area/hue/hex (focus is outside the
    // listbox) — never while arrowing within it, so it is never yanked from under the user.
    const [activePreset, setActivePresetState] = useState(0);
    const activePresetRef = useRef(0);
    const setActivePreset = useCallback((i: number): void => {
        activePresetRef.current = i;
        setActivePresetState(i);
    }, []);

    // Seed the roving stop on the selected swatch and let it follow external colour changes (Vue's immediate
    // `watch(selectedIndex)`).
    useEffect(() => {
        if (selectedIndex >= 0) setActivePreset(selectedIndex);
    }, [selectedIndex, setActivePreset]);

    const presetGroupProps = {
        role: 'listbox' as const,
        'aria-label': 'Preset colors',
        'aria-orientation': 'horizontal' as const
    };

    const onPresetKeydown = useCallback(
        (event: ReactKeyboardEvent<HTMLElement>): void => {
            if (optsRef.current.disabled ?? false) return;
            const list = optsRef.current.presets ?? [];
            const intent = rovingIntent(event.key, 'horizontal');
            if (!intent || list.length === 0) return;
            event.preventDefault();
            const to = resolveRovingIndex(intent, activePresetRef.current, list.length, true);
            if (to < 0) return;
            setActivePreset(to);
            event.currentTarget.querySelectorAll<HTMLElement>('[data-ori-preset]')[to]?.focus();
        },
        [setActivePreset]
    );

    const getPresetProps = (color: string, index: number) => ({
        'data-ori-preset': '',
        type: 'button' as const,
        role: 'option' as const,
        'aria-label': color,
        'aria-selected': presetSelected(color),
        // A disabled picker must be inert to the KEYBOARD too: pointer-events:none on the wrapper only stops
        // the mouse, so without a real `disabled` a keyboard user could Tab to a chip and Enter to mutate the
        // value. The native `disabled` blocks focus + activation; the onClick guard is defense-in-depth for a
        // slotted control that ignores it.
        disabled: isDisabled || undefined,
        tabIndex: index === activePreset ? 0 : -1,
        style: { '--ori-color': color },
        onClick: (): void => {
            if (optsRef.current.disabled ?? false) return;
            setActivePreset(index);
            setColor(color);
        },
        onFocus: (): void => {
            setActivePreset(index);
        }
    });

    // --- eyedropper (progressive enhancement; Chromium-only, feature-detected) ------------------------
    // Detect AFTER mount, not during render: on the server `window` is absent (→ false) while the client has
    // it (→ true), so a render-time read would render the trigger only on the client and trip an SSR
    // hydration mismatch. `useState(false)` + a mount effect makes the server and the first client render
    // agree (no button), then the trigger appears post-mount where supported.
    const [eyedropperSupported, setEyedropperSupported] = useState(false);
    useEffect(() => {
        setEyedropperSupported(typeof window !== 'undefined' && 'EyeDropper' in window);
    }, []);
    const openEyeDropper = useCallback(async (): Promise<void> => {
        if (!eyedropperSupported || (optsRef.current.disabled ?? false)) return;
        try {
            const Ctor = (window as unknown as { EyeDropper: new () => { open(): Promise<{ sRGBHex: string }> } })
                .EyeDropper;
            const { sRGBHex } = await new Ctor().open();
            const parsed = parseColor(sRGBHex, hsvaRef.current.h);
            if (!parsed) return;
            // EyeDropper returns an opaque sRGB color — keep the current alpha.
            const next = { ...parsed, a: hsvaRef.current.a };
            setHsva(next);
            emitInput(next);
            emitChange(next);
        } catch {
            // user dismissed the eyedropper (AbortError) — no-op
        }
    }, [eyedropperSupported, setHsva, emitInput, emitChange]);

    return {
        // reactive state
        hsva,
        rgb,
        hex,
        value,
        hue,
        alpha,
        swatchColor,
        opaqueColor,
        ink,
        hueColor,
        eyedropperSupported,
        // prop-getters
        areaProps,
        areaThumbStyle,
        getChannelInputProps,
        presetGroupProps,
        getPresetProps,
        onPresetKeydown,
        // setters / actions
        setHue,
        setAlpha,
        setColor,
        setHex: setColor,
        setSaturationValue,
        openEyeDropper,
        commit
    };
}
