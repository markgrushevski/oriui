import { test, expect, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';
import path from 'node:path';

// rem-scaling contract, both halves of the px → rem token migration:
//   1. DEFAULT-ROOT REGRESSION — at the browser-default root (16px) every key dimension computes the
//      exact historical px value (2.75rem ≡ 44px, …): the migration is a pixel-perfect no-op for
//      anyone who never touches font settings.
//   2. SCALING — bump the root to 20px and the same dimensions scale by exactly ×1.25, because the
//      size/font scales are rem. That is the point of the migration: components now follow the user's
//      browser font-size preference, not only zoom. What must NOT scale stays put: 1px hairline
//      borders and the 9999px `rounded` pill cap are px on purpose.
// Reuses the reset-independence fixture (real markup for every component) + the built dist bundle.
const STYLES = path.resolve('packages/css/dist/styles.css');
const FIXTURE = readFileSync(path.resolve('e2e/fixtures/reset-independence.html'), 'utf8');

// One probe per token family, on fixture nodes whose computed geometry resolves the raw scale:
// action (button height), font (md on button, derived sm on tag), gap (md on stack, derived xl as
// card padding), radius (derived lg on card, derived sm on kbd) — plus the two px sentinels.
const PROBES = [
    // --ori-size-action_md (2.75rem): .ori-button height = max(2.5em = 40px, action_md) → action wins.
    {
        name: 'button height (action_md)',
        selector: '[data-c="button"] .ori-button',
        property: 'height',
        base: '44px',
        scaled: '55px'
    },
    // --ori-font-size_md (1rem) on the button block.
    {
        name: 'button font-size (font_md)',
        selector: '[data-c="button"] .ori-button',
        property: 'font-size',
        base: '16px',
        scaled: '20px'
    },
    // --ori-font-size_sm — calc()-derived: 1rem − 0.125rem = 0.875rem.
    {
        name: 'tag font-size (font_sm)',
        selector: '[data-c="tag"] .ori-tag',
        property: 'font-size',
        base: '14px',
        scaled: '17.5px'
    },
    // --ori-size-gap_md (0.5rem) via the `.ori-size-gap_md` utility on the stack.
    {
        name: 'stack gap (gap_md)',
        selector: '[data-c="stack"] .ori-stack',
        property: 'row-gap',
        base: '8px',
        scaled: '10px'
    },
    // --ori-size-gap_xl — calc()-derived: 0.5rem + 0.125rem × 4 = 1rem (card padding).
    {
        name: 'card padding (gap_xl)',
        selector: '[data-c="card"] .ori-card',
        property: 'padding-top',
        base: '16px',
        scaled: '20px'
    },
    // --ori-size-radius_lg — calc()-derived: 0.5rem + 0.125rem × 2 = 0.75rem.
    {
        name: 'card radius (radius_lg)',
        selector: '[data-c="card"] .ori-card',
        property: 'border-top-left-radius',
        base: '12px',
        scaled: '15px'
    },
    // --ori-size-radius_sm — calc()-derived: 0.5rem − 0.125rem × 2 = 0.25rem.
    {
        name: 'kbd radius (radius_sm)',
        selector: '[data-c="kbd"] .ori-kbd',
        property: 'border-top-left-radius',
        base: '4px',
        scaled: '5px'
    },
    // px sentinel: hairline borders must NOT scale with the root font-size.
    {
        name: 'button hairline border (px)',
        selector: '[data-c="button"] .ori-button',
        property: 'border-top-width',
        base: '1px',
        scaled: '1px'
    },
    // px sentinel: the `rounded` cap is "always a pill", not a length on the scale.
    {
        name: 'button rounded cap (px)',
        selector: '[data-c="button"] .ori-button',
        property: 'border-top-left-radius',
        base: '9999px',
        scaled: '9999px'
    }
];

async function measure(page: Page): Promise<Record<string, string>> {
    return page.evaluate(
        (probes: { name: string; selector: string; property: string }[]) => {
            const values: Record<string, string> = {};
            for (const probe of probes) {
                const el = document.querySelector(probe.selector);
                if (!el) throw new Error(`probe target missing: ${probe.selector}`);
                values[probe.name] = getComputedStyle(el).getPropertyValue(probe.property);
            }
            return values;
        },
        PROBES.map(({ name, selector, property }) => ({ name, selector, property }))
    );
}

test.describe('rem token scales — pixel-identical at the 16px default, ×1.25 at a 20px root', () => {
    test.beforeEach(async ({ page }) => {
        await page.setViewportSize({ width: 1280, height: 720 });
        await page.setContent(
            `<!doctype html><html><head></head><body><main id="fixture">${FIXTURE}</main></body></html>`
        );
        await page.addStyleTag({ path: STYLES });
        // Surfaces transition colors on stylesheet load — freeze, so computed reads are settled values.
        await page.addStyleTag({ content: '* { transition: none !important; animation: none !important; }' });
    });

    test('default root (16px): every probe computes the exact historical px value', async ({ page }) => {
        const values = await measure(page);
        for (const probe of PROBES) {
            expect(values[probe.name], `${probe.name} — ${probe.property} of ${probe.selector}`).toBe(probe.base);
        }
    });

    test('20px root: rem probes scale by exactly 1.25, px hairlines and the pill cap do not', async ({ page }) => {
        await page.evaluate(() => {
            document.documentElement.style.fontSize = '20px';
        });
        const values = await measure(page);
        for (const probe of PROBES) {
            expect(values[probe.name], `${probe.name} — ${probe.property} of ${probe.selector}`).toBe(probe.scaled);
        }
    });
});
