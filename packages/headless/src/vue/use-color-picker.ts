import { computed, onMounted, ref, watch } from 'vue';
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

/**
 * Headless color picker (Vue). Follows the compositional-helper shape (like `useToolbar`), NOT the
 * OriHeadless adapter contract — a color picker has no swappable engine and no async state, only
 * deterministic sRGB + 2D-area math (in `core/color-picker`). It owns the working HSVA (so the hue
 * survives a grayscale round-trip) and returns ready-to-bind prop-getters per part plus setters; the
 * styled `OriColorPicker` renders the parts and reuses OriSlider (hue) / OriInput (hex) / OriPopover.
 *
 * The value crosses the boundary as a lowercase STRING (v-model), with the dual event convention:
 * `onInput` streams live on every drag tick, `onChange` commits once on release / keyboard settle.
 */
export interface UseColorPickerOptions {
    /** The controlled color string (v-model). Parsed loosely: hex, `rgb()/rgba()`, `hsl()/hsla()`. */
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
    /** Live update on every interaction tick → wire to `update:modelValue`. */
    onInput: (next: string) => void;
    /** Committed value on pointer-release / keyboard settle → wire to `change` (one undo entry). */
    onChange: (next: string) => void;
}

const DEFAULT: HSVA = { h: 0, s: 0, v: 0, a: 1 };

// Each hidden range owns ONE axis of the SV area: the saturation input takes the horizontal keys, the
// brightness input the vertical ones. This is what makes every keystroke change the focused slider's own
// value (so a screen reader announces it) rather than routing all arrows in 2D from a single input.
const SATURATION_KEYS = ['ArrowLeft', 'ArrowRight', 'Home', 'End'];
const VALUE_KEYS = ['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown'];

export function useColorPicker(options: () => UseColorPickerOptions) {
    const opts = () => options();
    const fmt = (): ColorFormat => opts().format ?? 'hex';
    const alphaOn = (): boolean => opts().alpha ?? false;

    // The working color. Internal HSVA is the source of truth during interaction; it re-syncs from the
    // external `value` only on a genuine external change (preserving the current hue as prevHue).
    const hsva = ref<HSVA>({ ...DEFAULT });

    watch(
        () => opts().value,
        (value) => {
            const parsed = parseColor(value ?? '', hsva.value.h);
            // Echo-guard: skip re-sync when the incoming value is our own last emit. It MUST format with
            // the same alpha flag we emit with — otherwise, with alpha on, the guard string (no alpha)
            // never matches the alpha-carrying echo, so hsva is re-parsed every tick, re-quantizing s/v
            // through 8-bit RGB (a visible ~1% grid for rgb()/hsl()) and defeating "HSVA is the truth".
            if (parsed && formatColor(hsva.value, fmt(), alphaOn()) !== (value ?? '')) {
                hsva.value = parsed;
            }
        },
        { immediate: true }
    );

    const rgb = computed(() => hsvToRgb(hsva.value.h, hsva.value.s, hsva.value.v));
    /** The hex the field shows — `#rrggbbaa` when alpha is on, else `#rrggbb`. */
    const hex = computed(() => formatColor(hsva.value, 'hex', alphaOn()));
    /** The current color for the preview swatch — carries alpha so a checkerboard shows through. */
    const swatchColor = computed(() => rgbToHex(rgb.value, hsva.value.a, alphaOn()));
    /** The opaque current color (for the alpha slider's transparent→color track). */
    const opaqueColor = computed(() => rgbToHex(rgb.value));
    /** Readable ink (black/white) over the current color, per WCAG luminance. */
    const ink = computed(() => readableInk(rgb.value));
    /** The fully-saturated hue color — the area's `--ori-hue` gradient anchor. */
    const hueColor = computed(() => rgbToHex(hsvToRgb(hsva.value.h, 1, 1)));

    const emitInput = (): void => opts().onInput(formatColor(hsva.value, fmt(), alphaOn()));
    const emitChange = (): void => opts().onChange(formatColor(hsva.value, fmt(), alphaOn()));

    // --- setters -------------------------------------------------------------------------------------
    function setSaturationValue(s: number, v: number): void {
        hsva.value = { ...hsva.value, s, v };
        emitInput();
    }
    function setHue(h: number): void {
        hsva.value = { ...hsva.value, h: wrapHue(h) };
        emitInput();
    }
    /** Set alpha (0–1). */
    function setAlpha(a: number): void {
        hsva.value = { ...hsva.value, a: a < 0 ? 0 : a > 1 ? 1 : a };
        emitInput();
    }
    /** Commit the current color (pointer-release / keyboard settle). */
    function commit(): void {
        emitChange();
    }
    /** Parse a full color string (hex field entry, preset click) — a commit. Returns whether it parsed. */
    function setColor(next: string): boolean {
        const parsed = parseColor(next, hsva.value.h);
        if (!parsed) return false;
        hsva.value = parsed;
        emitInput();
        emitChange();
        return true;
    }

    // --- 2D saturation/value area --------------------------------------------------------------------
    const disabled = (): boolean => opts().disabled ?? false;

    function onAreaPointerdown(event: PointerEvent): void {
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

    const areaProps = computed(() => ({
        role: 'group' as const,
        'aria-label': 'Saturation and brightness',
        'aria-disabled': disabled() || undefined,
        style: { '--ori-hue': hueColor.value },
        onPointerdown: onAreaPointerdown
    }));

    /** Inline position for the area thumb: left = saturation, top = inverted value (1 = top). */
    const areaThumbStyle = computed(() => ({
        left: `${hsva.value.s * 100}%`,
        top: `${(1 - hsva.value.v) * 100}%`
    }));

    // The two visually-hidden native range inputs — the a11y surface (role=slider, focusable, form
    // value). Each input owns one axis: its onKeydown handles only that axis's keys (preventing the
    // native range's own arrow handling), so the focused slider's aria-valuenow/valuetext changes on
    // every keystroke and a screen reader announces it (an APG ColorArea requirement — Up/Down on the
    // "Saturation" slider must NOT silently move brightness). onInput covers an AT setting a value
    // directly, and a real browser's native arrow on the non-owned axis (a harmless same-axis nudge).
    function getChannelInputProps(channel: 'saturation' | 'value') {
        const pct = channel === 'saturation' ? Math.round(hsva.value.s * 100) : Math.round(hsva.value.v * 100);
        const keys = channel === 'saturation' ? SATURATION_KEYS : VALUE_KEYS;
        return {
            type: 'range' as const,
            min: 0,
            max: 100,
            step: 1,
            value: pct,
            disabled: disabled() || undefined,
            'aria-label': channel === 'saturation' ? 'Saturation' : 'Brightness',
            'aria-orientation': channel === 'value' ? ('vertical' as const) : undefined,
            // Announce the axis value AND the resulting opaque color, so the settled colour is spoken too.
            'aria-valuetext': `${pct}%, ${opaqueColor.value}`,
            onKeydown: (event: KeyboardEvent): void => {
                if (disabled() || !keys.includes(event.key)) return;
                const next = stepAreaPosition({ x: hsva.value.s, y: hsva.value.v }, event.key, {
                    shift: event.shiftKey
                });
                if (!next) return;
                event.preventDefault();
                setSaturationValue(next.x, next.y);
                commit(); // discrete keyboard step → one undo entry, matching a native range's per-key change
            },
            onInput: (event: Event): void => {
                const n = Number((event.target as HTMLInputElement).value) / 100;
                if (channel === 'saturation') setSaturationValue(n, hsva.value.v);
                else setSaturationValue(hsva.value.s, n);
                commit();
            }
        };
    }

    // --- preset swatches (single-select roving listbox) ----------------------------------------------
    const presets = (): string[] => opts().presets ?? [];
    const isPresetSelected = (color: string): boolean => {
        const parsed = parseColor(color, hsva.value.h);
        return parsed ? formatColor(parsed, 'hex') === formatColor(hsva.value, 'hex') : false;
    };
    const selectedIndex = computed(() => presets().findIndex((color) => isPresetSelected(color)));

    // The single roving Tab stop. APG: it should sit on the SELECTED swatch — seed it on mount and let
    // it follow external colour changes. No focus-guard is needed: the selection only changes via a
    // preset click (which sets `activePreset` itself) or via the area/hue/hex (focus is outside the
    // listbox) — never while arrowing within it, so `activePreset` is never yanked from under the user.
    const activePreset = ref(0);
    watch(
        selectedIndex,
        (i) => {
            if (i >= 0) activePreset.value = i;
        },
        { immediate: true }
    );

    const presetGroupProps = computed(() => ({
        role: 'listbox' as const,
        'aria-label': 'Preset colors',
        'aria-orientation': 'horizontal' as const
    }));

    function onPresetKeydown(event: KeyboardEvent): void {
        if (disabled()) return;
        const list = presets();
        const intent = rovingIntent(event.key, 'horizontal');
        if (!intent || list.length === 0) return;
        event.preventDefault();
        const to = resolveRovingIndex(intent, activePreset.value, list.length, true);
        if (to < 0) return;
        activePreset.value = to;
        (event.currentTarget as HTMLElement).querySelectorAll<HTMLElement>('[data-ori-preset]')[to]?.focus();
    }

    function getPresetProps(color: string, index: number) {
        return {
            'data-ori-preset': '',
            type: 'button' as const,
            role: 'option' as const,
            'aria-label': color,
            'aria-selected': isPresetSelected(color),
            // A disabled picker must be inert to the KEYBOARD too: pointer-events:none on the wrapper only
            // stops the mouse, so without a real `disabled` a keyboard user could Tab to a chip and Enter
            // to mutate the value. The native `disabled` blocks focus + activation; the onClick guard is
            // defense-in-depth for a slotted control that ignores it.
            disabled: disabled() || undefined,
            tabindex: index === activePreset.value ? 0 : -1,
            style: { '--ori-color': color },
            onClick: (): void => {
                if (disabled()) return;
                activePreset.value = index;
                setColor(color);
            },
            onFocus: (): void => {
                activePreset.value = index;
            }
        };
    }

    // --- eyedropper (progressive enhancement; Chromium-only, feature-detected) ------------------------
    // Detect AFTER mount, not at setup: on the server `window` is absent (→ false) while the client has
    // it (→ true), so a setup-time const would render the trigger only on the client and trip an SSR
    // hydration mismatch. Gating on mount makes the server and the first client render agree (no button),
    // then the trigger appears post-mount where supported.
    const eyedropperSupported = ref(false);
    onMounted(() => {
        eyedropperSupported.value = typeof window !== 'undefined' && 'EyeDropper' in window;
    });
    async function openEyeDropper(): Promise<void> {
        if (!eyedropperSupported.value || disabled()) return;
        try {
            const Ctor = (window as unknown as { EyeDropper: new () => { open(): Promise<{ sRGBHex: string }> } })
                .EyeDropper;
            const { sRGBHex } = await new Ctor().open();
            const parsed = parseColor(sRGBHex, hsva.value.h);
            if (!parsed) return;
            // EyeDropper returns an opaque sRGB color — keep the current alpha.
            hsva.value = { ...parsed, a: hsva.value.a };
            emitInput();
            emitChange();
        } catch {
            // user dismissed the eyedropper (AbortError) — no-op
        }
    }

    return {
        // reactive state
        hsva: computed(() => hsva.value),
        rgb,
        hex,
        // The canonical current color in the EMITTED format — the value a form submits, and the next
        // onInput/onChange payload. Unlike `hex` (always hex) or `swatchColor`, it honours the `format` +
        // `alpha` options; it is never empty (a color control always has a value), so before the first emit
        // it can differ from an initial `value` supplied in a different format (or an undefined one).
        value: computed(() => formatColor(hsva.value, fmt(), alphaOn())),
        hue: computed(() => hsva.value.h),
        alpha: computed(() => hsva.value.a),
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
