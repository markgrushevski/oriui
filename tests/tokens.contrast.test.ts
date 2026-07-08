import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, it, expect } from 'vitest';
import { colord, extend } from 'colord';
import a11yPlugin from 'colord/plugins/a11y';

/**
 * Design-token contrast guard. oriUI promises that every colour role ships a contrast-checked
 * `--ori-color-on-*` pair, across light/dark and every preset skin. This test makes that promise
 * executable: it reads the token CSS, resolves `var(--ori-neutral-*)` references, and asserts the
 * WCAG contrast ratio of each role/on-role pairing meets AA for body text (>= 4.5:1). A failed
 * skin pairing names itself, so a regression points straight at the offending token.
 */

// The WCAG 2.x contrast math is colord's job (its a11y plugin), so the ratios track a maintained
// reference implementation instead of a hand-rolled one. colord parses hex, the legacy `hsl(h, s%, l%)`
// AND the modern space-separated `hsl(h s% l%)` used by some skins, so token values pass through as-is.
extend([a11yPlugin]);

const contrast = (fg: string, bg: string): number => colord(fg).contrast(bg);

// ---- Load + parse the token CSS ----
const themesDir = resolve(process.cwd(), 'packages/css/src/themes');
const baseCss = readFileSync(resolve(themesDir, '_themes-color-tokens.css'), 'utf8');
const skinsCss = readFileSync(resolve(themesDir, '_themes-skins.css'), 'utf8');

// Neutral ramp — the single source for var(--ori-neutral-N) references used by some skins.
const neutrals: Record<string, string> = {};
for (const [, name, hex] of baseCss.matchAll(/(--ori-neutral-\d+)\s*:\s*(#[0-9a-fA-F]{3,8})/g)) {
    neutrals[name] = hex;
}

// A colour value is usable if it's a literal hex, a literal hsl(), or a var() pointing at the neutral
// ramp; `var(--ori-color-*)` alias references resolve elsewhere and are skipped (not source colours).
function resolveValue(raw: string): string | null {
    const v = raw.trim().replace(/;$/, '');
    if (/^#[0-9a-fA-F]{3,8}$/.test(v)) return v;
    if (/^hsla?\(/.test(v)) return colord(v).isValid() ? v : null;
    const ref = v.match(/^var\(\s*(--ori-neutral-\d+)\s*\)$/);
    return ref ? (neutrals[ref[1]] ?? null) : null;
}

// Strip comments + the single `@layer ori.tokens { ... }` wrapper so what's left is a flat list
// of `selector { decls }` blocks with no nesting (each file has exactly one such wrapper).
function flatBlocks(css: string): Array<{ selector: string; tokens: Record<string, string> }> {
    const noComments = css.replace(/\/\*[\s\S]*?\*\//g, '');
    const open = noComments.indexOf('{', noComments.indexOf('@layer'));
    const flat = noComments.slice(open + 1, noComments.lastIndexOf('}'));

    const blocks: Array<{ selector: string; tokens: Record<string, string> }> = [];
    for (const m of flat.matchAll(/([^{}]+)\{([^{}]+)\}/g)) {
        const tokens: Record<string, string> = {};
        for (const [, name, val] of m[2].matchAll(/(--ori-color-[\w-]+)\s*:\s*([^;]+);/g)) {
            const resolved = resolveValue(val);
            if (resolved) tokens[name] = resolved;
        }
        blocks.push({ selector: m[1].trim(), tokens });
    }
    return blocks;
}

// ---- Build the list of (skin, role, mode) pairings to check ----
const ROLES = ['primary', 'secondary', 'surface', 'background'] as const;
const STATUS = ['success', 'warn', 'danger', 'info'] as const;
const MODES = ['light', 'dark'] as const;
const AA = 4.5;

// Recorded contrast debt — pairings known to sit below AA, kept visible instead of silently passing.
// An entry needs a DECISIONS.md rationale; remove it the moment the pairing is fixed (a stale entry
// fails the guard below). Key: the pair label; value: the accepted minimum ratio.
const KNOWN_BELOW_AA: Record<string, number> = {};

type Pair = { label: string; fg: string; bg: string };
const pairs: Pair[] = [];

for (const css of [baseCss, skinsCss]) {
    for (const { selector, tokens } of flatBlocks(css)) {
        const skinMatch = selector.match(/data-ori-skin=['"]([\w-]+)['"]/);
        // The base "Ori" skin is the bare :root block that actually carries role source tokens
        // (the neutral-ramp :root block carries none, so it's skipped here).
        const isBaseOri = !skinMatch && selector === ':root' && '--ori-color-primary-light' in tokens;
        const skin = skinMatch ? skinMatch[1] : isBaseOri ? 'ori' : null;
        if (!skin) continue;

        for (const role of ROLES) {
            for (const mode of MODES) {
                const bg = tokens[`--ori-color-${role}-${mode}`];
                const fg = tokens[`--ori-color-on-${role}-${mode}`];
                if (bg && fg) pairs.push({ label: `${skin} · ${role} (${mode})`, fg, bg });
            }
        }

        if (skin === 'ori') {
            for (const role of STATUS) {
                const bg = tokens[`--ori-color-${role}`];
                const fg = tokens[`--ori-color-on-${role}`];
                if (bg && fg) pairs.push({ label: `status · ${role}`, fg, bg });
            }
        }
    }
}

describe('Design-token contrast (WCAG AA for body text, >= 4.5:1)', () => {
    it('discovers every role/on-role pairing across all skins', () => {
        // base Ori: 4 roles x 2 modes (8) + 4 status (4); 7 preset skins x 4 roles x 2 modes (56).
        expect(pairs.length).toBeGreaterThanOrEqual(8 + 4 + 7 * 8);
    });

    it('the KNOWN_BELOW_AA exception list carries no stale entries', () => {
        const labels = new Set(pairs.map((p) => p.label));
        const stale = Object.keys(KNOWN_BELOW_AA).filter((label) => !labels.has(label));
        expect(stale, `exceptions for pairings that no longer exist: ${stale.join(', ')}`).toEqual([]);
        for (const { label, fg, bg } of pairs) {
            if (label in KNOWN_BELOW_AA && contrast(fg, bg) >= AA) {
                expect.fail(`${label} now meets AA — remove its KNOWN_BELOW_AA entry`);
            }
        }
    });

    for (const { label, fg, bg } of pairs) {
        const floor = KNOWN_BELOW_AA[label] ?? AA;
        const debt = label in KNOWN_BELOW_AA ? ' [recorded contrast debt — below AA]' : '';
        it(`${label}: ${fg} on ${bg}${debt}`, () => {
            const ratio = contrast(fg, bg);
            expect(ratio, `${label} -> ${ratio.toFixed(2)}:1 (need >= ${floor})`).toBeGreaterThanOrEqual(floor);
        });
    }
});
