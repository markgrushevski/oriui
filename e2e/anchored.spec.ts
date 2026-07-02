import { test, expect, type Page } from '@playwright/test';
import path from 'node:path';

// Behaviours the placement-grid spec doesn't cover: the `position-try` collision flip and the combobox
// listbox retrofit. The full 12-value placement geometry lives in placement-grid.spec.ts.
const CSS = path.resolve('packages/css/dist/styles.css');

async function setup(page: Page, body: string): Promise<void> {
    await page.setContent(`<!doctype html><html><head></head><body>${body}</body></html>`);
    await page.addStyleTag({ path: CSS });
}

test.describe('.ori-anchored — flip + combobox (real Chromium)', () => {
    test('collision flip: a bottom popover near the viewport floor flips above', async ({ page }) => {
        await page.setViewportSize({ width: 800, height: 600 });
        // Trigger near the bottom; a tall panel can't fit below → position-try flip-block moves it above.
        await setup(
            page,
            `<button id="t" popovertarget="p" style="anchor-name:--a;position:absolute;top:560px;left:120px;">Open</button>
             <div id="p" popover class="ori-popover ori-anchored ori-anchored_bottom-start"
                  style="--ori-anchor:--a;max-height:none;height:220px;" aria-label="Panel">tall</div>`
        );
        await page.click('#t');
        await page.locator('#p').waitFor({ state: 'visible' });
        const t = (await page.locator('#t').boundingBox())!;
        const p = (await page.locator('#p').boundingBox())!;
        expect(p.y + p.height).toBeLessThanOrEqual(t.y + 2); // flipped ABOVE the trigger
    });

    test('combobox listbox floats below the control at (at least) control width', async ({ page }) => {
        await setup(
            page,
            `<div class="ori-combobox" style="width:240px;">
               <div class="ori-combobox__control" style="anchor-name:--c;">
                 <input class="ori-input__field ori-combobox__input" style="width:100%" />
               </div>
               <ul class="ori-combobox__listbox ori-anchored ori-anchored_bottom-start" style="--ori-anchor:--c;">
                 <li class="ori-combobox__option">Apple</li>
                 <li class="ori-combobox__option">Banana</li>
               </ul>
             </div>`
        );
        const ctrl = (await page.locator('.ori-combobox__control').boundingBox())!;
        const list = (await page.locator('.ori-combobox__listbox').boundingBox())!;
        expect(list.y).toBeGreaterThanOrEqual(ctrl.y + ctrl.height - 1); // below the control
        expect(list.width).toBeGreaterThanOrEqual(ctrl.width - 2); // min-width: anchor-size(width)
    });
});
