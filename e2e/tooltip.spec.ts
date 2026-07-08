import { test, expect, type Page } from '@playwright/test';
import path from 'node:path';

// OriTooltip geometry + colour contracts that happy-dom can't verify: the .ori-anchored retrofit
// (collision flip at the viewport edge, anchor-center shift on the inline axis, the shared default
// anchor-name pairing each bubble with ITS OWN trigger) and the bg/text pairing fix (the bubble's
// dedicated neutral defaults vs. the globally-defined --ori-color/--ori-color-on aliases, which a
// host app's ambient ink used to bleed through — black-on-black text).
const CSS = path.resolve('packages/css/dist/styles.css');

const NEUTRAL_900 = 'rgb(15, 23, 42)'; // --ori-neutral-900 #0f172a
const NEUTRAL_50 = 'rgb(248, 250, 252)'; // --ori-neutral-50  #f8fafc
const PRIMARY_LIGHT = 'rgb(3, 105, 161)'; // --ori-color-primary-light #0369a1

function tooltip(id: string, opts: { content?: string; placement?: string; extra?: string } = {}): string {
    const { content = 'Helpful hint', placement = 'top', extra = '' } = opts;
    return `<span class="ori-tooltip ${extra}" id="${id}">
        <span class="ori-tooltip__trigger" aria-describedby="${id}-bubble">
            <button type="button">trigger</button>
        </span>
        <span id="${id}-bubble" class="ori-tooltip__bubble ori-anchored ori-anchored_${placement}" role="tooltip">${content}</span>
    </span>`;
}

async function setup(page: Page, body: string): Promise<void> {
    await page.setContent(`<!doctype html><html><head></head><body>${body}</body></html>`);
    await page.addStyleTag({ path: CSS });
}

test.describe('OriTooltip — anchored placement + colour pairing (real Chromium)', () => {
    test('default bubble pairs its own neutral bg + text even when the ambient ink is near-black', async ({ page }) => {
        // The regression: with body colour ≈ neutral-900 the old var(--ori-color)/var(--ori-color-on)
        // reads resolved BOTH to currentColor — a dark chip with dark (invisible) text.
        await setup(page, `<div style="color: #0f172a; padding: 100px;">${tooltip('t')}</div>`);
        const bubble = page.locator('#t-bubble');
        const colors = await bubble.evaluate((el) => {
            const s = getComputedStyle(el);
            return { bg: s.backgroundColor, text: s.color };
        });
        expect(colors.bg).toBe(NEUTRAL_900);
        expect(colors.text).toBe(NEUTRAL_50);
        expect(colors.bg).not.toBe(colors.text);
    });

    test('a colour role class repoints bg + text as a pair from that role', async ({ page }) => {
        await setup(page, `<div style="padding: 100px;">${tooltip('t', { extra: 'ori-color_primary' })}</div>`);
        const colors = await page.locator('#t-bubble').evaluate((el) => {
            const s = getComputedStyle(el);
            return { bg: s.backgroundColor, text: s.color };
        });
        expect(colors.bg).toBe(PRIMARY_LIGHT);
        expect(colors.text).toBe('rgb(255, 255, 255)'); // --ori-color-on-primary-light
    });

    test('placement="top" flips below the trigger at the viewport top edge (the top:-23px bug)', async ({ page }) => {
        await page.setViewportSize({ width: 800, height: 600 });
        await setup(page, `<div style="position:absolute;top:2px;left:300px;">${tooltip('t')}</div>`);
        await page.hover('#t');
        const t = (await page.locator('#t .ori-tooltip__trigger').boundingBox())!;
        const b = (await page.locator('#t-bubble').boundingBox())!;
        expect(b.y).toBeGreaterThanOrEqual(0); // on-screen, not clipped above
        expect(b.y).toBeGreaterThanOrEqual(t.y + t.height - 1); // flipped BELOW the trigger
    });

    test('placement="top" with room renders above, centred on the trigger', async ({ page }) => {
        await page.setViewportSize({ width: 800, height: 600 });
        await setup(page, `<div style="position:absolute;top:300px;left:300px;">${tooltip('t')}</div>`);
        await page.hover('#t');
        const t = (await page.locator('#t .ori-tooltip__trigger').boundingBox())!;
        const b = (await page.locator('#t-bubble').boundingBox())!;
        expect(b.y + b.height).toBeLessThanOrEqual(t.y + 1); // above
        expect(Math.abs(b.x + b.width / 2 - (t.x + t.width / 2))).toBeLessThan(2); // centred
    });

    test('anchor-center shifts the bubble back into view at the inline viewport edge', async ({ page }) => {
        await page.setViewportSize({ width: 800, height: 600 });
        // Trigger hugs the left edge; a centred wide bubble would start off-screen negative.
        await setup(
            page,
            `<div style="position:absolute;top:300px;left:0;">${tooltip('t', {
                content: 'A long tooltip that is much wider than its tiny trigger button',
                placement: 'bottom'
            })}</div>`
        );
        await page.hover('#t');
        const t = (await page.locator('#t .ori-tooltip__trigger').boundingBox())!;
        const b = (await page.locator('#t-bubble').boundingBox())!;
        expect(b.width).toBeGreaterThan(t.width); // genuinely wider than the trigger (no column squeeze)
        expect(b.x).toBeGreaterThanOrEqual(0); // shifted into view, not centred off-screen
    });

    test('the shared default anchor-name pairs each bubble with its own trigger', async ({ page }) => {
        await page.setViewportSize({ width: 800, height: 600 });
        await setup(
            page,
            `<div style="position:absolute;top:300px;left:100px;">${tooltip('a', { content: 'first' })}</div>
             <div style="position:absolute;top:300px;left:500px;">${tooltip('b', { content: 'second' })}</div>`
        );
        const ta = (await page.locator('#a .ori-tooltip__trigger').boundingBox())!;
        const tb = (await page.locator('#b .ori-tooltip__trigger').boundingBox())!;
        const ba = (await page.locator('#a-bubble').boundingBox())!;
        const bb = (await page.locator('#b-bubble').boundingBox())!;
        expect(Math.abs(ba.x + ba.width / 2 - (ta.x + ta.width / 2))).toBeLessThan(2);
        expect(Math.abs(bb.x + bb.width / 2 - (tb.x + tb.width / 2))).toBeLessThan(2);
    });

    test('the arrow sits on the bubble edge facing the trigger for the placement', async ({ page }) => {
        await page.setViewportSize({ width: 800, height: 600 });
        await setup(page, `<div style="position:absolute;top:300px;left:300px;">${tooltip('t')}</div>`);
        await page.hover('#t');
        // placement=top with room → bubble above, trigger below → the arrow sits on the BOTTOM edge.
        // (A pure-CSS arrow points at the requested side: the ::after can't anchor to the trigger — a
        // sibling of the bubble — nor observe a position-try flip, so it keys off the placement class.)
        const arrow = await page.locator('#t-bubble').evaluate((el) => {
            const s = getComputedStyle(el, '::after');
            return { top: parseFloat(s.top), height: el.getBoundingClientRect().height };
        });
        expect(Number.isFinite(arrow.top)).toBe(true);
        expect(arrow.top).toBeGreaterThan(arrow.height / 2); // sits in the bottom half, pointing down
    });
});
