import { test, expect, type Page } from '@playwright/test';
import path from 'node:path';

// Verifies the full 12-value `.ori-anchored_<side>[-<align>]` placement grid in real Chromium — the
// exact geometry (side + start/center/end alignment) that happy-dom cannot compute. The panel is sized
// smaller than the trigger on both axes so start / center / end are distinguishable.
const CSS = path.resolve('packages/css/dist/styles.css');

type Side = 'below' | 'above' | 'left' | 'right';
type Align = 'start' | 'center' | 'end';

const CASES: { placement: string; side: Side; align: Align }[] = [
    { placement: 'bottom', side: 'below', align: 'center' },
    { placement: 'bottom-start', side: 'below', align: 'start' },
    { placement: 'bottom-end', side: 'below', align: 'end' },
    { placement: 'top', side: 'above', align: 'center' },
    { placement: 'top-start', side: 'above', align: 'start' },
    { placement: 'top-end', side: 'above', align: 'end' },
    { placement: 'left', side: 'left', align: 'center' },
    { placement: 'left-start', side: 'left', align: 'start' },
    { placement: 'left-end', side: 'left', align: 'end' },
    { placement: 'right', side: 'right', align: 'center' },
    { placement: 'right-start', side: 'right', align: 'start' },
    { placement: 'right-end', side: 'right', align: 'end' }
];

async function boxes(page: Page, placement: string) {
    // Trigger centred with room on every side; panel 80x60 vs trigger 120x40 → alignments differ.
    await page.setContent(`<!doctype html><html><body>
      <button id="t" popovertarget="p" style="anchor-name:--a;position:absolute;top:320px;left:560px;width:120px;height:40px;">T</button>
      <div id="p" popover class="ori-popover ori-anchored ori-anchored_${placement}" style="--ori-anchor:--a;min-width:0;width:80px;height:60px;" aria-label="P">P</div>
    </body></html>`);
    await page.addStyleTag({ path: CSS });
    await page.click('#t');
    await page.locator('#p').waitFor({ state: 'visible' });
    const t = (await page.locator('#t').boundingBox())!;
    const p = (await page.locator('#p').boundingBox())!;
    return { t, p };
}

const NEAR = 2;
const cx = (b: { x: number; width: number }) => b.x + b.width / 2;
const cy = (b: { y: number; height: number }) => b.y + b.height / 2;

for (const c of CASES) {
    test(`placement ${c.placement} → ${c.side}, ${c.align}-aligned`, async ({ page }) => {
        const { t, p } = await boxes(page, c.placement);

        if (c.side === 'below') expect(p.y).toBeGreaterThanOrEqual(t.y + t.height - 1);
        if (c.side === 'above') expect(p.y + p.height).toBeLessThanOrEqual(t.y + 1);
        if (c.side === 'left') expect(p.x + p.width).toBeLessThanOrEqual(t.x + 1);
        if (c.side === 'right') expect(p.x).toBeGreaterThanOrEqual(t.x + t.width - 1);

        if (c.side === 'below' || c.side === 'above') {
            if (c.align === 'center') expect(Math.abs(cx(p) - cx(t))).toBeLessThan(NEAR);
            if (c.align === 'start') expect(Math.abs(p.x - t.x)).toBeLessThan(NEAR);
            if (c.align === 'end') expect(Math.abs(p.x + p.width - (t.x + t.width))).toBeLessThan(NEAR);
        } else {
            if (c.align === 'center') expect(Math.abs(cy(p) - cy(t))).toBeLessThan(NEAR);
            if (c.align === 'start') expect(Math.abs(p.y - t.y)).toBeLessThan(NEAR);
            if (c.align === 'end') expect(Math.abs(p.y + p.height - (t.y + t.height))).toBeLessThan(NEAR);
        }
    });
}
