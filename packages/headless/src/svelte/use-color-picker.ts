import { derived, get, readable, writable, type Readable } from 'svelte/store';
import {
    formatColor,
    hsvToRgb,
    parseColor,
    readableInk,
    resolveAreaPosition,
    rgbToHex,
    stepAreaPosition,
    wrapHue,
    type ColorFormat,
    type HSVA
} from '../core/color-picker';
import { resolveRovingIndex, rovingIntent } from '../core';
import { safeOnDestroy, toReadable, type MaybeReactive } from './use-store';

/**
 * Headless color picker (Svelte) — the store-native twin of the Vue `useColorPicker`, sharing the same
 * zero-dependency sRGB + 2D-area engine in `../core/color-picker`. It owns the working HSVA in a `writable`
 * (so the hue survives a grayscale round-trip) and returns `Readable` prop-bags / stores-of-functions plus
 * plain setters. The value crosses the boundary as a lowercase STRING with the dual-event convention:
 * `onInput` streams live on every drag tick, `onChange` commits once on release / keyboard settle.
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
    /** Live update on every interaction tick → wire to your bound value. */
    onInput: (next: string) => void;
    /** Committed value on pointer-release / keyboard settle → one undo entry. */
    onChange: (next: string) => void;
}

const DEFAULT: HSVA = { h: 0, s: 0, v: 0, a: 1 };

// Each hidden range owns ONE axis of the SV area — saturation takes the horizontal keys, brightness the
// vertical ones — so every keystroke changes the focused slider's own value (screen-reader announced).
const SATURATION_KEYS = ['ArrowLeft', 'ArrowRight', 'Home', 'End'];
const VALUE_KEYS = ['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown'];

const isPresetSelected = (color: string, h: HSVA): boolean => {
    const parsed = parseColor(color, h.h);
    return parsed ? formatColor(parsed, 'hex') === formatColor(h, 'hex') : false;
};

export function useColorPicker(options: MaybeReactive<UseColorPickerOptions>) {
    const opts$ = toReadable(options);
    const hsva = writable<HSVA>({ ...DEFAULT });

    const disabled = (): boolean => get(opts$).disabled ?? false;
    const formatted = (): string => {
        const o = get(opts$);
        return formatColor(get(hsva), o.format ?? 'hex', o.alpha ?? false);
    };
    const emitInput = (): void => get(opts$).onInput(formatted());
    const emitChange = (): void => get(opts$).onChange(formatted());

    // Echo-guard: re-sync internal HSVA only on a GENUINE external `value` change — skip our own last emit
    // (it MUST format with the same alpha flag we emit with, or an alpha-carrying echo re-quantizes s/v).
    // Subscribe to a derived of `value` ONLY (not the whole opts$) — the Vue twin does `watch(() => value)`,
    // so a change to a NON-value option (disabled, presets, …) must NOT re-run the guard and reset an
    // uncontrolled drag. The derived dedupes the primitive, and fires on subscribe = the Vue `{ immediate }`.
    safeOnDestroy(
        derived(opts$, (o) => o.value).subscribe((value) => {
            const o = get(opts$);
            const parsed = parseColor(value ?? '', get(hsva).h);
            if (parsed && formatColor(get(hsva), o.format ?? 'hex', o.alpha ?? false) !== (value ?? '')) {
                hsva.set(parsed);
            }
        })
    );

    // --- reactive state ------------------------------------------------------------------------------
    const rgb = derived(hsva, (h) => hsvToRgb(h.h, h.s, h.v));
    const hex = derived([hsva, opts$], ([h, o]) => formatColor(h, 'hex', o.alpha ?? false));
    // The canonical current color in the EMITTED format (what a form submits / the next emit) — never empty.
    const value = derived([hsva, opts$], ([h, o]) => formatColor(h, o.format ?? 'hex', o.alpha ?? false));
    const swatchColor = derived([hsva, opts$], ([h, o]) => rgbToHex(hsvToRgb(h.h, h.s, h.v), h.a, o.alpha ?? false));
    const opaqueColor = derived(hsva, (h) => rgbToHex(hsvToRgb(h.h, h.s, h.v)));
    const ink = derived(hsva, (h) => readableInk(hsvToRgb(h.h, h.s, h.v)));
    const hueColor = derived(hsva, (h) => rgbToHex(hsvToRgb(h.h, 1, 1)));
    const hue = derived(hsva, (h) => h.h);
    const alpha = derived(hsva, (h) => h.a);

    // --- setters -------------------------------------------------------------------------------------
    function setSaturationValue(s: number, v: number): void {
        hsva.update((c) => ({ ...c, s, v }));
        emitInput();
    }
    function setHue(h: number): void {
        hsva.update((c) => ({ ...c, h: wrapHue(h) }));
        emitInput();
    }
    function setAlpha(a: number): void {
        hsva.update((c) => ({ ...c, a: a < 0 ? 0 : a > 1 ? 1 : a }));
        emitInput();
    }
    function commit(): void {
        emitChange();
    }
    function setColor(next: string): boolean {
        const parsed = parseColor(next, get(hsva).h);
        if (!parsed) return false;
        hsva.set(parsed);
        emitInput();
        emitChange();
        return true;
    }

    // --- 2D saturation/value area --------------------------------------------------------------------
    function onpointerdown(event: PointerEvent): void {
        if (disabled() || event.button !== 0) return;
        const el = event.currentTarget as HTMLElement;
        const apply = (e: PointerEvent): void => {
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
    }

    const areaProps = derived([hueColor, opts$], ([hc, o]) => ({
        role: 'group' as const,
        'aria-label': 'Saturation and brightness',
        'aria-disabled': (o.disabled ?? false) || undefined,
        style: { '--ori-hue': hc },
        onpointerdown
    }));

    const areaThumbStyle = derived(hsva, (h) => ({
        left: `${h.s * 100}%`,
        top: `${(1 - h.v) * 100}%`
    }));

    // The two visually-hidden native range inputs — the a11y surface (role=slider). Each owns one axis; its
    // onkeydown handles only that axis's keys so the focused slider is announced per keystroke. A store of a
    // function so `$getChannelInputProps('saturation')` re-emits as the color changes.
    const getChannelInputProps: Readable<(channel: 'saturation' | 'value') => Record<string, unknown>> = derived(
        [hsva, opts$],
        ([h, o]) =>
            (channel: 'saturation' | 'value') => {
                const pct = channel === 'saturation' ? Math.round(h.s * 100) : Math.round(h.v * 100);
                const keys = channel === 'saturation' ? SATURATION_KEYS : VALUE_KEYS;
                return {
                    type: 'range' as const,
                    min: 0,
                    max: 100,
                    step: 1,
                    value: pct,
                    disabled: (o.disabled ?? false) || undefined,
                    'aria-label': channel === 'saturation' ? 'Saturation' : 'Brightness',
                    'aria-orientation': channel === 'value' ? ('vertical' as const) : undefined,
                    'aria-valuetext': `${pct}%, ${rgbToHex(hsvToRgb(h.h, h.s, h.v))}`,
                    onkeydown: (event: KeyboardEvent): void => {
                        if (disabled() || !keys.includes(event.key)) return;
                        const next = stepAreaPosition({ x: get(hsva).s, y: get(hsva).v }, event.key, {
                            shift: event.shiftKey
                        });
                        if (!next) return;
                        event.preventDefault();
                        setSaturationValue(next.x, next.y);
                        commit(); // discrete keyboard step → one undo entry
                    },
                    oninput: (event: Event): void => {
                        const n = Number((event.target as HTMLInputElement).value) / 100;
                        const c = get(hsva);
                        if (channel === 'saturation') setSaturationValue(n, c.v);
                        else setSaturationValue(c.s, n);
                        commit();
                    }
                };
            }
    );

    // --- preset swatches (single-select roving listbox) ----------------------------------------------
    const selectedIndex = derived([hsva, opts$], ([h, o]) =>
        (o.presets ?? []).findIndex((color) => isPresetSelected(color, h))
    );
    // The single roving Tab stop follows the selected swatch (APG). Seeded on subscribe (immediate).
    const activePreset = writable(0);
    safeOnDestroy(
        selectedIndex.subscribe((i) => {
            if (i >= 0) activePreset.set(i);
        })
    );

    const presetGroupProps = readable({
        role: 'listbox' as const,
        'aria-label': 'Preset colors',
        'aria-orientation': 'horizontal' as const
    });

    function onPresetKeydown(event: KeyboardEvent): void {
        if (disabled()) return;
        const list = get(opts$).presets ?? [];
        const intent = rovingIntent(event.key, 'horizontal');
        if (!intent || list.length === 0) return;
        event.preventDefault();
        const to = resolveRovingIndex(intent, get(activePreset), list.length, true);
        if (to < 0) return;
        activePreset.set(to);
        (event.currentTarget as HTMLElement).querySelectorAll<HTMLElement>('[data-ori-preset]')[to]?.focus();
    }

    const getPresetProps: Readable<(color: string, index: number) => Record<string, unknown>> = derived(
        [activePreset, hsva, opts$],
        ([active, h, o]) =>
            (color: string, index: number) => ({
                'data-ori-preset': '',
                type: 'button' as const,
                role: 'option' as const,
                'aria-label': color,
                'aria-selected': isPresetSelected(color, h),
                // A disabled picker is inert to keyboard too — the native `disabled` blocks focus + activation;
                // the onclick guard is defense-in-depth for a slotted control that ignores it.
                disabled: (o.disabled ?? false) || undefined,
                tabindex: index === active ? 0 : -1,
                style: { '--ori-color': color },
                onclick: (): void => {
                    if (disabled()) return;
                    activePreset.set(index);
                    setColor(color);
                },
                onfocus: (): void => {
                    activePreset.set(index);
                }
            })
    );

    // --- eyedropper (progressive enhancement; Chromium-only, feature-detected) ------------------------
    // `readable`'s start-fn runs only on the first (client) subscription, so SSR renders `false` (the
    // window guard) and the trigger appears client-side where supported — the no-`onMount` pattern.
    const eyedropperSupported = readable(false, (set) => {
        set(typeof window !== 'undefined' && 'EyeDropper' in window);
    });
    async function openEyeDropper(): Promise<void> {
        if (!get(eyedropperSupported) || disabled()) return;
        try {
            const Ctor = (window as unknown as { EyeDropper: new () => { open(): Promise<{ sRGBHex: string }> } })
                .EyeDropper;
            const { sRGBHex } = await new Ctor().open();
            const parsed = parseColor(sRGBHex, get(hsva).h);
            if (!parsed) return;
            // EyeDropper returns an opaque sRGB color — keep the current alpha.
            hsva.set({ ...parsed, a: get(hsva).a });
            emitInput();
            emitChange();
        } catch {
            // user dismissed the eyedropper (AbortError) — no-op
        }
    }

    return {
        // reactive state
        hsva: { subscribe: hsva.subscribe } as Readable<HSVA>,
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
