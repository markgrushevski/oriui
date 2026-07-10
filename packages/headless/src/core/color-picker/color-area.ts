/**
 * Pure 2D coordinate + keyboard-step math for the color picker's saturation×value AREA — the 2D twin of
 * `core/roving.ts`. No DOM, no reactivity: framework-agnostic functions unit-tested in isolation and
 * shared by the Vue binding (and a future Svelte twin). The Vue layer owns the real elements (pointer
 * capture, the two hidden range inputs) and calls these for the math.
 *
 * Position is `{ x, y }` with both in [0, 1]: x = saturation (0 left → 1 right), y = value/brightness
 * (0 bottom → 1 top). y is stored top-up so it maps directly to a CSS `--y` where the thumb sits higher
 * for a brighter colour; the pointer helper flips the raw DOM y (which grows downward) for you.
 */

export interface AreaPosition {
    /** Saturation, 0 (left) → 1 (right). */
    x: number;
    /** Value / brightness, 0 (bottom) → 1 (top). */
    y: number;
}

export interface AreaRect {
    left: number;
    top: number;
    width: number;
    height: number;
}

const clamp01 = (n: number): number => (n < 0 ? 0 : n > 1 ? 1 : n);

/**
 * Map a pointer position (client x/y) within the area's bounding rect to `{ x, y } ∈ [0,1]²`. The DOM y
 * grows downward, so it is flipped: a pointer at the TOP yields y = 1 (max brightness). Both axes clamp,
 * so a drag past the edge pins to the border.
 */
export function resolveAreaPosition(pointer: { x: number; y: number }, rect: AreaRect): AreaPosition {
    const x = rect.width === 0 ? 0 : (pointer.x - rect.left) / rect.width;
    const y = rect.height === 0 ? 0 : (pointer.y - rect.top) / rect.height;
    return { x: clamp01(x), y: clamp01(1 - y) };
}

export interface StepOptions {
    /** Fine step per arrow press (default 0.01 = 1%). */
    step?: number;
    /** Shift (or Page keys) multiply the step (default 10× → 10%). */
    shift?: boolean;
    /** RTL swaps the horizontal Left/Right → saturation mapping. */
    rtl?: boolean;
}

/**
 * Resolve the next area position for a keyboard event, or `null` when the key is not a navigation key
 * (so the caller can leave the event alone). Arrows move by `step`; Shift-arrow and Page keys by the
 * large step; Home/End jump saturation to its ends. Up increases brightness (y). Everything clamps.
 */
export function stepAreaPosition(pos: AreaPosition, key: string, opts: StepOptions = {}): AreaPosition | null {
    const step = opts.step ?? 0.01;
    const big = step * 10;
    const forward = opts.rtl ? 'ArrowLeft' : 'ArrowRight';
    const backward = opts.rtl ? 'ArrowRight' : 'ArrowLeft';
    const d = opts.shift ? big : step;

    let { x, y } = pos;
    switch (key) {
        case forward:
            x += d;
            break;
        case backward:
            x -= d;
            break;
        case 'ArrowUp':
            y += d;
            break;
        case 'ArrowDown':
            y -= d;
            break;
        case 'PageUp':
            y += big;
            break;
        case 'PageDown':
            y -= big;
            break;
        case 'Home':
            x = 0;
            break;
        case 'End':
            x = 1;
            break;
        default:
            return null;
    }
    return { x: clamp01(x), y: clamp01(y) };
}
