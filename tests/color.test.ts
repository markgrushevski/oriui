import { describe, it, expect } from 'vitest';
import {
    hsvToRgb,
    rgbToHsv,
    rgbToHsl,
    rgbToHex,
    hexToRgb,
    parseColor,
    formatColor,
    readableInk,
    relativeLuminance,
    wrapHue
} from '../packages/headless/src/core/color-picker';

describe('color — wrapHue', () => {
    it('wraps into [0,360)', () => {
        expect(wrapHue(0)).toBe(0);
        expect(wrapHue(360)).toBe(0);
        expect(wrapHue(-30)).toBe(330);
        expect(wrapHue(400)).toBe(40);
    });
});

describe('color — hsvToRgb', () => {
    it('maps the primary/secondary hues at full saturation and value', () => {
        expect(hsvToRgb(0, 1, 1)).toEqual({ r: 255, g: 0, b: 0 }); // red
        expect(hsvToRgb(120, 1, 1)).toEqual({ r: 0, g: 255, b: 0 }); // green
        expect(hsvToRgb(240, 1, 1)).toEqual({ r: 0, g: 0, b: 255 }); // blue
        expect(hsvToRgb(60, 1, 1)).toEqual({ r: 255, g: 255, b: 0 }); // yellow
    });

    it('value 0 is black, saturation 0 is a grey at value', () => {
        expect(hsvToRgb(200, 1, 0)).toEqual({ r: 0, g: 0, b: 0 });
        expect(hsvToRgb(200, 0, 1)).toEqual({ r: 255, g: 255, b: 255 });
        expect(hsvToRgb(200, 0, 0.5)).toEqual({ r: 128, g: 128, b: 128 });
    });
});

describe('color — rgbToHsv (+ hue preservation)', () => {
    it('inverts hsvToRgb for saturated colors', () => {
        expect(rgbToHsv({ r: 255, g: 0, b: 0 })).toEqual({ h: 0, s: 1, v: 1 });
        const green = rgbToHsv({ r: 0, g: 255, b: 0 });
        expect(green.h).toBe(120);
        expect(green.s).toBe(1);
        expect(green.v).toBe(1);
    });

    it('preserves the previous hue for a grayscale input (chroma 0 has no hue)', () => {
        // Dragging the area to a grey must NOT reset the hue slider.
        expect(rgbToHsv({ r: 128, g: 128, b: 128 }, 210).h).toBe(210);
        expect(rgbToHsv({ r: 0, g: 0, b: 0 }, 42).h).toBe(42);
    });
});

describe('color — hexToRgb (loose parse)', () => {
    it('parses #rrggbb, #rgb, #rrggbbaa, without #, any case', () => {
        expect(hexToRgb('#ff0000')).toEqual({ r: 255, g: 0, b: 0, a: 1 });
        expect(hexToRgb('f00')).toEqual({ r: 255, g: 0, b: 0, a: 1 });
        expect(hexToRgb('#FF0000')).toEqual({ r: 255, g: 0, b: 0, a: 1 });
        expect(hexToRgb('#ff000080')).toEqual({ r: 255, g: 0, b: 0, a: 128 / 255 });
        expect(hexToRgb('#f008')).toEqual({ r: 255, g: 0, b: 0, a: 136 / 255 });
    });

    it('returns null for a non-hex / partial value', () => {
        expect(hexToRgb('#ff')).toBeNull();
        expect(hexToRgb('nope')).toBeNull();
        expect(hexToRgb('#12345')).toBeNull();
    });
});

describe('color — rgbToHex', () => {
    it('emits lowercase #rrggbb, padding single digits', () => {
        expect(rgbToHex({ r: 255, g: 0, b: 0 })).toBe('#ff0000');
        expect(rgbToHex({ r: 0, g: 17, b: 34 })).toBe('#001122');
    });

    it('emits #rrggbbaa only when alpha is on', () => {
        expect(rgbToHex({ r: 255, g: 0, b: 0 }, 0.5, true)).toBe('#ff000080');
        expect(rgbToHex({ r: 255, g: 0, b: 0 }, 0.5, false)).toBe('#ff0000');
    });
});

describe('color — parseColor', () => {
    it('parses hex, rgb(), and hsl() into HSVA', () => {
        expect(formatColor(parseColor('#ff0000')!, 'hex')).toBe('#ff0000');
        expect(formatColor(parseColor('rgb(255, 0, 0)')!, 'hex')).toBe('#ff0000');
        expect(formatColor(parseColor('hsl(0, 100%, 50%)')!, 'hex')).toBe('#ff0000');
        expect(formatColor(parseColor('rgba(0, 0, 255, 0.5)')!, 'hex')).toBe('#0000ff');
    });

    it('returns null for garbage', () => {
        expect(parseColor('banana')).toBeNull();
        expect(parseColor('')).toBeNull();
    });
});

describe('color — formatColor (lowercase, per-format)', () => {
    const blue = parseColor('#3366ff')!;

    it('hex (default) is lowercase', () => {
        expect(formatColor(parseColor('#3366FF')!, 'hex')).toBe('#3366ff');
    });

    it('rgb and hsl render channel strings', () => {
        expect(formatColor(blue, 'rgb')).toBe('rgb(51, 102, 255)');
        expect(formatColor(blue, 'hsl')).toMatch(/^hsl\(\d+, \d+%, \d+%\)$/);
    });

    it('emits an alpha channel only when alpha is on', () => {
        const semi = { ...blue, a: 0.5 };
        expect(formatColor(semi, 'rgb', true)).toBe('rgba(51, 102, 255, 0.5)');
        expect(formatColor(semi, 'hex', true)).toBe('#3366ff80');
        expect(formatColor(semi, 'rgb', false)).toBe('rgb(51, 102, 255)');
    });
});

describe('color — rgbToHsl', () => {
    it('computes lightness and saturation', () => {
        expect(rgbToHsl({ r: 255, g: 0, b: 0 })).toEqual({ h: 0, s: 1, l: 0.5 });
        expect(rgbToHsl({ r: 255, g: 255, b: 255 }).l).toBe(1);
    });
});

describe('color — readableInk / relativeLuminance', () => {
    it('picks white ink over dark colors and black ink over light colors', () => {
        expect(readableInk({ r: 0, g: 0, b: 0 })).toBe('#ffffff');
        expect(readableInk({ r: 255, g: 255, b: 255 })).toBe('#000000');
        expect(readableInk({ r: 51, g: 51, b: 51 })).toBe('#ffffff');
        expect(readableInk({ r: 240, g: 240, b: 100 })).toBe('#000000');
    });

    it('luminance is 0 for black and 1 for white', () => {
        expect(relativeLuminance({ r: 0, g: 0, b: 0 })).toBe(0);
        expect(relativeLuminance({ r: 255, g: 255, b: 255 })).toBeCloseTo(1, 5);
    });
});
