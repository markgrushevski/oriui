import { describe, it, expect } from 'vitest';
import { rovingIntent, resolveRovingIndex } from '@oriui/headless';

// Direct unit tests for the shared core roving helpers (previously exercised only transitively through
// the Toolbar / Tabs). The `isEnabled` branch was added so Tabs can skip disabled tabs while the toolbar
// keeps visiting every item — both paths are pinned here.

describe('rovingIntent', () => {
    it('maps horizontal keys, swapping Left/Right under RTL', () => {
        expect(rovingIntent('ArrowRight', 'horizontal')).toBe('next');
        expect(rovingIntent('ArrowLeft', 'horizontal')).toBe('prev');
        expect(rovingIntent('ArrowRight', 'horizontal', 'rtl')).toBe('prev');
        expect(rovingIntent('ArrowLeft', 'horizontal', 'rtl')).toBe('next');
        expect(rovingIntent('Home')).toBe('first');
        expect(rovingIntent('End')).toBe('last');
        expect(rovingIntent('ArrowUp', 'horizontal')).toBeNull();
    });

    it('maps vertical keys (direction-independent)', () => {
        expect(rovingIntent('ArrowDown', 'vertical')).toBe('next');
        expect(rovingIntent('ArrowUp', 'vertical')).toBe('prev');
        expect(rovingIntent('ArrowRight', 'vertical')).toBeNull();
    });
});

describe('resolveRovingIndex — no skip predicate (toolbar visits every item)', () => {
    it('single-steps, wrapping with loop', () => {
        expect(resolveRovingIndex('next', 0, 3)).toBe(1);
        expect(resolveRovingIndex('next', 2, 3)).toBe(0);
        expect(resolveRovingIndex('prev', 0, 3)).toBe(2);
        expect(resolveRovingIndex('first', 2, 3)).toBe(0);
        expect(resolveRovingIndex('last', 0, 3)).toBe(2);
    });

    it('clamps at the ends when loop is off', () => {
        expect(resolveRovingIndex('next', 2, 3, false)).toBe(2);
        expect(resolveRovingIndex('prev', 0, 3, false)).toBe(0);
    });

    it('returns -1 for an empty set; from=-1 lands on an end', () => {
        expect(resolveRovingIndex('next', 0, 0)).toBe(-1);
        expect(resolveRovingIndex('next', -1, 3)).toBe(0);
        expect(resolveRovingIndex('prev', -1, 3)).toBe(2);
    });
});

describe('resolveRovingIndex — with an isEnabled predicate (tabs skip disabled)', () => {
    // [enabled, DISABLED, enabled, DISABLED, enabled]
    const enabled = (i: number) => i === 0 || i === 2 || i === 4;

    it('steps over disabled indices in the intent direction, wrapping', () => {
        expect(resolveRovingIndex('next', 0, 5, true, enabled)).toBe(2);
        expect(resolveRovingIndex('next', 2, 5, true, enabled)).toBe(4);
        expect(resolveRovingIndex('next', 4, 5, true, enabled)).toBe(0);
        expect(resolveRovingIndex('prev', 2, 5, true, enabled)).toBe(0);
        expect(resolveRovingIndex('prev', 0, 5, true, enabled)).toBe(4);
    });

    it('first / last land on the first / last ENABLED index', () => {
        const ends = (i: number) => i !== 0 && i !== 3; // [DIS, en, en, DIS]
        expect(resolveRovingIndex('first', 0, 4, true, ends)).toBe(1);
        expect(resolveRovingIndex('last', 0, 4, true, ends)).toBe(2);
    });

    it('returns -1 when no enabled index is reachable', () => {
        expect(resolveRovingIndex('next', 0, 3, true, () => false)).toBe(-1);
        // no loop + an all-disabled tail → nothing before the edge
        expect(resolveRovingIndex('next', 0, 3, false, (i) => i === 0)).toBe(-1);
    });
});
