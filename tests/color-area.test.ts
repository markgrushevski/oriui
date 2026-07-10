import { describe, it, expect } from 'vitest';
import { resolveAreaPosition, stepAreaPosition } from '../packages/headless/src/core/color-picker';

const rect = { left: 0, top: 0, width: 200, height: 100 };

describe('color-area — resolveAreaPosition', () => {
    it('maps a pointer to {x,y} in [0,1]², flipping the DOM y (top = max brightness)', () => {
        expect(resolveAreaPosition({ x: 100, y: 50 }, rect)).toEqual({ x: 0.5, y: 0.5 }); // center
        expect(resolveAreaPosition({ x: 0, y: 0 }, rect)).toEqual({ x: 0, y: 1 }); // top-left → sat 0, val 1
        expect(resolveAreaPosition({ x: 200, y: 100 }, rect)).toEqual({ x: 1, y: 0 }); // bottom-right
    });

    it('clamps a drag past the edges to the border', () => {
        expect(resolveAreaPosition({ x: -50, y: -50 }, rect)).toEqual({ x: 0, y: 1 });
        expect(resolveAreaPosition({ x: 500, y: 500 }, rect)).toEqual({ x: 1, y: 0 });
    });

    it('degenerate zero-size rect yields {0,1} rather than NaN', () => {
        expect(resolveAreaPosition({ x: 10, y: 10 }, { left: 0, top: 0, width: 0, height: 0 })).toEqual({ x: 0, y: 1 });
    });
});

describe('color-area — stepAreaPosition', () => {
    const mid = { x: 0.5, y: 0.5 };

    it('arrows move saturation (x) and brightness (y) by the fine step', () => {
        expect(stepAreaPosition(mid, 'ArrowRight')).toEqual({ x: 0.51, y: 0.5 });
        expect(stepAreaPosition(mid, 'ArrowLeft')).toEqual({ x: 0.49, y: 0.5 });
        expect(stepAreaPosition(mid, 'ArrowUp')).toEqual({ x: 0.5, y: 0.51 });
        expect(stepAreaPosition(mid, 'ArrowDown')).toEqual({ x: 0.5, y: 0.49 });
    });

    it('shift multiplies the step (10%)', () => {
        expect(stepAreaPosition(mid, 'ArrowRight', { shift: true })).toEqual({ x: 0.6, y: 0.5 });
    });

    it('Home/End jump saturation to its ends; Page keys move brightness by the large step', () => {
        expect(stepAreaPosition(mid, 'Home')).toEqual({ x: 0, y: 0.5 });
        expect(stepAreaPosition(mid, 'End')).toEqual({ x: 1, y: 0.5 });
        expect(stepAreaPosition(mid, 'PageUp')).toEqual({ x: 0.5, y: 0.6 });
        expect(stepAreaPosition(mid, 'PageDown')).toEqual({ x: 0.5, y: 0.4 });
    });

    it('RTL swaps the horizontal Left/Right mapping', () => {
        expect(stepAreaPosition(mid, 'ArrowLeft', { rtl: true })).toEqual({ x: 0.51, y: 0.5 });
        expect(stepAreaPosition(mid, 'ArrowRight', { rtl: true })).toEqual({ x: 0.49, y: 0.5 });
    });

    it('clamps at the borders', () => {
        expect(stepAreaPosition({ x: 1, y: 1 }, 'ArrowRight')).toEqual({ x: 1, y: 1 });
        expect(stepAreaPosition({ x: 0, y: 0 }, 'ArrowDown')).toEqual({ x: 0, y: 0 });
    });

    it('returns null for a non-navigation key', () => {
        expect(stepAreaPosition(mid, 'a')).toBeNull();
        expect(stepAreaPosition(mid, 'Enter')).toBeNull();
    });
});
