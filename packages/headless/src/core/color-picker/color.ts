/**
 * Zero-dependency sRGB color engine for the color picker — hand-rolled (like the tiny core machine),
 * so `@oriui/headless` keeps its no-runtime-dependency story. Deliberately reachable ONLY from the
 * `./vue` entry (the `use-color-picker` composable imports it directly); it is NOT re-exported from the
 * core `.` barrel, so it never lands in the 1 kB core budget.
 *
 * The internal working model is **HSVA** (h∈[0,360), s/v/a∈[0,1]): the picker keeps its own HSVA object
 * across interaction, so the hue is preserved when saturation or value hits 0 (a hex round-trip would
 * lose it — grey has no hue — making the hue jump when you drag the area into a corner and back).
 * The colorspace is fixed sRGB for v1, but the shapes are parameter-free so a v2 wide-gamut/CSS-Color-4
 * pass can add a `space` field without a rewrite.
 */

export interface RGB {
    /** 0–255 */ r: number;
    /** 0–255 */ g: number;
    /** 0–255 */ b: number;
}

export interface HSVA {
    /** Hue, 0–360 (kept even when s or v is 0, so it survives a grayscale round-trip). */
    h: number;
    /** Saturation, 0–1. */
    s: number;
    /** Value / brightness, 0–1. */
    v: number;
    /** Alpha, 0–1. */
    a: number;
}

export type ColorFormat = 'hex' | 'rgb' | 'hsl';

const clamp = (n: number, min: number, max: number): number => (n < min ? min : n > max ? max : n);
const round = (n: number): number => Math.round(n);

/** Wrap a hue into [0, 360). */
export const wrapHue = (h: number): number => ((h % 360) + 360) % 360;

/** HSV (s/v∈[0,1]) → RGB (0–255). Standard sextant conversion. */
export function hsvToRgb(h: number, s: number, v: number): RGB {
    const hue = wrapHue(h) / 60;
    const c = v * s;
    const x = c * (1 - Math.abs((hue % 2) - 1));
    const m = v - c;

    let r: number;
    let g: number;
    let b: number;
    if (hue < 1) [r, g, b] = [c, x, 0];
    else if (hue < 2) [r, g, b] = [x, c, 0];
    else if (hue < 3) [r, g, b] = [0, c, x];
    else if (hue < 4) [r, g, b] = [0, x, c];
    else if (hue < 5) [r, g, b] = [x, 0, c];
    else [r, g, b] = [c, 0, x];

    return { r: round((r + m) * 255), g: round((g + m) * 255), b: round((b + m) * 255) };
}

/**
 * RGB (0–255) → HSV (s/v∈[0,1]). `prevHue` preserves the current hue for a grayscale input (chroma 0
 * has no defined hue) so the picker's hue slider doesn't reset when saturation drops to 0.
 */
export function rgbToHsv({ r, g, b }: RGB, prevHue = 0): { h: number; s: number; v: number } {
    const rn = r / 255;
    const gn = g / 255;
    const bn = b / 255;
    const max = Math.max(rn, gn, bn);
    const min = Math.min(rn, gn, bn);
    const d = max - min;

    let h = prevHue;
    if (d !== 0) {
        if (max === rn) h = ((gn - bn) / d) % 6;
        else if (max === gn) h = (bn - rn) / d + 2;
        else h = (rn - gn) / d + 4;
        h = wrapHue(h * 60);
    }

    const s = max === 0 ? 0 : d / max;
    return { h, s, v: max };
}

/** RGB (0–255) → HSL (h 0–360, s/l 0–1). Used only for `format: 'hsl'` output. */
export function rgbToHsl({ r, g, b }: RGB): { h: number; s: number; l: number } {
    const rn = r / 255;
    const gn = g / 255;
    const bn = b / 255;
    const max = Math.max(rn, gn, bn);
    const min = Math.min(rn, gn, bn);
    const d = max - min;
    const l = (max + min) / 2;

    let h = 0;
    let s = 0;
    if (d !== 0) {
        s = d / (1 - Math.abs(2 * l - 1));
        if (max === rn) h = ((gn - bn) / d) % 6;
        else if (max === gn) h = (bn - rn) / d + 2;
        else h = (rn - gn) / d + 4;
        h = wrapHue(h * 60);
    }
    return { h, s, l };
}

const hexPair = (n: number): string => clamp(round(n), 0, 255).toString(16).padStart(2, '0');

/** RGB (+ optional alpha) → lowercase `#rrggbb` (or `#rrggbbaa` when `alpha` is on and a < 1). */
export function rgbToHex({ r, g, b }: RGB, a = 1, alpha = false): string {
    const base = `#${hexPair(r)}${hexPair(g)}${hexPair(b)}`;
    return alpha ? `${base}${hexPair(a * 255)}` : base;
}

/**
 * Loosely parse a hex string — `#rgb`, `#rgba`, `#rrggbb`, `#rrggbbaa`, with or without the `#`, any
 * case. Returns RGB + alpha, or `null` if it isn't a valid hex.
 */
export function hexToRgb(input: string): (RGB & { a: number }) | null {
    let hex = input.trim().replace(/^#/, '');
    if (/^[\da-f]{3,4}$/i.test(hex)) {
        // Expand shorthand: #rgb(a) → #rrggbb(aa)
        hex = hex
            .split('')
            .map((ch) => ch + ch)
            .join('');
    }
    if (!/^[\da-f]{6}([\da-f]{2})?$/i.test(hex)) return null;

    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    const a = hex.length === 8 ? parseInt(hex.slice(6, 8), 16) / 255 : 1;
    return { r, g, b, a };
}

/**
 * Loosely parse any supported color STRING into the internal HSVA — hex (`#…`), `rgb()/rgba()`, or
 * `hsl()/hsla()`. Returns `null` for anything unrecognized. `prevHue` preserves the hue on a grayscale
 * input (see {@link rgbToHsv}).
 */
export function parseColor(input: string, prevHue = 0): HSVA | null {
    const str = input.trim().toLowerCase();

    const hex = hexToRgb(str);
    if (hex) return { ...rgbToHsv(hex, prevHue), a: hex.a };

    const rgbM = str.match(/^rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)(?:[\s,/]+([\d.]+%?))?\s*\)$/);
    if (rgbM && rgbM[1] && rgbM[2] && rgbM[3]) {
        const r = clamp(parseFloat(rgbM[1]), 0, 255);
        const g = clamp(parseFloat(rgbM[2]), 0, 255);
        const b = clamp(parseFloat(rgbM[3]), 0, 255);
        const a = rgbM[4] === undefined ? 1 : parseAlpha(rgbM[4]);
        return { ...rgbToHsv({ r, g, b }, prevHue), a };
    }

    const hslM = str.match(/^hsla?\(\s*([\d.]+)[\s,]+([\d.]+)%[\s,]+([\d.]+)%(?:[\s,/]+([\d.]+%?))?\s*\)$/);
    if (hslM && hslM[1] && hslM[2] && hslM[3]) {
        const h = wrapHue(parseFloat(hslM[1]));
        const s = clamp(parseFloat(hslM[2]) / 100, 0, 1);
        const l = clamp(parseFloat(hslM[3]) / 100, 0, 1);
        const a = hslM[4] === undefined ? 1 : parseAlpha(hslM[4]);
        // HSL → HSV (both share hue): v = l + s*min(l,1-l); s_v = 2*(1 - l/v)
        const v = l + s * Math.min(l, 1 - l);
        const sv = v === 0 ? 0 : 2 * (1 - l / v);
        return { h, s: sv, v, a };
    }

    return null;
}

const parseAlpha = (token: string): number =>
    clamp(token.endsWith('%') ? parseFloat(token) / 100 : parseFloat(token), 0, 1);

/**
 * Serialize the internal HSVA to a lowercase string in the requested format. `alpha` controls whether an
 * alpha channel is emitted (v1 keeps it off → `#rrggbb` / `rgb(...)` / `hsl(...)`).
 */
export function formatColor(color: HSVA, format: ColorFormat = 'hex', alpha = false): string {
    const rgb = hsvToRgb(color.h, color.s, color.v);
    const a = clamp(color.a, 0, 1);

    if (format === 'rgb') {
        const head = `${round(rgb.r)}, ${round(rgb.g)}, ${round(rgb.b)}`;
        return alpha ? `rgba(${head}, ${trimAlpha(a)})` : `rgb(${head})`;
    }
    if (format === 'hsl') {
        const { h, s, l } = rgbToHsl(rgb);
        const head = `${round(h)}, ${round(s * 100)}%, ${round(l * 100)}%`;
        return alpha ? `hsla(${head}, ${trimAlpha(a)})` : `hsl(${head})`;
    }
    return rgbToHex(rgb, a, alpha);
}

const trimAlpha = (a: number): string => String(Math.round(a * 100) / 100);

/**
 * WCAG relative luminance of an sRGB color (0 = black, 1 = white). Shared basis for choosing readable
 * ink over a swatch and for the token contrast guard.
 */
export function relativeLuminance({ r, g, b }: RGB): number {
    const lin = (c: number): number => {
        const cn = c / 255;
        return cn <= 0.03928 ? cn / 12.92 : ((cn + 0.055) / 1.055) ** 2.4;
    };
    return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

/** Black or white ink, whichever has the higher WCAG contrast against the given color. */
export function readableInk(rgb: RGB): '#000000' | '#ffffff' {
    // Contrast vs white = 1.05 / (L + 0.05); vs black = (L + 0.05) / 0.05. Pick the larger.
    const l = relativeLuminance(rgb);
    return (l + 0.05) / 0.05 >= 1.05 / (l + 0.05) ? '#000000' : '#ffffff';
}
