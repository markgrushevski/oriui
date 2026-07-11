import { test, expect } from '@playwright/test';

// Interaction e2e for OriColorPicker's 2D saturation×brightness AREA — a CUSTOM pointer handler
// (onAreaPointerdown → setPointerCapture → pointermove → pointerup → commit), not a native range. This is
// the real drag geometry happy-dom can't run: `resolveAreaPosition` maps clientX/Y → saturation/value on a
// <div>, pointer capture keeps the drag glued to the area, and a whole drag must commit exactly ONCE
// (one undo entry) while streaming the live color. The harness (/#colorpicker) starts at #808080 and
// counts live updates (cp-inputs) vs commits (cp-changes).
test.describe('OriColorPicker — pointer drag on the SV area (real Chromium)', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/#colorpicker');
        await expect(page.locator('.ori-color-picker')).toBeVisible();
    });

    test('a drag streams live updates yet commits exactly once on release', async ({ page }) => {
        const area = page.locator('.ori-color-picker__area');
        const box = (await area.boundingBox())!;
        expect(box.width).toBeGreaterThan(0);

        // Press near the center, drag toward the top-right corner (max saturation + brightness), release.
        await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
        await page.mouse.down();
        await page.mouse.move(box.x + box.width - 3, box.y + 3, { steps: 8 });
        await page.mouse.up();

        // The live stream fired on multiple move ticks…
        expect(Number(await page.getByTestId('cp-inputs').textContent())).toBeGreaterThan(1);
        // …but the commit fired exactly once for the whole drag (a single undo entry).
        await expect(page.getByTestId('cp-changes')).toHaveText('1');

        // The color moved away from the initial grey toward a bright, saturated color (top-right corner).
        expect(await page.getByTestId('cp-model').textContent()).not.toBe('#808080');

        // The area thumb followed the pointer: left (saturation) is now high, up from 0% at the grey start.
        const style = (await page.locator('.ori-color-picker__area-thumb').getAttribute('style')) ?? '';
        const left = Number(style.match(/left:\s*([\d.]+)%/)?.[1]);
        expect(left).toBeGreaterThan(50);
    });

    test('a single click on the area (no drag) commits once', async ({ page }) => {
        const area = page.locator('.ori-color-picker__area');
        const box = (await area.boundingBox())!;

        await page.mouse.click(box.x + box.width - 3, box.y + 3); // top-right

        await expect(page.getByTestId('cp-changes')).toHaveText('1');
        expect(await page.getByTestId('cp-model').textContent()).not.toBe('#808080');
    });
});
