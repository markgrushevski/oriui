import { test, expect, type Page } from '@playwright/test';
import path from 'node:path';

// The built standalone CSS layer — e2e loads it and drops in raw `.ori-*` markup (the htmx / plain-HTML
// story), then lets the Popover API open the panel. We assert REAL geometry: the `.ori-anchored`
// placement + the `position-try` collision flip — exactly what the happy-dom unit suite can't see.
const CSS = path.resolve('packages/css/dist/styles.css');

async function setup(page: Page, body: string): Promise<void> {
    await page.setContent(`<!doctype html><html><head></head><body>${body}</body></html>`);
    await page.addStyleTag({ path: CSS });
}

const popover = (placement: string, triggerStyle: string, panelStyle = ''): string =>
    `<button id="t" popovertarget="p" style="anchor-name:--a;${triggerStyle}">Open</button>
     <div id="p" popover class="ori-popover ori-anchored ori-anchored_${placement}"
          style="--ori-anchor:--a;${panelStyle}" aria-label="Panel">Panel content</div>`;

async function open(page: Page): Promise<void> {
    await page.click('#t');
    await page.locator('#p').waitFor({ state: 'visible' });
}

test.describe('.ori-anchored placement + flip (real Chromium)', () => {
    test('bottom: panel opens below the trigger, start-aligned', async ({ page }) => {
        await setup(page, popover('bottom', 'position:absolute;top:100px;left:120px;'));
        await open(page);
        const t = (await page.locator('#t').boundingBox())!;
        const p = (await page.locator('#p').boundingBox())!;
        expect(p.y).toBeGreaterThanOrEqual(t.y + t.height - 1); // below the trigger
        expect(Math.abs(p.x - t.x)).toBeLessThan(4); // inline-start aligned
    });

    test('top: panel opens above the trigger', async ({ page }) => {
        await setup(page, popover('top', 'position:absolute;top:320px;left:120px;'));
        await open(page);
        const t = (await page.locator('#t').boundingBox())!;
        const p = (await page.locator('#p').boundingBox())!;
        expect(p.y + p.height).toBeLessThanOrEqual(t.y + 1); // above the trigger
    });

    test('right: panel opens to the inline-end of the trigger', async ({ page }) => {
        await setup(page, popover('right', 'position:absolute;top:120px;left:120px;'));
        await open(page);
        const t = (await page.locator('#t').boundingBox())!;
        const p = (await page.locator('#p').boundingBox())!;
        expect(p.x).toBeGreaterThanOrEqual(t.x + t.width - 1); // to the inline-end
    });

    test('collision flip: a bottom popover near the viewport floor flips above', async ({ page }) => {
        await page.setViewportSize({ width: 800, height: 600 });
        // Trigger near the bottom; a tall panel can't fit below → position-try flip-block moves it above.
        await setup(
            page,
            popover('bottom', 'position:absolute;top:560px;left:120px;', 'max-height:none;height:220px;')
        );
        await open(page);
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
               <ul class="ori-combobox__listbox ori-anchored ori-anchored_bottom" style="--ori-anchor:--c;">
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
