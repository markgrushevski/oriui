import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, it, expect } from 'vitest';

/**
 * Design-token contrast guard. oriUI promises that every colour role ships a contrast-checked
 * `--ori-color-on-*` pair, across light/dark and every preset skin. This test makes that promise
 * executable: it reads the token CSS, resolves `var(--ori-neutral-*)` references, and asserts the
 * WCAG contrast ratio of each role/on-role pairing meets AA for body text (>= 4.5:1). A failed
 * skin pairing names itself, so a regression points straight at the offending token.
 */

// ---- WCAG 2.x relative-luminance contrast math ----
function toRgb(hex: string): [number, number, number] {
    const h = hex.replace('#', '').trim();
    const full = h.length === 3 ? [...h].map((c) => c + c).join('') : h;
    const n = parseInt(full.slice(0, 6), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function luminance(hex: string): number {
    const [r, g, b] = toRgb(hex).map((c) => {
        const s = c / 255;
        return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(a: string, b: string): number {
    const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
    return (hi + 0.05) / (lo + 0.05);
}

// ---- Load + parse the token CSS ----
const themesDir = resolve(process.cwd(), 'packages/css/src/themes');
const baseCss = readFileSync(resolve(themesDir, '_themes-color-tokens.css'), 'utf8');
const skinsCss = readFileSync(resolve(themesDir, '_themes-skins.css'), 'utf8');

// Neutral ramp — the single source for var(--ori-neutral-N) references used by some skins.
const neutrals: Record<string, string> = {};
for (const [, name, hex] of baseCss.matchAll(/(--ori-neutral-\d+)\s*:\s*(#[0-9a-fA-F]{3,8})/g)) {
    neutrals[name] = hex;
}

// A colour value is usable if it's a literal hex or a var() pointing at the neutral ramp;
// `var(--ori-color-*)` alias references resolve elsewhere and are skipped (not source colours).
function resolveValue(raw: string): string | null {
    const v = raw.trim().replace(/;$/, '');
    if (/^#[0-9a-fA-F]{3,8}$/.test(v)) return v;
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
        // base Ori: 4 roles x 2 modes (8) + 4 status (4); 6 preset skins x 4 roles x 2 modes (48).
        expect(pairs.length).toBeGreaterThanOrEqual(8 + 4 + 6 * 8);
    });

    for (const { label, fg, bg } of pairs) {
        it(`${label}: ${fg} on ${bg}`, () => {
            const ratio = contrast(fg, bg);
            expect(ratio, `${label} -> ${ratio.toFixed(2)}:1 (need >= ${AA})`).toBeGreaterThanOrEqual(AA);
        });
    }
});
