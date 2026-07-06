import { test, expect, type Page } from '@playwright/test';
import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';

// Reset-independence contract: every component must compute IDENTICAL styles whether the consumer
// imported base.css (tokens + the global reset) or tokens.css alone (bring-your-own-reset). The same
// fixture — minimal markup for every components/*.css file — renders twice in real Chromium, and every
// element's computed style is diffed property-by-property across the two foundations. A mismatch means
// a component leans on the reset's zeroing instead of declaring its own UA neutralization.
const DIST = path.resolve('packages/css/dist');
const TOKENS = path.join(DIST, 'tokens.css');
const BASE = path.join(DIST, 'base.css');
const COMPONENTS = readdirSync(path.join(DIST, 'components'))
    .filter((file) => file.endsWith('.css'))
    .map((file) => path.join(DIST, 'components', file));

const FIXTURE = readFileSync(path.resolve('e2e/fixtures/reset-independence.html'), 'utf8');

// The UA-default surface the reset (box-sizing + margin/padding/border zeroing) can touch, plus the
// font/color/list/decoration channels components must own themselves (the reset never set fonts — a
// component that renders differently here is relying on UA defaults, not on oriUI styles).
const PROPERTIES = [
    'box-sizing',
    'margin-top',
    'margin-right',
    'margin-bottom',
    'margin-left',
    'padding-top',
    'padding-right',
    'padding-bottom',
    'padding-left',
    'border-top-width',
    'border-right-width',
    'border-bottom-width',
    'border-left-width',
    'border-top-style',
    'border-right-style',
    'border-bottom-style',
    'border-left-style',
    'font-family',
    'font-size',
    'font-weight',
    'line-height',
    'background-color',
    'color',
    'list-style-type',
    'text-decoration-line'
];

interface ElementSnapshot {
    selector: string;
    styles: Record<string, string>;
}

// Render the fixture under one foundation entry (+ every dist component file) and read the computed
// value of each contract property for every element. Elements are labelled by their nearest data-c
// wrapper + tag + classes (+ an occurrence counter), so a failing diff names the exact node.
async function snapshot(page: Page, foundation: string): Promise<ElementSnapshot[]> {
    await page.setContent(`<!doctype html><html><head></head><body><main id="fixture">${FIXTURE}</main></body></html>`);
    await page.addStyleTag({ path: foundation });
    for (const component of COMPONENTS) await page.addStyleTag({ path: component });
    // Surfaces transition background/color on stylesheet load (UA default → token value), so a raw
    // getComputedStyle read samples mid-transition values at a nondeterministic progress. Freeze both
    // renders identically — this affects timing only, never the settled value under comparison.
    await page.addStyleTag({ content: '* { transition: none !important; animation: none !important; }' });

    return page.evaluate((properties: string[]) => {
        const root = document.getElementById('fixture');
        if (!root) throw new Error('fixture root missing');
        const elements = Array.from(root.querySelectorAll('*')).filter(
            (el) =>
                // The unclassed data-c wrappers are fixture scaffolding — consumer-land, where the
                // consumer's own reset choice governs; only what is INSIDE component markup is under
                // contract.
                !el.hasAttribute('data-c') &&
                // <option> renders inside the native picker, not the page, so its UA padding is not
                // part of the component contract (no author rule should chase native-picker internals).
                el.tagName !== 'OPTION'
        );
        const seen = new Map<string, number>();

        return elements.map((el) => {
            const host = el.closest('[data-c]')?.getAttribute('data-c') ?? '?';
            const classes = el.classList.length > 0 ? `.${Array.from(el.classList).join('.')}` : '';
            const base = `[${host}] ${el.tagName.toLowerCase()}${classes}`;
            const occurrence = (seen.get(base) ?? 0) + 1;
            seen.set(base, occurrence);
            const selector = occurrence > 1 ? `${base} (#${occurrence})` : base;

            const computed = getComputedStyle(el);
            const styles: Record<string, string> = {};
            for (const property of properties) styles[property] = computed.getPropertyValue(property);
            return { selector, styles };
        });
    }, PROPERTIES);
}

test.describe('reset independence — tokens.css alone vs base.css (real Chromium)', () => {
    test('the fixture covers every dist component file', () => {
        const missing = COMPONENTS.map((file) => path.basename(file, '.css')).filter(
            (name) => !FIXTURE.includes(`data-c="${name}"`)
        );
        expect(missing, `add fixture markup (data-c) for: ${missing.join(', ')}`).toEqual([]);
    });

    test('every component computes identical styles with and without the reset', async ({ page }) => {
        await page.setViewportSize({ width: 1280, height: 720 });

        const bare = await snapshot(page, TOKENS); // side A: tokens only — no reset
        const reset = await snapshot(page, BASE); // side B: base = tokens + reset

        expect(reset.length).toBe(bare.length);

        const diffs: string[] = [];
        bare.forEach((element, index) => {
            const twin = reset[index];
            for (const property of PROPERTIES) {
                const a = element.styles[property];
                const b = twin.styles[property];
                if (a !== b)
                    diffs.push(`${element.selector} — ${property}: "${a}" (tokens only) vs "${b}" (with reset)`);
            }
        });

        expect(diffs, `components must not rely on reset.css — UA-default leaks found:\n${diffs.join('\n')}`).toEqual(
            []
        );
    });
});
